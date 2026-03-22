const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function createSQLiteDB(dbPath) {
  const resolvedPath = path.resolve(dbPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS emperors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birth_year INTEGER,
      death_year INTEGER,
      reign_start INTEGER,
      reign_end INTEGER,
      dynasty TEXT,
      wikipedia_url TEXT,
      image_url TEXT,
      summary TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  function query(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  }

  function run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }

  function close() {
    db.close();
  }

  return { query, run, close };
}

module.exports = { createSQLiteDB };
