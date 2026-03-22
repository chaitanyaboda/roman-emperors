require('dotenv').config();
const { createSQLiteDB } = require('./sqlite');

function createDB(config = {}) {
  const dbType = config.type || process.env.DB_TYPE || 'sqlite';
  const dbPath = config.path || process.env.DB_PATH || './data/emperors.db';

  if (dbType === 'sqlite') {
    return createSQLiteDB(dbPath);
  }

  throw new Error(`Unsupported DB_TYPE: "${dbType}". Add a new implementation in db/ and handle it here.`);
}

module.exports = { createDB };
