/**
 * export-json.js
 * Exports the emperors table to frontend/public/emperors.json
 * Run: node src/seed/export-json.js
 */

const path = require('path');
const fs = require('fs');
const { createDB } = require('../db');

const OUT = path.resolve(__dirname, '../../../../roman-emperors/frontend/public/emperors.json');
// Resolve relative to this file's location
const OUT2 = path.resolve(__dirname, '../../../frontend/public/emperors.json');

function main() {
  const db = createDB();
  const rows = db.query(
    'SELECT id, name, birth_year, death_year, reign_start, reign_end, dynasty, wikipedia_url, image_url, summary FROM emperors ORDER BY reign_start ASC NULLS LAST, id ASC'
  );
  db.close();

  const outPath = fs.existsSync(path.dirname(OUT2)) ? OUT2 : OUT;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(`✅ Wrote ${rows.length} emperors → ${outPath}`);
}

main();
