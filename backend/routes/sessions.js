const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/overall-stats', async (req, res) => {
  try {
    const totalMinutesResult = await db.query(`
      SELECT COALESCE(SUM(duration_minutes), 0) as total
      FROM study_sessions
      WHERE user_id = $1
    `, [req.user.id]);

    const mostStudiedResult = await db.query(`
      SELECT l.name, SUM(s.duration_minutes) as total_minutes
      FROM study_sessions s
      JOIN languages l ON s.language_id = l.id
      WHERE s.user_id = $1
      GROUP BY l.id, l.name
      ORDER BY total_minutes DESC
      LIMIT 1
    `, [req.user.id]);

    const mostStudied = mostStudiedResult.rows[0];

    res.json({
      total_minutes: totalMinutesResult.rows[0].total,
      most_studied_language: mostStudied ? mostStudied.name : null,
      most_studied_minutes: mostStudied ? mostStudied.total_minutes : 0
    });
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    res.status(500).json({ error: 'Failed to fetch overall stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, l.name as language_name
      FROM study_sessions s
      JOIN languages l ON s.language_id = l.id
      WHERE s.user_id = $1
      ORDER BY s.date DESC, s.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/language/:languageId', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, l.name as language_name
      FROM study_sessions s
      JOIN languages l ON s.language_id = l.id
      WHERE s.language_id = $1 AND s.user_id = $2
      ORDER BY s.date DESC, s.created_at DESC
    `, [req.params.languageId, req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/stats/:languageId', async (req, res) => {
  try {
    const totalResult = await db.query(`
      SELECT SUM(duration_minutes) as total_minutes
      FROM study_sessions
      WHERE language_id = $1 AND user_id = $2
    `, [req.params.languageId, req.user.id]);

    const byCategoryResult = await db.query(`
      SELECT category, SUM(duration_minutes) as total_minutes, COUNT(*) as session_count
      FROM study_sessions
      WHERE language_id = $1 AND user_id = $2
      GROUP BY category
      ORDER BY total_minutes DESC
    `, [req.params.languageId, req.user.id]);

    res.json({
      total_minutes: totalResult.rows[0].total_minutes || 0,
      by_category: byCategoryResult.rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { language_id, category, duration_minutes, date, notes } = req.body;
    
    if (!language_id || !category || !duration_minutes || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(`
      INSERT INTO study_sessions (user_id, language_id, category, duration_minutes, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [req.user.id, language_id, category, duration_minutes, date, notes || null]);

    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error adding session:', error);
    res.status(500).json({ error: 'Failed to add session' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { category, duration_minutes, date, notes } = req.body;
    
    if (!category || !duration_minutes || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.query(`
      UPDATE study_sessions
      SET category = $1, duration_minutes = $2, date = $3, notes = $4
      WHERE id = $5 AND user_id = $6
    `, [category, duration_minutes, date, notes || null, req.params.id, req.user.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session updated' });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM study_sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
