const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { upload } = require("../config/cloudinary");

router.get("/:family_id", async (req, res) => {
  try {
    const { family_id } = req.params;
    const { username } = req.query;

    if (!username) {
      return res
        .status(400)
        .json({ success: false, message: "Missing username" });
    }

    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await db.query(
      "SELECT * FROM products WHERE family_id = $1 ORDER BY id ASC",
      [family_id],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, description, count, family_id, username } = req.body;

    if (!name || !family_id || !username) {
      return res.status(400).json({
        success: false,
        message: "Name, family_id and username are required",
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Product name cannot be empty" });
    }

    const parsedCount = parseInt(count);
    if (isNaN(parsedCount) || parsedCount < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Count must be a positive number" });
    }

    if (req.file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Only jpg, png, webp images allowed",
        });
      }
    }

    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const image_url = req.file ? req.file.path : null;
    const finalCount = isNaN(parsedCount) || parsedCount < 0 ? 10 : parsedCount;

    await db.query(
      "INSERT INTO products (name, description, count, image_url, family_id) VALUES ($1, $2, $3, $4, $5)",
      [trimmedName, description || "", finalCount, image_url, family_id],
    );

    if (finalCount <= 3) {
      const io = req.app.get("io");
      const members = await db.query(
        "SELECT username FROM users WHERE family_id = $1",
        [family_id],
      );
      for (const member of members.rows) {
        const notif = await db.query(
          "INSERT INTO notifications (family_id, username, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
          [
            family_id,
            member.username,
            `${trimmedName} was added with low stock (${finalCount} left)`,
            "stock",
          ],
        );
        io.to(`user_${member.username}`).emit(
          "new_notification",
          notif.rows[0],
        );
      }
    }

    res
      .status(201)
      .json({ success: true, message: "Product added!", count: finalCount });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Product already exists" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/consume/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product ID" });
  }

  const { username, family_id } = req.body;
  if (!username || !family_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing credentials" });
  }

  try {
    const ownerCheck = await db.query(
      "SELECT id FROM products WHERE id = $1 AND family_id = $2",
      [productId, family_id],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await db.query(
      "UPDATE products SET count = count - 1 WHERE id = $1 AND count > 0 RETURNING *",
      [productId],
    );

    if (result.rowCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Item out of stock!" });
    }

    const product = result.rows[0];
    const io = req.app.get("io");

    const members = await db.query(
      "SELECT username FROM users WHERE family_id = $1 AND username != $2",
      [family_id, username],
    );

    for (const member of members.rows) {
      const notif = await db.query(
        "INSERT INTO notifications (family_id, username, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
        [
          family_id,
          member.username,
          `${username} consumed ${product.name} — ${product.count} left`,
          "consume",
        ],
      );
      io.to(`user_${member.username}`).emit("new_notification", notif.rows[0]);
    }

    if (product.count <= 3) {
      const allMembers = await db.query(
        "SELECT username FROM users WHERE family_id = $1",
        [family_id],
      );
      for (const member of allMembers.rows) {
        const notif = await db.query(
          "INSERT INTO notifications (family_id, username, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
          [
            family_id,
            member.username,
            `${product.name} is running low — only ${product.count} left`,
            "stock",
          ],
        );
        io.to(`user_${member.username}`).emit(
          "new_notification",
          notif.rows[0],
        );
      }
    }

    if (product.count === 0) {
      const allMembers = await db.query(
        "SELECT username FROM users WHERE family_id = $1",
        [family_id],
      );
      for (const member of allMembers.rows) {
        const notif = await db.query(
          "INSERT INTO notifications (family_id, username, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
          [
            family_id,
            member.username,
            `${product.name} is now out of stock!`,
            "stock",
          ],
        );
        io.to(`user_${member.username}`).emit(
          "new_notification",
          notif.rows[0],
        );
      }
    }

    res.json({ success: true, message: "Item consumed!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/restock/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product ID" });
  }

  const { username, family_id, count } = req.body;
  if (!username || !family_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing credentials" });
  }

  if (!count || isNaN(count) || parseInt(count) <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid restock count" });
  }

  try {
    const ownerCheck = await db.query(
      "SELECT id FROM products WHERE id = $1 AND family_id = $2",
      [productId, family_id],
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await db.query(
      "UPDATE products SET count = $1 WHERE id = $2 RETURNING *",
      [parseInt(count), productId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: `Item restocked to ${count}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//delete product -only admin can delete

router.delete("/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product ID" });
  }
  const { username, family_id } = req.body;
  if (!username || !family_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing credentials" });
  }
  try {
    const adminCheck = await db.query(
      "SELECT is_admin FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );
    if (adminCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (!adminCheck.rows[0].is_admin) {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can delete products" });
    }
    const productCheck = await db.query(
      "SELECT * FROM products WHERE id = $1 AND family_id = $2",
      [productId, family_id],
    );
    if (productCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    const product = productCheck.rows[0];
    await db.query("DELETE FROM products WHERE id = $1", [productId]);
    const io = req.app.get("io");
    const members = await db.query(
      "SELECT username FROM users WHERE family_id = $1 AND username != $2",
      [family_id, username],
    );
    for (const member of members.rows) {
      const notif = await db.query(
        "INSERT INTO notifications (family_id, username, message, type) VALUES ($1, $2, $3, $4) RETURNING *",
        [
          family_id,
          member.username,
          `${username} removed ${product.name} from inventory`,
          "delete",
        ],
      );
      io.to(`user_${member.username}`).emit("new_notification", notif.rows[0]);
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
