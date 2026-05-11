// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id", 
            [username, hashedPassword]
        );
        
        res.status(201).json({ success: true, message: "Registered!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Registration failed or user exists" });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ message: "invalid credential" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ success: true, message: "welcome back" });
        } else {
            res.status(401).json({ message: "invalid credential" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server login error" });
    }
});

module.exports = router;
