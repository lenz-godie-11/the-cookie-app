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
      // Safety: Match type configuration dynamically
      const cleanRecipeId = isNaN(recipe_id) ? recipe_id : parseInt(recipe_id);

      const recipeResult = await db.query(
        "SELECT * FROM recipes WHERE id = $1 AND family_id = $2",
        [cleanRecipeId, family_id],
      );

      // if not this family recipe skip
      if (recipeResult.rows.length === 0) continue;

      const recipe = recipeResult.rows[0];
      const baseServings = parseFloat(recipe.servings) || 4;
      const ratio =
        (parseFloat(desired_servings) || baseServings) / baseServings;

      const ingredientsResult = await db.query(
        "SELECT name, amount, unit FROM recipe_ingredients WHERE recipe_id = $1",
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

    // pull the family's REAL current stock — live query
    const productsResult = await db.query(
      "SELECT name FROM products WHERE family_id = $1",
      [family_id],
    );
    const inStock = new Set(
      productsResult.rows.map((p) => p.name.trim().toLowerCase()),
    );

    // keep only what's missing from stock (filters against saruji / charwe)
    const missingItems = Object.values(aggregated).filter(
      (item) => !inStock.has(item.name.trim().toLowerCase()),
    );

    // clear old entries for this family before adding a new shopping list
    await db.query("DELETE FROM shopping_list_items WHERE family_id = $1", [
      family_id,
    ]);

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
    console.error("SHOPPING LIST GENERATE ERROR:", err); // Now you will see the exact column crash on Render!
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
