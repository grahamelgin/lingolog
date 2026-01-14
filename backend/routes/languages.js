const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  try {
    const languages = db.prepare('SELECT * FROM languages ORDER BY created_at DESC').all();
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
    const result = db.prepare('INSERT INTO languages (name) VALUES (?)').run(name);
    res.status(201).json({ id: result.lastInsertRowid, name });
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
    const result = db.prepare('DELETE FROM languages WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json({ message: 'Language deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete language' });
  }
});

module.exports = router;