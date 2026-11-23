import fs from 'fs';
import path from 'path';

const MQC_FILE_PATH = path.join(process.cwd(), 'data', 'mqc_members.json');

export interface MqcConfig {
  departments: string[]; // List of department IDs or codes
  updatedAt: string;
}

export function getMqcMembers(): string[] {
  try {
    if (!fs.existsSync(MQC_FILE_PATH)) {
      // Default to Computer Science and Commerce as sample initial MQC departments
      const initial: MqcConfig = {
        departments: ['CS_S1', 'CS_S2', 'COM_S1'],
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(MQC_FILE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial.departments;
    }
    const raw = fs.readFileSync(MQC_FILE_PATH, 'utf8');
    const parsed: MqcConfig = JSON.parse(raw);
    return Array.isArray(parsed.departments) ? parsed.departments : [];
  } catch (err) {
    console.error('Error reading MQC members:', err);
    return [];
  }
}

export function setMqcMembers(departmentCodes: string[]): boolean {
  try {
    const data: MqcConfig = {
      departments: Array.from(new Set(departmentCodes)),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(MQC_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving MQC members:', err);
    return false;
  }
}

export function checkIsMqcMember(departmentCode?: string | null, departmentId?: string | null): boolean {
  if (!departmentCode && !departmentId) return false;
  const list = getMqcMembers().map((s) => s.toUpperCase());
  if (departmentCode && list.includes(departmentCode.toUpperCase())) return true;
  if (departmentId && list.includes(departmentId.toUpperCase())) return true;
  return false;
}
