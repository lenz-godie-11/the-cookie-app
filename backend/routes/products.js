const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { upload } = require('../config/cloudinary');

router.get('/:family_id', async (req, res) => {
  try {
    const { family_id } = req.params;
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, message: "Missing username" });
    }

    const memberCheck = await db.query(
      'SELECT id FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

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
    const { name, description, count, family_id, username } = req.body;

    if (!name || !family_id || !username) {
      return res.status(400).json({ success: false, message: "Name, family_id and username are required" });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res.status(400).json({ success: false, message: "Product name cannot be empty" });
    }

    const parsedCount = parseInt(count);
    if (isNaN(parsedCount) || parsedCount < 0) {
      return res.status(400).json({ success: false, message: "Count must be a positive number" });
    }

    if (req.file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ success: false, message: "Only jpg, png, webp images allowed" });
      }
    }

    const memberCheck = await db.query(
      'SELECT id FROM users WHERE username = $1 AND family_id = $2',
      [username, family_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const image_url = req.file ? req.file.path : null;
    const finalCount = isNaN(parsedCount) || parsedCount < 0 ? 10 : parsedCount;

    await db.query(
      'INSERT INTO products (name, description, count, image_url, family_id) VALUES ($1, $2, $3, $4, $5)',
      [trimmedName, description || '', finalCount, image_url, family_id]
    );

    res.status(201).json({ success: true, message: 'Product added!', count: finalCount });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: "Product already exists" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;