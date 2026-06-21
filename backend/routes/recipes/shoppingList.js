const express = require("express");
const router = express.Router();
const db = require("../../database/db");

router.post("/generate", async (req, res) => {
  const { family_id, username, recipes } = req.body;

  if (
    !family_id ||
    !username ||
    !Array.isArray(recipes) ||
    recipes.length === 0
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid data" });
  }

  try {
    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const aggregated = {};

    for (const { recipe_id, desired_servings } of recipes) {
      const cleanRecipeId = isNaN(recipe_id) ? recipe_id : parseInt(recipe_id);

      const recipeResult = await db.query(
        "SELECT * FROM recipes WHERE id::text = $1::text AND family_id::text = $2::text",
        [cleanRecipeId, family_id.trim()],
      );

      if (recipeResult.rows.length === 0) continue;

      const recipe = recipeResult.rows[0];
      const baseServings = parseFloat(recipe.servings) || 4;
      const ratio =
        (parseFloat(desired_servings) || baseServings) / baseServings;

      const ingredientsResult = await db.query(
        "SELECT name, amount, unit FROM recipe_ingredients WHERE recipe_id::text = $1::text",
        [cleanRecipeId],
      );

      for (const ing of ingredientsResult.rows) {
        if (!ing.name) continue;
        const key = ing.name.trim().toLowerCase();
        const scaledAmount = (parseFloat(ing.amount) || 0) * ratio;

        if (aggregated[key]) {
          aggregated[key].amount += scaledAmount;
          if (
            recipe.name &&
            !aggregated[key].fromRecipes.includes(recipe.name)
          ) {
            aggregated[key].fromRecipes.push(recipe.name);
          }
        } else {
          aggregated[key] = {
            name: ing.name,
            amount: scaledAmount,
            unit: ing.unit || "units",
            fromRecipes: recipe.name ? [recipe.name] : [],
          };
        }
      }
    }

    const productsResult = await db.query(
      "SELECT name FROM products WHERE family_id::text = $1::text",
      [family_id.trim()],
    );
    const inStock = new Set(
      productsResult.rows.map((p) => p.name.trim().toLowerCase()),
    );

    const missingItems = Object.values(aggregated).filter(
      (item) => !inStock.has(item.name.trim().toLowerCase()),
    );

    await db.query(
      "DELETE FROM shopping_list_items WHERE family_id::text = $1::text",
      [family_id.trim()],
    );

    const savedItems = [];
    for (const item of missingItems) {
      const insertResult = await db.query(
        `INSERT INTO shopping_list_items (family_id, ingredient_name, amount, unit)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [family_id.trim(), item.name, item.amount, item.unit],
      );
      savedItems.push(insertResult.rows[0]);
    }

    res.json({ success: true, shoppingList: savedItems });
  } catch (err) {
    console.error("SHOPPING LIST GENERATE ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
