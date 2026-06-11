const express = require('express');
const router = express.Router();
const db = require('../database/db');
//route to get the stock of the family
router.get('/stock', async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
//route to consume an item from the stock
router.post('/consume/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    //validate productId to ensure it's a number 
    if (isNaN(productId)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const { username, family_id } = req.body;
    //validate that username and family_id are provided in the request body and return error of they are missing 
    if (!username || !family_id) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    try {
        const ownerCheck = await db.query(
            'SELECT id FROM products WHERE id = $1 AND family_id = $2',
            [productId, family_id]
        );
        //check if user is the member of the family that owns the product and return accesss denied of they are not the member of the family 
        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const result = await db.query(
            "UPDATE products SET count = count - 1 WHERE id = $1 AND count > 0",
            [productId]
        );

        if (result.rowCount === 0) {
            return res.status(400).json({ success: false, message: "Item out of stock!" });
        }

        res.json({ success: true, message: "Item consumed!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
//route to restock an item in the stock 
router.post('/restock/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const { username, family_id, count } = req.body;
    if (!username || !family_id) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    if (!count || isNaN(count) || parseInt(count) <= 0) {
        return res.status(400).json({ success: false, message: "Invalid restock count" });
    }

    try {
        const ownerCheck = await db.query(
            'SELECT id FROM products WHERE id = $1 AND family_id = $2',
            [productId, family_id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const result = await db.query(
            "UPDATE products SET count = $1 WHERE id = $2",
            [parseInt(count), productId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: `Item restocked to ${count}!` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;