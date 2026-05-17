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
  return res.status(400).json({ success: false, message: "Password haikidhi masharti" });
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

router.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT id, username FROM users ORDER BY username ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/family-members/:family_id', async (req, res) => {
  try {
    const { family_id } = req.params;
    const result = await db.query(
      'SELECT id, username FROM users WHERE family_id = $1 ORDER BY username ASC',
      [family_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;