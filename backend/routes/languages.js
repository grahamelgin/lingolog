const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT l.id, l.user_id, l.name, l.created_at,
             COALESCE(SUM(s.duration_minutes), 0) as total_minutes
      FROM languages l
      LEFT JOIN study_sessions s ON l.id = s.language_id
      WHERE l.user_id = $1
      GROUP BY l.id, l.user_id, l.name, l.created_at
      ORDER BY total_minutes DESC, l.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Language name is required' });
    }
    const result = await db.query(
      'INSERT INTO languages (user_id, name) VALUES ($1, $2) RETURNING *',
      [req.user.id, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(400).json({ error: 'Language already exists' });
    } else {
      console.error('Error adding language:', error);
      res.status(500).json({ error: 'Failed to add language' });
    }
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Language name is required' });
    }
    const result = await db.query(
      'UPDATE languages SET name = $1 WHERE id = $2 AND user_id = $3',
      [name, req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json({ message: 'Language renamed' });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(400).json({ error: 'Language name already exists' });
    } else {
      console.error('Error renaming language:', error);
      res.status(500).json({ error: 'Failed to rename language' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM languages WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Language not found' });
    }
    res.json({ message: 'Language deleted' });
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).json({ error: 'Failed to delete language' });
  }
});

module.exports = router;
