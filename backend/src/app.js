require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createDB } = require('./db');
const { createEmperorsService } = require('./services/emperors');
const { createEmperorsRouter } = require('./routes/emperors');

function createApp() {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }));
  app.use(express.json());

  const db = createDB();
  const emperorsService = createEmperorsService(db);
  const emperorsRouter = createEmperorsRouter(emperorsService);

  app.use('/api/emperors', emperorsRouter);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = { createApp };
