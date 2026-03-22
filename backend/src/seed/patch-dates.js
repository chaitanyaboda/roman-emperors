/**
 * patch-dates.js
 * Corrects known bad reign dates in the DB (scraper artefacts).
 *
 * Two classes of bugs:
 *  1. reign_start = null  → set to reign_end (very short reigns, same year)
 *  2. reign_end = tiny number (day artefact) → correct historical year
 */

const { createDB } = require('../db');

// [name, correct_reign_start, correct_reign_end]
// null means "leave as-is"
const CORRECTIONS = [
  // ── Null reign_start (short / same-year reigns) ─────────────────────────
  ['Diadumenian',        218,  218],
  ['Gordian I',          238,  238],
  ['Gordian II',         238,  238],
  ['Pupienus',           238,  238],
  ['Balbinus',           238,  238],
  ['Herennius Etruscus', 250,  251],
  ['Hostilian',          251,  251],
  ['Aemilianus',         253,  253],
  ['Quintillus',         270,  270],
  ['Florianus',          276,  276],
  ['Martinian',          324,  324],
  ['Olybrius',           472,  472],
  ['Nepotianus',         350,  350],
  ['Constantius III',    421,  421],
  ['Petronius Maximus',  455,  455],
  ['Leo II',             474,  474],
  ['Saloninus',          260,  260],
  ['Constantine III',    407,  411],

  // ── reign_end grabbed the day number instead of the year ────────────────
  ['Diocletian',         284,  305],
  ['Constantine I',      306,  337],
  ['Licinius',           308,  324],
  ['Constantius II',     337,  361],
  ['Valentinian I',      364,  375],
  ['Magnus Maximus',     383,  388],
];

function main() {
  const db = createDB();
  let fixed = 0;

  for (const [name, start, end] of CORRECTIONS) {
    const row = db.query('SELECT id, reign_start, reign_end FROM emperors WHERE name = ?', [name])[0];
    if (!row) {
      console.warn(`  ⚠️  Not found: ${name}`);
      continue;
    }
    db.run(
      'UPDATE emperors SET reign_start = ?, reign_end = ? WHERE id = ?',
      [start, end, row.id]
    );
    console.log(`  ✅ ${name}: ${row.reign_start}→${row.reign_end}  fixed to  ${start}→${end}`);
    fixed++;
  }

  console.log(`\nDone. ${fixed} rows updated.`);
  db.close();
}

main();
