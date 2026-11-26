import fs from 'fs';
import path from 'path';

export interface SystemSettings {
  developmentMode: boolean;
  activeYear: string;
  academicYears: string[];
  updatedAt?: string;
  updatedBy?: string;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'system_settings.json');

const DEFAULT_SETTINGS: SystemSettings = {
  developmentMode: false,
  activeYear: '2026 - 2027',
  academicYears: [
    '2023 - 2024',
    '2024 - 2025',
    '2025 - 2026',
    '2026 - 2027',
    '2027 - 2028'
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'SYSTEM',
};

export function getSystemSettings(): SystemSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        academicYears: Array.isArray(parsed.academicYears) && parsed.academicYears.length > 0
          ? parsed.academicYears
          : DEFAULT_SETTINGS.academicYears,
      };
    }
  } catch (err) {
    console.error('Error reading system_settings.json:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  const current = getSystemSettings();
  const updated: SystemSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving system_settings.json:', err);
  }

  return updated;
}
