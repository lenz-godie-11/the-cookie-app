const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../database/db');
//user registration route 
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  //user validation
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing credentials" });
  }
  //checking the password pattern
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


//user login route 
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  //check login credentials  
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

//route to get family members based on the family_id and username quert parameters
router.get('/family-members/:family_id', async (req, res) => {

  try {

    const { family_id } = req.params;
    //user passes their parameer in  here to verify that they are part of the family and can access the family members list 
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "missing credentials" });
    }


    //check if the user is actually the member of the family
    const memberCheck = await db.query("SELECT * FROM users WHERE username = $1 AND family_id = $2", [username, family_id]
    );


    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied " });
    }

    //if the user is the member of the family then we can retrn the family members list 
    const result = await db.query("SELECT id, username FROM users WHERE family_id = $1 ORDER BY username ASC", [family_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });

  }
});


module.exports = router; 
