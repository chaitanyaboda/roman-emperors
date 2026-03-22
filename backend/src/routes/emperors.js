const express = require('express');

function createEmperorsRouter(emperorsService) {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      const emperors = emperorsService.getAllEmperors();
      res.json(emperors);
    } catch (err) {
      console.error('GET /api/emperors error:', err);
      res.status(500).json({ error: 'Failed to fetch emperors' });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
      }
      const emperor = emperorsService.getEmperorById(id);
      if (!emperor) {
        return res.status(404).json({ error: 'Emperor not found' });
      }
      res.json(emperor);
    } catch (err) {
      console.error(`GET /api/emperors/${req.params.id} error:`, err);
      res.status(500).json({ error: 'Failed to fetch emperor' });
    }
  });

  return router;
}

module.exports = { createEmperorsRouter };
