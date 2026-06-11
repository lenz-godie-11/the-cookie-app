const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/messages', async (req, res) => {
  try {
    const room = req.query.room || 'group';
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      'SELECT * FROM messages WHERE room = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
      [room, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/private/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { requester } = req.query;

    if (!requester || (requester !== user1 && requester !== user2)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const room = [user1, user2].sort().join('_');
    const result = await db.query(
      'SELECT * FROM messages WHERE room = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3',
      [room, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { username, message, room } = req.body;

    if (!username || !message || !room) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    if (trimmedMessage.length > 1000) {
      return res.status(400).json({ success: false, message: "Message too long, max 1000 characters" });
    }

    const userCheck = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (userCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Invalid user" });
    }

    const result = await db.query(
      'INSERT INTO messages (username, message, room) VALUES ($1, $2, $3) RETURNING *',
      [username, trimmedMessage, room]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;