const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/group', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM messages WHERE room = $1 ORDER BY created_at ASC LIMIT 100',
      ['group']
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/private/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const room = [user1, user2].sort().join('_');
    const result = await db.query(
      'SELECT * FROM messages WHERE room = $1 ORDER BY created_at ASC LIMIT 100',
      [room]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { username, message, room } = req.body;
    const result = await db.query(
      'INSERT INTO messages (username, message, room) VALUES ($1, $2, $3) RETURNING *',
      [username, message, room]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;