import fs from 'fs';
import path from 'path';

const ROLES_FILE_PATH = path.join(process.cwd(), 'data', 'academic_roles.json');
const MQC_FILE_PATH = path.join(process.cwd(), 'data', 'mqc_members.json');

export interface AcademicRolesData {
  mqcDepartments: string[]; // Department codes or User IDs that are MQC members
  hodUsers: string[];        // Usernames or Department codes designated as HOD
  userDesignations: Record<string, { designation?: string; isMqc?: boolean; isHod?: boolean }>;
  updatedAt: string;
}

export function getAcademicRoles(): AcademicRolesData {
  try {
    if (!fs.existsSync(ROLES_FILE_PATH)) {
      // Default initial data
      const initial: AcademicRolesData = {
        mqcDepartments: ['CS_S1', 'CS_S2', 'COM_S1', 'MAT_S1', 'AI_S2'],
        hodUsers: ['cs_s1', 'com_s1', 'mat_s1', 'ai_s2', 'biochem_s2', 'biotech_s2'],
        userDesignations: {},
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(ROLES_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(ROLES_FILE_PATH, 'utf8');
    const parsed: AcademicRolesData = JSON.parse(raw);
    return {
      mqcDepartments: Array.isArray(parsed.mqcDepartments) ? parsed.mqcDepartments : [],
      hodUsers: Array.isArray(parsed.hodUsers) ? parsed.hodUsers : [],
      userDesignations: parsed.userDesignations || {},
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error reading academic roles:', err);
    return {
      mqcDepartments: ['CS_S1', 'CS_S2', 'COM_S1'],
      hodUsers: ['cs_s1', 'com_s1'],
      userDesignations: {},
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveAcademicRoles(data: Partial<AcademicRolesData>): boolean {
  try {
    const current = getAcademicRoles();
    const updated: AcademicRolesData = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(ROLES_FILE_PATH, JSON.stringify(updated, null, 2), 'utf8');

    // Also synchronize mqc_members.json for backward compatibility
    if (data.mqcDepartments) {
      fs.writeFileSync(
        MQC_FILE_PATH,
        JSON.stringify({ departments: data.mqcDepartments, updatedAt: updated.updatedAt }, null, 2),
        'utf8'
      );
    }

    return true;
  } catch (err) {
    console.error('Error saving academic roles:', err);
    return false;
  }
}

export function checkUserIsMqc(username?: string | null, deptCode?: string | null): boolean {
  const roles = getAcademicRoles();
  const uname = (username || '').trim().toLowerCase();
  const unameUpper = uname.toUpperCase();
  const dCodeUpper = (deptCode || '').trim().toUpperCase();

  // 1. Explicit user designation has highest priority
  if (uname && roles.userDesignations[uname]?.isMqc !== undefined) {
    return Boolean(roles.userDesignations[uname]?.isMqc);
  }
  if (uname && roles.userDesignations[unameUpper]?.isMqc !== undefined) {
    return Boolean(roles.userDesignations[unameUpper]?.isMqc);
  }

  // 2. Check department or username lists
  const list = roles.mqcDepartments.map((s) => s.toUpperCase());
  if (dCodeUpper && list.includes(dCodeUpper)) return true;
  if (unameUpper && list.includes(unameUpper)) return true;

  // 3. Check faculty_directory.json if present
  try {
    const facPath = path.join(process.cwd(), 'data', 'faculty_directory.json');
    if (fs.existsSync(facPath)) {
      const facData = JSON.parse(fs.readFileSync(facPath, 'utf8'));
      const f = (facData.faculty || []).find(
        (x: any) => x.username?.toLowerCase() === uname || x.code?.toLowerCase() === uname
      );
      if (f && f.isMqc !== undefined) {
        return Boolean(f.isMqc);
      }
    }
  } catch {}

  return false;
}

export function checkUserIsHod(username?: string | null, deptCode?: string | null): boolean {
  const roles = getAcademicRoles();
  const uname = (username || '').trim().toLowerCase();
  const unameUpper = uname.toUpperCase();
  const dCodeUpper = (deptCode || '').trim().toUpperCase();

  // 1. Explicit user designation has highest priority
  if (uname && roles.userDesignations[uname]?.isHod !== undefined) {
    return Boolean(roles.userDesignations[uname]?.isHod);
  }
  if (uname && roles.userDesignations[unameUpper]?.isHod !== undefined) {
    return Boolean(roles.userDesignations[unameUpper]?.isHod);
  }

  // 2. Check HOD list
  const list = roles.hodUsers.map((s) => s.toUpperCase());
  if (unameUpper && list.includes(unameUpper)) return true;
  if (dCodeUpper && list.includes(dCodeUpper)) return true;

  // 3. Check faculty_directory.json if present
  try {
    const facPath = path.join(process.cwd(), 'data', 'faculty_directory.json');
    if (fs.existsSync(facPath)) {
      const facData = JSON.parse(fs.readFileSync(facPath, 'utf8'));
      const f = (facData.faculty || []).find(
        (x: any) => x.username?.toLowerCase() === uname || x.code?.toLowerCase() === uname
      );
      if (f && f.isHod !== undefined) {
        return Boolean(f.isHod);
      }
    }
  } catch {}

  return false;
}
