const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('./iqac_aaa/js/all-attributes-schema.json', 'utf8'));

const allMetrics = [];
Object.values(schema).forEach(card => {
  const cardTitle = card.cardTitle || card.title || `Attribute ${card.cardNumber}`;
  const cardId = card.id;
  if (card.sheets) {
    card.sheets.forEach(sheet => {
      allMetrics.push({
        id: `${cardId}_${sheet.key || sheet.sheetName}`,
        cardId,
        cardTitle,
        code: sheet.key || sheet.sheetName,
        title: sheet.title || sheet.name || sheet.sheetName,
        type: sheet.type || 'table',
        columnsCount: sheet.columns ? sheet.columns.length : 0,
        instruction: sheet.instruction || ''
      });
    });
  }
});

console.log('Total metrics/sheets found in schema:', allMetrics.length);
console.log('Sample metrics:');
allMetrics.slice(0, 15).forEach(m => console.log(`[${m.cardId}] ${m.code}: ${m.title} (${m.type})`));
