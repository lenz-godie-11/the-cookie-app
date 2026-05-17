const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { upload } = require('../config/cloudinary');

router.get('/:family_id', async (req, res) => {
  try {
    const { family_id } = req.params;
    const result = await db.query(
      'SELECT * FROM products WHERE family_id = $1 ORDER BY id ASC',
      [family_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, description, count, family_id } = req.body;
    const image_url = req.file ? req.file.path : null;

    await db.query(
      'INSERT INTO products (name, description, count, image_url, family_id) VALUES ($1, $2, $3, $4, $5)',
      [name, description || '', parseInt(count) || 10, image_url, family_id]
    );

    res.status(201).json({ success: true, message: 'Product added!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/consume/:id', async (req, res) => {
  try {
    await db.query(
      'UPDATE products SET count = count - 1 WHERE id = $1 AND count > 0',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Item out of stock!' });
  }
});

router.post('/restock/:id', async (req, res) => {
  try {
    await db.query(
      'UPDATE products SET count = 10 WHERE id = $1',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;