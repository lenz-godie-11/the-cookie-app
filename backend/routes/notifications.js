const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { family_id } = req.query;

    if (!family_id) {
      return res.status(400).json({ success: false, message: "Missing family_id" });
    }

    const memberCheck = await db.query(
      'SELECT id FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await db.query(
      'SELECT * FROM notifications WHERE username = $1 AND family_id = $2 ORDER BY created_at DESC',
      [username, family_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mark-read/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Missing username" });
    }

    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND username = $2',
      [id, username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mark-all-read', async (req, res) => {
  try {
    const { username, family_id } = req.body;

    if (!username || !family_id) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    await db.query(
      'UPDATE notifications SET is_read = true WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );

    res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Missing username" });
    }

    const result = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND username = $2',
      [id, username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;