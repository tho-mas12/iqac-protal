const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('./iqac_aaa/js/all-attributes-schema.json', 'utf8'));
console.log('Schema[0]:', JSON.stringify(schema[0], null, 2).slice(0, 1000));
console.log('\nSchema[1] keys:', Object.keys(schema[1]));
if (schema[1].sheets) {
  console.log('Schema[1] sheets first item:', JSON.stringify(schema[1].sheets[0], null, 2).slice(0, 1000));
}
