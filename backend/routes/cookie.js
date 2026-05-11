const express = require('express');
const router = express.Router();
const db = require('../database/db'); 
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

router.get('/stock', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/upload-product', upload.single('productImage'), (req, res) => {
    const { name, count } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    db.run("INSERT INTO products (name, count, image_url) VALUES (?, ?, ?)", 
        [name, count, imageUrl], 
        (err) => {
            if (err) return res.status(500).json({ message: "Upload failed" });
            res.json({ success: true, message: `${name} added to inventory!` });
        }
    );
});

router.post('/consume/:id', (req, res) => {
    const productId = req.params.id;
    db.run("UPDATE products SET count = count - 1 WHERE id = ? AND count > 0", [productId], function(err) {
        if (this.changes > 0) {
            res.json({ success: true, message: "Item consumed!" });
        } else {
            res.status(400).json({ success: false, message: "Item out of stock!" });
        }
    });
});

router.post('/restock/:id', (req, res) => {
    const productId = req.params.id;
    db.run("UPDATE products SET count = 10 WHERE id = ?", [productId], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Restock failed" });
        res.json({ success: true, message: "Item refilled!" });
    });
});

module.exports = router;
