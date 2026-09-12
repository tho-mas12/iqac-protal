export interface ValidationError {
  row?: number;
  field: string;
  message: string;
  value?: any;
}

export function validateDynamicFormField(field: any, value: any): ValidationError | null {
  if (field.required && (value === undefined || value === null || value === '')) {
    return { field: field.label || field.id, message: `${field.label || 'Field'} is mandatory.` };
  }

  if (value !== undefined && value !== null && value !== '') {
    if (field.type === 'number' && isNaN(Number(value))) {
      return { field: field.label, message: `Must be a valid numerical value.` };
    }

    if (field.type === 'percentage') {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return { field: field.label, message: `Percentage must be between 0 and 100.` };
      }
    }

    if (field.type === 'date') {
      const d = new Date(value);
      if (isNaN(d.getTime())) {
        return { field: field.label, message: `Must be a valid date.` };
      }
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return { field: field.label, message: `Must be a valid email address.` };
      }
    }

    if (field.type === 'url') {
      try {
        new URL(String(value));
      } catch (e) {
        return { field: field.label, message: `Must be a valid URL (including http/https).` };
      }
    }
  }

  return null;
}

export function validateFacultyRecord(row: Record<string, any>, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!row.name || String(row.name).trim() === '') {
    errors.push({ row: rowIndex, field: 'name', message: 'Faculty name is required.' });
  }

  if (!row.departmentCode || String(row.departmentCode).trim() === '') {
    errors.push({ row: rowIndex, field: 'departmentCode', message: 'Department Code is required.' });
  }

  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.email))) {
    errors.push({ row: rowIndex, field: 'email', message: 'Invalid email address.' });
  }

  return errors;
}
