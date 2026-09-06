import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

let syncAttempted = false;

export async function autoSyncDatabaseColumns() {
  if (syncAttempted) return;
  syncAttempted = true;

  try {
    // 1. Ensure SystemSettings exists
    const existingSettings = await prisma.systemSettings.findUnique({
      where: { id: 'default' },
    });

    if (!existingSettings) {
      await prisma.systemSettings.create({
        data: {
          id: 'default',
          whatsappSenderNumber: '9626806328',
          whatsappReceiverNumber: '7418671366',
          whatsappEnabled: true,
          whatsappProvider: 'ultramsg',
        },
      });
    }

    // 2. Self-healing database: Check if users exist. If not, auto-seed default accounts
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('[Auto-Sync] No users found. Initializing default accounts...');
      const defaultDeptPassword = await bcrypt.hash('sjciqac', 10);
      const directorPassword = await bcrypt.hash('director123', 10);
      const staffPassword = await bcrypt.hash('staff123', 10);
      const adminPassword = await bcrypt.hash('admin123', 10);

      // Create Admin
      await prisma.user.create({
        data: {
          username: 'admin',
          password: adminPassword,
          name: 'IQAC Administrator',
          role: 'ADMIN',
          isPasswordChanged: true,
        },
      });

      // Create Director
      await prisma.user.create({
        data: {
          username: 'director',
          password: directorPassword,
          name: 'Dr. S. Albert',
          role: 'DIRECTOR',
          isPasswordChanged: true,
        },
      });

      // Create Staff
      await prisma.user.create({
        data: {
          username: 'staff',
          password: staffPassword,
          name: 'Mr. Ajay James',
          role: 'STAFF',
          isPasswordChanged: true,
        },
      });

      // Create Departments
      const departmentsData = [
        { name: 'Computer Science', code: 'CS', shift: 'Shift I', user: 'cs_shift1', folderId: 'local_Computer_Science_Shift_I' },
        { name: 'Computer Science', code: 'CS_S2', shift: 'Shift II', user: 'cs_shift2', folderId: 'local_Computer_Science_Shift_II' },
        { name: 'Mathematics', code: 'MATHS', shift: 'Shift I', user: 'maths_shift1', folderId: 'local_Mathematics_Shift_I' },
        { name: 'Physics', code: 'PHY', shift: 'Shift I', user: 'physics_shift1', folderId: 'local_Physics_Shift_I' },
        { name: 'Commerce', code: 'COMM_S1', shift: 'Shift I', user: 'commerce_shift1', folderId: 'local_Commerce_Shift_I' },
        { name: 'Commerce', code: 'COMM_S2', shift: 'Shift II', user: 'commerce_shift2', folderId: 'local_Commerce_Shift_II' },
        { name: 'English', code: 'ENG', shift: 'Shift I', user: 'english_shift1', folderId: 'local_English_Shift_I' },
        { name: 'Business Administration', code: 'BBA', shift: 'Shift II', user: 'bba_shift2', folderId: 'local_Business_Administration_Shift_II' },
      ];

      for (const dept of departmentsData) {
        const d = await prisma.department.create({
          data: {
            name: dept.name,
            code: dept.code,
            shift: dept.shift,
            driveFolderId: dept.folderId,
          },
        });

        await prisma.user.create({
          data: {
            username: dept.user,
            password: defaultDeptPassword,
            name: `${dept.name} Department (${dept.shift})`,
            role: 'DEPARTMENT',
            departmentId: d.id,
            isPasswordChanged: false,
          },
        });
      }
      console.log('[Auto-Sync] Database accounts initialized successfully.');
    }
  } catch (e) {
    console.error('[Auto-Sync Error]', e);
  }
}
