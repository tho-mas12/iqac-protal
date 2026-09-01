import fs from 'fs';
import path from 'path';

export interface DriveUploadResult {
  isDrive: boolean;
  fileId: string;
  webViewLink: string;
  downloadLink?: string;
  localPath?: string;
}

export function isDriveConfigured(): boolean {
  return false;
}

export async function createDepartmentFolder(deptName: string, shift: string = 'Shift I'): Promise<string | null> {
  // No filesystem or drive operations needed
  return `dept_${deptName}_${shift}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  departmentName: string,
  shift: string = 'Shift I',
  driveFolderId?: string | null
): Promise<DriveUploadResult> {
  const safeFolderName = `${departmentName}_${shift}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
  const effectiveMime = mimeType || 'image/png';
  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${effectiveMime};base64,${base64Data}`;

  // 1. If a PHP upload endpoint is configured, forward the file to cPanel PHP storage
  const phpUploadEndpoint = process.env.PHP_UPLOAD_URL;
  if (phpUploadEndpoint) {
    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(buffer)], { type: effectiveMime });
      formData.append('file', blob, uniqueFileName);

      const res = await fetch(phpUploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          return {
            isDrive: false,
            fileId: uniqueFileName,
            webViewLink: data.url,
            downloadLink: data.url,
            localPath: data.url,
          };
        }
      }
    } catch (e) {
      console.warn('PHP upload endpoint error, falling back to database storage:', e);
    }
  }

  // 2. Try saving to local public folder if on local environment (safe fallback)
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolderName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);
  } catch (e) {}

  return {
    isDrive: false,
    fileId: uniqueFileName,
    webViewLink: dataUrl,
    downloadLink: dataUrl,
    localPath: dataUrl,
  };
}

export async function testDriveConnection(): Promise<{
  connected: boolean;
  message: string;
  email?: string;
}> {
  return {
    connected: true,
    message: 'Database storage active.',
  };
}

