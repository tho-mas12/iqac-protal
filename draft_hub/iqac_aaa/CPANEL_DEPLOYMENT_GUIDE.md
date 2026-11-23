# IQAC Annual Academic Audit (AAA) 2026-2027
## cPanel & MySQL (phpMyAdmin) Deployment Guide
**St. Joseph's College (Autonomous), Tiruchirappalli**

---

### Overview & Architecture
This platform is built on a lightweight, secure, and production-ready **LAMP** stack (Linux, Apache, MySQL, PHP 7.4/8.x). It requires **zero Node.js or command-line build steps** on your server. All frontend assets (Tailwind CSS, Chart.js, Lucide Icons) are fully bundled locally in the `vendor/` folder, ensuring ultra-fast loading without depending on external CDNs.

A pre-packaged archive **`iqac_aaa_cpanel.zip`** (approx. 0.45 MB) has already been created in this folder, ready to be uploaded directly to cPanel.

---

### Step-by-Step Deployment Instructions

#### Step 1: Create Database & User in cPanel
1. Log in to your **cPanel** account (e.g. `https://yourdomain.com:2083`).
2. In the **Databases** section, click on **MySQL® Databases**.
3. Under **Create New Database**:
   - Enter a name, e.g., `iqac_aaa`.
   - Your full database name will be prefixed by your cPanel username, e.g., `mycollege_iqac_aaa`.
   - Click **Create Database**.
4. Under **Add New User**:
   - Enter a username, e.g., `iqac_user` (full username will be `mycollege_iqac_user`).
   - Click **Password Generator** to create a strong password (copy it to a secure note!).
   - Click **Create User**.
5. Under **Add User To Database**:
   - Select the user you just created (`mycollege_iqac_user`).
   - Select the database you just created (`mycollege_iqac_aaa`).
   - Click **Add**.
   - In the privileges screen, check **ALL PRIVILEGES** and click **Make Changes**.

---

#### Step 2: Upload Files via cPanel File Manager
1. In cPanel, click on **File Manager**.
2. Navigate to your desired directory:
   - If hosting on root domain (e.g. `https://audit.sjctni.edu`): go inside `public_html`.
   - If hosting in a subfolder (e.g. `https://sjctni.edu/aaa2027`): create a folder named `aaa2027` inside `public_html` and enter it.
3. Click the **Upload** button on the top toolbar.
4. Drag and drop the **`iqac_aaa_cpanel.zip`** file from your local computer.
5. Once the progress bar turns green (100% complete), return to the File Manager.
6. Right-click on `iqac_aaa_cpanel.zip` and select **Extract** &rarr; **Extract File(s)**.
7. You may now delete the zip file to keep the folder tidy.

---

#### Step 3: Configure Database Credentials
1. In the extracted folder inside File Manager, open the **`config`** folder.
2. Right-click on **`db.php`** and click **Edit**.
3. Update lines 11–14 with the database details you created in Step 1:

```php
define('DB_HOST', 'localhost');                  // Usually localhost on cPanel
define('DB_NAME', 'mycollege_iqac_aaa');          // Your full cPanel DB name
define('DB_USER', 'mycollege_iqac_user');         // Your full cPanel DB user
define('DB_PASS', 'YourStrongPasswordHere');     // The user password you set
```

4. Click **Save Changes** in the top-right corner.

---

#### Step 4: Run 1-Click Database Setup & Seeding
1. Open your web browser and navigate to:
   ```text
   https://yourdomain.com/install.php
   (or https://yourdomain.com/aaa2027/install.php)
   ```
2. The web installer will test your database credentials.
3. Click the green button: **"Run Database Installation & Seed Tables"**.
4. The installer will automatically:
   - Create all 4 required tables: `departments`, `users`, `audit_submissions`, and `audit_evaluations`.
   - Seed the initial departments across Arts, Science, Computing, and Management.
   - Seed sample audit data for Computer Science and Commerce.
5. **Security Best Practice**: Once you see the green success message, return to File Manager and delete `install.php` (or rename it to `install.php.bak`) to prevent unauthorized re-initialization.

---

### Step 5: Default Login Credentials

| Role | Username | Default Password | Access Level |
| :--- | :--- | :--- | :--- |
| **IQAC Administrator** | `admin` | `admin123` | Full College Console, all departments, status locking, rubric scoring, meeting presentation launcher |
| **CS Department** | `cs` | `cs123` | Computer Science form entry, preview dashboard, final submission |
| **Commerce Department** | `commerce` | `commerce123` | Commerce form entry, preview dashboard, final submission |
| **Physics Department** | `physics` | `physics123` | Physics form entry, preview dashboard |
| **Chemistry Department** | `chemistry` | `chemistry123` | Chemistry form entry, preview dashboard |
| **Maths Department** | `maths` | `maths123` | Mathematics form entry, preview dashboard |
| **English Department** | `english` | `english123` | English form entry, preview dashboard |

> [!TIP]
> Passwords can be changed directly in phpMyAdmin under the `users` table or by generating new bcrypt hashes via PHP `password_hash()`.

---

### How to Use the System During AAA 2026–2027

#### 1. Department Data Entry Workflow
- Department heads/coordinators log in using their departmental account (e.g. `cs` / `cs123`).
- They can navigate through **Attribute 1 to Attribute 8** and the **Qualitative Review** sections.
- As data is typed into tables or fields, the system **auto-saves** changes to the MySQL database.
- Departments can click **"Switch to Dashboard"** at any moment to preview their 15-minute executive presentation with live charts.
- When ready, clicking **"Submit Audit for Review"** marks their submission as `submitted` in the IQAC console.

#### 2. IQAC Admin Dashboard & Meeting Presentation
- IQAC Director / Coordinator logs in as `admin` / `admin123`.
- The **Admin Console** displays:
  - College-wide aggregate statistics: total publications, funded grants (₹ Lakhs), patents, value-added courses, and submission pipeline progress.
  - Department cards with colored status badges (`Submitted`, `In Progress`, `Draft`, `Audited`).
  - Search and School-wise filter bar.
- **During the Review Meeting**:
  - The Admin simply clicks **"Launch Meeting Presentation"** on the department being reviewed.
  - This immediately enters full-screen projector-ready presentation mode with the **60-minute AAA timer**:
    - **First 15 Minutes**: Departmental Dashboard with KPIs, attribute breakdowns, and Chart.js analytics.
    - **Followed by 30 Minutes**: Signature Achievements, Verifiable Impact, Uniqueness, SWOC Analysis, Best Practices, Future Plans, Remedial Coaching, Stakeholder Feedback, and Sustainability.
    - **Last 15 Minutes**: Expert & Administrator interaction panel with a 40-point rubric scorecard, automatic grade calculation (A++, A+, A, etc.), and digital sign-offs.
  - At the end of the meeting, the committee's commendations, recommendations, and grade are saved directly to MySQL, and the department is marked as `Audited`.

---

### Database Management via phpMyAdmin

You can inspect or manage your database at any time through cPanel:
1. In cPanel, click on **phpMyAdmin**.
2. Select your database from the left sidebar.
3. Key tables to note:
   - **`departments`**: List of all academic departments, codes, schools, HOD names, audit dates, and lock statuses.
   - **`users`**: Login credentials and department associations.
   - **`audit_submissions`**: The JSON payload containing all tabular and qualitative data filled by each department.
   - **`audit_evaluations`**: The scores, grades, commendations, recommendations, and expert sign-offs recorded during the 15-minute panel interaction.

---

### Local Testing (Offline Without cPanel)
If you want to test or present locally on any laptop without an internet connection or cPanel:
1. Double-click **`start_dashboard.bat`** (or run `python run_dashboard.py`).
2. The browser will automatically open `http://localhost:8000`.
3. The built-in multithreaded server simulates all PHP API endpoints and MySQL sessions completely in memory, allowing 100% full functionality offline.
