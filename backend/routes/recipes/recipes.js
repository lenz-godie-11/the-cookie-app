const express = require("express");
const router = express.Router();
const db = require("../../database/db");
const { upload } = require("../../config/cloudinary");
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      servings,
      instructions,
      diet_tags,
      family_id,
      username,
      ingredients,
    } = req.body;

    if (!name || !family_id || !username) {
      return res.status(400).json({
        success: false,
        message: "Name, family_id and username are required",
      });
    }

    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const image_url = req.file ? req.file.path : null;
    const parsedInstructions = JSON.parse(instructions || "[]");
    const parsedDietTags = JSON.parse(diet_tags || "[]");
    const parsedIngredients = JSON.parse(ingredients || "[]");

    const recipeResult = await db.query(
      `INSERT INTO recipes (family_id, name, description, image_url, diet_tags, servings, instructions, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        family_id,
        name.trim(),
        description || "",
        image_url,
        parsedDietTags,
        servings || 4,
        parsedInstructions,
        username,
      ],
    );
    const recipe = recipeResult.rows[0];

    for (const ing of parsedIngredients) {
      await db.query(
        "INSERT INTO recipe_ingredients (recipe_id, name, amount, unit) VALUES ($1, $2, $3, $4)",
        [recipe.id, ing.name, ing.amount, ing.unit],
      );
    }

    res.status(201).json({ success: true, message: "Recipe added!", recipe });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.get("/:family_id/search/ingredients", async (req, res) => {
  try {
    const { family_id } = req.params;
    const { username, ingredients } = req.query;
    if (!username || !ingredients) {
      return res
        .status(400)
        .json({ success: false, message: "Missing username or ingredients" });
    }

    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const searchedIngredients = ingredients
      .split(",")
      .map((i) => i.trim().toLowerCase());
    const recipesResult = await db.query(
      "SELECT * FROM recipes WHERE family_id = $1",
      [family_id],
    );

    const scored = [];
    for (const recipe of recipesResult.rows) {
      const ingredientsResult = await db.query(
        "SELECT name FROM recipe_ingredients WHERE recipe_id = $1",
        [recipe.id],
      );
      const recipeNames = ingredientsResult.rows.map((i) =>
        i.name.trim().toLowerCase(),
      );

      let score = 0;
      for (const searched of searchedIngredients) {
        const found = recipeNames.some(
          (name) => name.includes(searched) || searched.includes(name),
        );
        if (found) score++;
      }

      if (score > 0) scored.push({ ...recipe, matchScore: score });
    }

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:family_id", async (req, res) => {
  try {
    const { family_id } = req.params;
    const { username, diet } = req.query;
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

    const result = diet
      ? await db.query(
          "SELECT * FROM recipes WHERE family_id = $1 AND $2 = ANY(diet_tags) ORDER BY created_at DESC",
          [family_id, diet],
        )
      : await db.query(
          "SELECT * FROM recipes WHERE family_id = $1 ORDER BY created_at DESC",
          [family_id],
        );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:family_id/:id", async (req, res) => {
  try {
    const { family_id, id } = req.params;
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

    const recipeResult = await db.query(
      "SELECT * FROM recipes WHERE id = $1 AND family_id = $2",
      [id, family_id],
    );
    if (recipeResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const ingredientsResult = await db.query(
      "SELECT * FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY sort_order ASC",
      [id],
    );

    res.json({ ...recipeResult.rows[0], ingredients: ingredientsResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const recipeId = parseInt(req.params.id);
  if (isNaN(recipeId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid recipe ID" });
  }
  const { username, family_id } = req.body;
  if (!username || !family_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing credentials" });
  }

  try {
    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const ownerCheck = await db.query(
      "SELECT id FROM recipes WHERE id = $1 AND family_id = $2",
      [recipeId, family_id],
    );
    if (ownerCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    await db.query("DELETE FROM recipes WHERE id = $1", [recipeId]);
    res.json({ success: true, message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
