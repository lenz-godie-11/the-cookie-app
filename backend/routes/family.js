const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[^\s]{8,}$/;

router.get('/join/:family_id', async (req, res) => {
  try {
    const { family_id } = req.params;
    const result = await db.query(
      'SELECT family_id FROM families WHERE family_id = $1',
      [family_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }
    res.json({ success: true, family_id: result.rows[0].family_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/join/:family_id', async (req, res) => {
  const { family_id } = req.params;
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 3) {
    return res.status(400).json({ success: false, message: "Username must be at least 3 characters" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ success: false, message: "Password error" });
  }

  try {
    const familyCheck = await db.query(
      'SELECT family_id FROM families WHERE family_id = $1',
      [family_id]
    );

    if (familyCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Family not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password, family_id) VALUES ($1, $2, $3) RETURNING id",
      [trimmedUsername, hashedPassword, family_id]
    );

    res.status(201).json({ success: true, message: "Joined family!", family_id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }
    if (err.code === '23503') {
      return res.status(404).json({ success: false, message: "Family not found" });
    }
    res.status(500).json({ success: false, message: "Error occurred" });
  }
});

module.exports = router;