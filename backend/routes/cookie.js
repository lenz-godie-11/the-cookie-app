const express = require('express');
const router = express.Router();
const db = require('../database/db'); 

router.get('/stock', (req, res) => {
    db.get("SELECT count FROM inventory WHERE id = 1", (err, row) => {
        res.json(row);
    });
});

router.post('/consume', (req, res) => {
    db.run("UPDATE inventory SET count = count-1 WHERE id=1 AND count > 0", function(err) {
        if(this.changes > 0) {
            res.json({ success: true, message: "consumed " });
        } else {
            res.status(400).json({ success: false, message: "kitchen is empty" });
        }
    });
});

module.exports = router;
