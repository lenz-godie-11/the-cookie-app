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
      "SELECT id FROM users WHERE username = $1 AND family_id = $2",
      [username, family_id],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // aggregate ingredients across the selected recipes
    const aggregated = {};

    for (const { recipe_id, desired_servings } of recipes) {
      const recipeResult = await db.query(
        "SELECT * FROM recipes WHERE id = $1 AND family_id = $2",
        [recipe_id, family_id],
      );
      // if not this family recipe skip
      if (recipeResult.rows.length === 0) continue;

      const recipe = recipeResult.rows[0];
      const ratio = (desired_servings || recipe.servings) / recipe.servings;

      const ingredientsResult = await db.query(
        "SELECT * FROM recipe_ingredients WHERE recipe_id = $1",
        [recipe_id],
      );

      for (const ing of ingredientsResult.rows) {
        const key = ing.name.trim().toLowerCase();
        const scaledAmount = parseFloat(ing.amount) * ratio;

        if (aggregated[key]) {
          aggregated[key].amount += scaledAmount;
          aggregated[key].fromRecipes.push(recipe.name);
        } else {
          aggregated[key] = {
            name: ing.name,
            amount: scaledAmount,
            unit: ing.unit,
            fromRecipes: [recipe.name],
          };
        }
      }
    }

    // pull the family's REAL current stock — live query
    const productsResult = await db.query(
      "SELECT name FROM products WHERE family_id = $1",
      [family_id],
    );
    const inStock = new Set(
      productsResult.rows.map((p) => p.name.trim().toLowerCase()),
    );

    // keep only what's missing from stock
    const missingItems = Object.values(aggregated).filter(
      (item) => !inStock.has(item.name.trim().toLowerCase()),
    );

    // persist the generated list
    const savedItems = [];
    for (const item of missingItems) {
      const insertResult = await db.query(
        `INSERT INTO shopping_list_items (family_id, ingredient_name, amount, unit)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [family_id, item.name, item.amount, item.unit],
      );
      savedItems.push(insertResult.rows[0]);
    }

    res.json({ success: true, shoppingList: savedItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
