function createEmperorsService(db) {
  function getAllEmperors() {
    return db.query(
      'SELECT * FROM emperors ORDER BY reign_start ASC NULLS LAST, id ASC'
    );
  }

  function getEmperorById(id) {
    const rows = db.query('SELECT * FROM emperors WHERE id = ?', [id]);
    return rows[0] || null;
  }

  function upsertEmperor(emperor) {
    const existing = db.query('SELECT id FROM emperors WHERE name = ? AND reign_start = ?', [
      emperor.name,
      emperor.reign_start,
    ]);

    if (existing.length > 0) {
      db.run(
        `UPDATE emperors SET
          birth_year = ?, death_year = ?, reign_end = ?, dynasty = ?,
          wikipedia_url = ?, image_url = ?, summary = ?
         WHERE id = ?`,
        [
          emperor.birth_year,
          emperor.death_year,
          emperor.reign_end,
          emperor.dynasty,
          emperor.wikipedia_url,
          emperor.image_url,
          emperor.summary,
          existing[0].id,
        ]
      );
      return existing[0].id;
    } else {
      const result = db.run(
        `INSERT INTO emperors (name, birth_year, death_year, reign_start, reign_end, dynasty, wikipedia_url, image_url, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          emperor.name,
          emperor.birth_year,
          emperor.death_year,
          emperor.reign_start,
          emperor.reign_end,
          emperor.dynasty,
          emperor.wikipedia_url,
          emperor.image_url,
          emperor.summary,
        ]
      );
      return result.lastInsertRowid;
    }
  }

  return { getAllEmperors, getEmperorById, upsertEmperor };
}

module.exports = { createEmperorsService };
