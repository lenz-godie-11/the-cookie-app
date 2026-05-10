const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

router.post('/register', (req, res) => {
    const { username, password } = req.body;
    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
    
    db.run(sql, [username, password], (err) => {
        if (err) return res.status(500).json({ message: "Error!" });
        res.status(201).json({ success: true, message: "Registered!" });
    });
});

module.exports = router;
