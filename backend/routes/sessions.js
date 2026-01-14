const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT s.*, l.name as language_name
      FROM study_sessions s
      JOIN languages l ON s.language_id = l.id
      ORDER BY s.date DESC, s.created_at DESC
    `).all();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/language/:languageId', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT s.*, l.name as language_name
      FROM study_sessions s
      JOIN languages l ON s.language_id = l.id
      WHERE s.language_id = ?
      ORDER BY s.date DESC, s.created_at DESC
    `).all(req.params.languageId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/stats/:languageId', (req, res) => {
  try {
    const total = db.prepare(`
      SELECT SUM(duration_minutes) as total_minutes
      FROM study_sessions
      WHERE language_id = ?
    `).get(req.params.languageId);

    const byCategory = db.prepare(`
      SELECT category, SUM(duration_minutes) as total_minutes, COUNT(*) as session_count
      FROM study_sessions
      WHERE language_id = ?
      GROUP BY category
      ORDER BY total_minutes DESC
    `).all(req.params.languageId);

    res.json({
      total_minutes: total.total_minutes || 0,
      by_category: byCategory
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/', (req, res) => {
  try {
    const { language_id, category, duration_minutes, date, notes } = req.body;
    
    if (!language_id || !category || !duration_minutes || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare(`
      INSERT INTO study_sessions (language_id, category, duration_minutes, date, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(language_id, category, duration_minutes, date, notes || null);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add session' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM study_sessions WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;