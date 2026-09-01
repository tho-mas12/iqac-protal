# IQAC Portal - Report Checklist Management System

A high-performance, full-stack web portal for the **Internal Quality Assurance Cell (IQAC)** to manage department event invitation submissions, director checklist verification, revisions, and approval workflows, with seamless **Google Drive folder & image storage integration**.

---

## Key Features

### 1. **Multi-Role Authentication & Access Control**
- **Department Portal**: Upload event invitations, view status, track remarks, in-card re-upload of corrected invitations (with automatic revision tracking), and password management.
- **Director Portal**: 24-hour pending queue, live stats, split-screen inspection viewer, checklist verification (`Logo`, `Title`, `Headers`, `Others`), 1-click approval, remark editing, and department summary inspector.
- **Staff Portal**: Approved invitations dashboard with interactive **"Hard Copy Received"** toggle switch.
- **Admin Portal**: Register departments (with automatic Google Drive folder creation), Access Department (1-click password reset to default `sjciqac`), and Access Control (manage Director, Staff, Admin credentials).

### 2. **Google Drive Cloud Storage Engine**
- **Automated Department Isolation**: When a department is registered by the Admin, the system automatically calls Google Drive API to create a dedicated department folder.
- **Direct Image/Document Streaming**: Invitation images are streamed directly to the respective department folder in Google Drive.
- **Zero Database Bloat**: Database only stores metadata and Google Drive file links (`webViewLink`, `fileId`), keeping the server ultra-fast and traffic-efficient.
- **Zero-Setup Local Fallback**: If Google Drive credentials are not yet configured, the system seamlessly operates in local storage preview mode without crashing.

---

## Default Login Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Department** (CS Shift I) | `cs_shift1` | `sjciqac` | Default password for all departments is `sjciqac` |
| **Department** (Maths Shift I) | `maths_shift1` | `sjciqac` | Can be changed from the Info page |
| **Department** (Commerce Shift II) | `commerce_shift2` | `sjciqac` | Can be reset to `sjciqac` by Admin |
| **Director** | `director` | `director123` | Full verification & approval powers |
| **Staff** | `staff` | `staff123` | Hard copy tracking & approved archive |
| **Admin** | `admin` | `admin123` | Department & Access Control management |

---

## How to Connect Your Google Account & Google Drive API

1. **Enable Google Drive API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project (e.g. `IQAC Portal`) and enable the **Google Drive API** from *APIs & Services > Library*.

2. **Create a Service Account**:
   - Navigate to *APIs & Services > Credentials > Create Credentials > Service Account*.
   - In the newly created Service Account, go to the **Keys** tab, click **Add Key > Create New Key (JSON)**, and download the file.

3. **Create Root Folder in Google Drive**:
   - Open your Google Drive and create a master folder (e.g., `IQAC_Portal_Root`).
   - Click **Share** on this folder and paste your Service Account email (e.g., `xyz@project.iam.gserviceaccount.com`) as **Editor**.
   - Copy the Folder ID from the URL (the text after `folders/`).

4. **Update `.env`**:
   Add the credentials to your `.env` file:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_DRIVE_PARENT_FOLDER_ID="your_google_drive_parent_folder_id"
   ```

---

## Running the Application

```bash
# Install dependencies
npm install

# Push database schema & seed initial data
npx prisma db push
node prisma/seed.js

# Run development server
npm run dev

# Or build & start production server
npm run build
npm run start
```

Access the portal in your browser at `http://localhost:3000`.
