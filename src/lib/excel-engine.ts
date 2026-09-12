import * as XLSX from 'xlsx';

export interface ColumnMapping {
  excelColumn: string;
  targetField: string;
}

export interface ImportPreviewResult {
  totalRows: number;
  validRows: any[];
  invalidRows: { rowNumber: number; data: any; errors: string[] }[];
  duplicateRows: { rowNumber: number; data: any; reason: string }[];
  summary: {
    total: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  };
}

export function parseExcelBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetNames = workbook.SheetNames;
  const dataPerSheet: Record<string, any[]> = {};

  sheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    dataPerSheet[name] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  });

  return { sheetNames, dataPerSheet };
}

export function validateAndMapImportData(
  rawData: any[],
  columnMapping: Record<string, string>, // excelCol -> targetField
  requiredFields: string[] = [],
  uniqueField?: string
): ImportPreviewResult {
  const validRows: any[] = [];
  const invalidRows: { rowNumber: number; data: any; errors: string[] }[] = [];
  const duplicateRows: { rowNumber: number; data: any; reason: string }[] = [];
  const seenUniqueValues = new Set<string>();

  rawData.forEach((row, idx) => {
    const rowNumber = idx + 2; // 1-based index including header
    const mappedRow: Record<string, any> = {};

    // Map columns
    Object.keys(columnMapping).forEach((excelCol) => {
      const targetField = columnMapping[excelCol];
      if (targetField && targetField !== 'ignore') {
        mappedRow[targetField] = row[excelCol] !== undefined ? row[excelCol] : '';
      }
    });

    const rowErrors: string[] = [];

    // Required fields check
    requiredFields.forEach((reqF) => {
      if (!mappedRow[reqF] || String(mappedRow[reqF]).trim() === '') {
        rowErrors.push(`Missing mandatory field: ${reqF}`);
      }
    });

    // Unique field check
    if (uniqueField && mappedRow[uniqueField]) {
      const val = String(mappedRow[uniqueField]).trim().toLowerCase();
      if (seenUniqueValues.has(val)) {
        duplicateRows.push({
          rowNumber,
          data: mappedRow,
          reason: `Duplicate value in column '${uniqueField}': ${mappedRow[uniqueField]}`,
        });
        return;
      }
      seenUniqueValues.add(val);
    }

    if (rowErrors.length > 0) {
      invalidRows.push({ rowNumber, data: mappedRow, errors: rowErrors });
    } else {
      validRows.push({ rowNumber, data: mappedRow });
    }
  });

  return {
    totalRows: rawData.length,
    validRows,
    invalidRows,
    duplicateRows,
    summary: {
      total: rawData.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      duplicateCount: duplicateRows.length,
    },
  };
}

export function generateExcelBuffer(data: any[], sheetName: string = 'Report'): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function generateCSVContent(data: any[]): string {
  if (!data || data.length === 0) return '';
  const worksheet = XLSX.utils.json_to_sheet(data);
  return XLSX.utils.sheet_to_csv(worksheet);
}
