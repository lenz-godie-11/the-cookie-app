const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../database/db');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[^\s]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ success: false, message: "Password error" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const family_id = crypto.randomUUID();
    await db.query(
      "INSERT INTO families (family_id, owner) VALUES ($1, $2) ON CONFLICT (family_id) DO NOTHING",
      [family_id, username]
    );
    await db.query(
      "INSERT INTO users (username, password, family_id, is_admin) VALUES ($1, $2, $3, true) RETURNING id",
      [username, hashedPassword, family_id]
    );
    res.status(201).json({ success: true, message: "Registered!", family_id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed or user exists" });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "missing credentials" });
  }
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.json({
        success: true,
        message: "Welcome back",
        username: user.username,
        family_id: user.family_id,
        is_admin: user.is_admin
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server login error" });
  }
});

router.get('/family-members/:family_id', async (req, res) => {
  try {
    const { family_id } = req.params;
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "missing credentials" });
    }
    const memberCheck = await db.query(
      "SELECT * FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }
    const result = await db.query(
      "SELECT id, username FROM users WHERE family_id = $1 ORDER BY username ASC",
      [family_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/change-username', async (req, res) => {
  const { username, newUsername, family_id } = req.body;
  if (!username || !newUsername || !family_id) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }
  const trimmed = newUsername.trim();
  if (trimmed.length < 3) {
    return res.status(400).json({ success: false, message: "Username must be at least 3 characters" });
  }
  try {
    const memberCheck = await db.query(
      'SELECT id FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const result = await db.query(
      'UPDATE users SET username = $1 WHERE username = $2 AND family_id = $3',
      [trimmed, username, family_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "Username updated" });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }
    res.status(500).json({ success: false, message: "Error occurred" });
  }
});

router.post('/change-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  if (!username || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[^\s]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ success: false, message: "New password does not meet requirements" });
  }
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = $1 WHERE username = $2',
      [hashedPassword, username]
    );
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error occurred" });
  }
});

router.post('/leave-family', async (req, res) => {
  const { username, family_id } = req.body;
  if (!username || !family_id) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }
  try {
    const adminCheck = await db.query(
      'SELECT is_admin FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );
    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (adminCheck.rows[0].is_admin) {
      return res.status(400).json({ success: false, message: "Admin cannot leave. Delete the family instead." });
    }
    await db.query(
      'DELETE FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );
    res.json({ success: true, message: "Left family successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error occurred" });
  }
});

router.delete('/delete-family', async (req, res) => {
  const { username, family_id } = req.body;
  if (!username || !family_id) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }
  try {
    const adminCheck = await db.query(
      'SELECT is_admin FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );
    if (adminCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!adminCheck.rows[0].is_admin) {
      return res.status(403).json({ success: false, message: "Only admin can delete the family" });
    }
    await db.query('DELETE FROM notifications WHERE family_id = $1', [family_id]);
    await db.query('DELETE FROM messages WHERE room LIKE $1', [`family_${family_id}%`]);
    await db.query('DELETE FROM products WHERE family_id = $1', [family_id]);
    await db.query('DELETE FROM users WHERE family_id = $1', [family_id]);
    await db.query('DELETE FROM families WHERE family_id = $1', [family_id]);
    res.json({ success: true, message: "Family deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error occurred" });
  }
});

module.exports = router;
