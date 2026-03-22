require('dotenv').config();
const { scrapeEmperors } = require('./scraper');
const { createDB } = require('../db');
const { createEmperorsService } = require('../services/emperors');

async function main() {
  console.log('=== Roman Emperors Seeder ===\n');

  let db;
  try {
    db = createDB();
    const service = createEmperorsService(db);

    const emperors = await scrapeEmperors();
    console.log(`\nInserting ${emperors.length} emperors into database...`);

    let inserted = 0;
    let updated = 0;
    for (const emperor of emperors) {
      const id = service.upsertEmperor(emperor);
      if (typeof id === 'number') {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`Done! ${inserted} inserted, ${updated} updated.`);
  } catch (err) {
    console.error('Seeder failed:', err);
    process.exit(1);
  } finally {
    if (db) db.close();
  }
}

main();
