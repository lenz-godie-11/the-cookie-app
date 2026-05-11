// backend/routes/cookie.js
const express = require('express');
const router = express.Router();
const db = require('../database/db'); 

router.get('/stock', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/consume/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const result = await db.query(
            "UPDATE products SET count = count - 1 WHERE id = $1 AND count > 0", 
            [productId]
        );
        res.json({ success: true, message: "Item consumed!" });
    } catch (err) {
        res.status(400).json({ success: false, message: "Item out of stock!" });
    }
});

router.post('/restock/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        await db.query("UPDATE products SET count = 10 WHERE id = $1", [productId]);
        res.json({ success: true, message: "Item is full!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fill the item" });
    }
});

module.exports = router;
