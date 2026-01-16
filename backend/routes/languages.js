const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', (req, res) => {
  try {
    const languages = db.prepare('SELECT * FROM languages WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(languages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Language name is required' });
    }
    const result = db.prepare('INSERT INTO languages (user_id, name) VALUES (?, ?)').run(req.user.id, name);
    res.status(201).json({ id: result.lastInsertRowid, name, user_id: req.user.id });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Language already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add language' });
    }
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM languages WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json({ message: 'Language deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete language' });
  }
});

module.exports = router;