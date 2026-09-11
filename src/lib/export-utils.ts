/**
 * Export Utilities for IQAC Portal (Excel/CSV and PDF/Print Reports)
 */

export interface ExportColumn {
  header: string;
  key: string;
  format?: (value: any, item: any) => string;
}

/**
 * Exports tabular data to Excel-compatible CSV with UTF-8 BOM
 */
export function exportToExcel(
  filename: string,
  columns: ExportColumn[],
  data: any[]
) {
  const csvHeaders = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
  
  const csvRows = data.map((item) => {
    return columns
      .map((col) => {
        let val = item[col.key];
        if (col.format) {
          val = col.format(val, item);
        } else if (val === null || val === undefined) {
          val = '';
        } else if (val instanceof Date) {
          val = val.toLocaleDateString();
        } else {
          val = String(val);
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [csvHeaders, ...csvRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a styled printable window formatted for PDF export (A4 format with St. Joseph's College IQAC Header)
 */
export function printReport(
  title: string,
  subtitle: string,
  columns: ExportColumn[],
  data: any[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const headerHtml = `
    <div style="text-align: center; border-bottom: 2px solid #2a1b54; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="margin: 0; color: #2a1b54; font-size: 18px; text-transform: uppercase; font-family: Arial, sans-serif;">
        St. Joseph's College (Autonomous)
      </h2>
      <p style="margin: 2px 0; font-size: 11px; color: #555; font-family: Arial, sans-serif;">
        Special Heritage Status Awarded by UGC | Accredited at A++ Grade (Cycle IV) by NAAC | Tiruchirappalli - 620 002
      </p>
      <h3 style="margin: 6px 0 2px 0; color: #6320ee; font-size: 14px; font-weight: bold; font-family: Arial, sans-serif;">
        INTERNAL QUALITY ASSURANCE CELL (IQAC)
      </h3>
      <h4 style="margin: 4px 0 0 0; color: #1e293b; font-size: 13px; font-weight: bold; font-family: Arial, sans-serif;">
        ${title}
      </h4>
      <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-family: Arial, sans-serif;">
        ${subtitle} &bull; Generated on: ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  const tableHeaders = columns
    .map((col) => `<th style="border: 1px solid #cbd5e1; padding: 7px 6px; background-color: #f1f5f9; font-size: 10px; text-transform: uppercase; color: #334155; font-family: Arial, sans-serif;">${col.header}</th>`)
    .join('');

  const tableRows = data
    .map((item, idx) => {
      const cells = columns
        .map((col) => {
          let val = item[col.key];
          if (col.format) {
            val = col.format(val, item);
          } else if (val === null || val === undefined) {
            val = '-';
          } else if (val instanceof Date) {
            val = val.toLocaleDateString();
          }
          return `<td style="border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 10px; color: #1e293b; font-family: Arial, sans-serif;">${val}</td>`;
        })
        .join('');
      return `<tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">${cells}</tr>`;
    })
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 8px;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${headerHtml}
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div style="margin-top: 35px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: #334155; font-family: Arial, sans-serif;">
          <div>Prepared By: ___________________</div>
          <div>Dean / HOD Signature: ___________________</div>
          <div>Director, IQAC: ___________________</div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
