import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export interface DriveUploadResult {
  isDrive: boolean;
  fileId: string;
  webViewLink: string;
  downloadLink?: string;
  localPath?: string;
}

export function isDriveConfigured(): boolean {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      return true;
    } catch {
      // maybe base64?
      try {
        const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf8');
        JSON.parse(decoded);
        return true;
      } catch {}
    }
  }
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  );
}

function getGoogleAuthClient() {
  if (!isDriveConfigured()) return null;

  try {
    let credentials: any = null;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      } catch {
        const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON, 'base64').toString('utf8');
        credentials = JSON.parse(decoded);
      }
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      credentials = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    }

    if (!credentials) return null;

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    return auth;
  } catch (error) {
    console.error('Error initializing Google Auth Client:', error);
    return null;
  }
}

export async function createDepartmentFolder(deptName: string, shift: string = 'Shift I'): Promise<string | null> {
  const auth = getGoogleAuthClient();
  if (!auth) {
    console.log(`[Drive Fallback] Drive not configured. Using local folder for "${deptName}"`);
    const localDir = path.join(process.cwd(), 'public', 'uploads', `${deptName}_${shift}`.replace(/[^a-zA-Z0-9_-]/g, '_'));
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return `local_${deptName}_${shift}`;
  }

  try {
    const drive = google.drive({ version: 'v3', auth });
    const folderName = `${deptName} (${shift})`;
    const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

    // Search if folder already exists
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    const searchRes = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      return searchRes.data.files[0].id || null;
    }

    // Create new folder in Drive
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const folder = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, webViewLink',
    });

    const folderId = folder.data.id || null;

    // Make folder accessible with link
    if (folderId) {
      try {
        await drive.permissions.create({
          fileId: folderId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permErr) {
        console.warn('Could not set public permissions on drive folder:', permErr);
      }
    }

    return folderId;
  } catch (error) {
    console.error('Error creating Google Drive folder:', error);
    return null;
  }
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  departmentName: string,
  shift: string = 'Shift I',
  driveFolderId?: string | null
): Promise<DriveUploadResult> {
  const auth = getGoogleAuthClient();

  if (!auth) {
    // Save to local fallback storage in public/uploads/
    const safeFolderName = `${departmentName}_${shift}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolderName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeFolderName}/${uniqueFileName}`;
    return {
      isDrive: false,
      fileId: `local_${uniqueFileName}`,
      webViewLink: publicUrl,
      downloadLink: publicUrl,
      localPath: publicUrl,
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth });

    let targetFolderId = driveFolderId;
    if (!targetFolderId) {
      targetFolderId = await createDepartmentFolder(departmentName, shift);
    }

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata: any = {
      name: `${Date.now()}_${fileName}`,
    };

    if (targetFolderId && !targetFolderId.startsWith('local_')) {
      fileMetadata.parents = [targetFolderId];
    }

    const media = {
      mimeType: mimeType || 'image/jpeg',
      body: stream,
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink, thumbnailLink',
    });

    const fileId = res.data.id || '';

    // Set permission so it can be viewed by Director/Staff
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permErr) {
      console.warn('Could not set permissions on drive file:', permErr);
    }

    // Direct embeddable/viewable drive link
    const viewLink = res.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    const downloadLink = res.data.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`;

    return {
      isDrive: true,
      fileId: fileId,
      webViewLink: viewLink,
      downloadLink: downloadLink,
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    // Fallback to local
    const safeFolderName = `${departmentName}_${shift}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolderName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uniqueFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${safeFolderName}/${uniqueFileName}`;

    return {
      isDrive: false,
      fileId: `local_${uniqueFileName}`,
      webViewLink: publicUrl,
      downloadLink: publicUrl,
      localPath: publicUrl,
    };
  }
}

export async function testDriveConnection(): Promise<{
  connected: boolean;
  message: string;
  email?: string;
}> {
  const auth = getGoogleAuthClient();
  if (!auth) {
    return {
      connected: false,
      message: 'Google Drive credentials are not configured in environment variables. Running in local fallback mode.',
    };
  }

  try {
    const drive = google.drive({ version: 'v3', auth });
    const about = await drive.about.get({ fields: 'user, storageQuota' });
    const userEmail = about.data.user?.emailAddress || 'Connected Service Account';

    return {
      connected: true,
      message: `Successfully connected to Google Drive API as ${userEmail}`,
      email: userEmail,
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Failed to connect to Google Drive API: ${error.message || error}`,
    };
  }
}
