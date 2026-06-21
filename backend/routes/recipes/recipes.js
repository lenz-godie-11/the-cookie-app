const express = require("express");
const router = express.Router();
const db = require("../../database/db");
const { upload } = require("../../config/cloudinary");
const axios = require("axios");
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
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
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
    console.error("CRITICAL RECIPE ADD ERROR:", err.message);
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
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );
    if (memberCheck.rows.length === 0) {
      return res.json([]);
    }

    const searchedIngredients = ingredients
      .split(",")
      .map((i) => i.trim().toLowerCase());

    const recipesResult = await db.query(
      "SELECT * FROM recipes WHERE family_id::text = $1::text",
      [family_id],
    );

    let scored = [];
    for (const recipe of recipesResult.rows) {
      const ingredientsResult = await db.query(
        "SELECT name FROM recipe_ingredients WHERE recipe_id::text = $1::text",
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

    if (scored.length === 0) {
      console.log(
        `Neon DB haina mapishi. Tunavuta kutoka TheMealDB kwa kutumia kiungo cha kwanza...`,
      );

      const keyword = searchedIngredients[0];

      const apiResponse = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${keyword}`,
      );

      if (apiResponse.data && apiResponse.data.meals) {
        const mealsToProcess = apiResponse.data.meals.slice(0, 3);

        for (const meal of mealsToProcess) {
          const detailsResponse = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`,
          );

          if (detailsResponse.data && detailsResponse.data.meals) {
            const fullMeal = detailsResponse.data.meals[0];

            const mealInstructions = fullMeal.strInstructions
              ? fullMeal.strInstructions
                  .split("\r\n")
                  .filter((line) => line.trim().length > 0)
              : ["Cook thoroughly according to taste."];

            const savedRecipeResult = await db.query(
              `INSERT INTO recipes (family_id, name, description, image_url, diet_tags, servings, instructions, created_by)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
              [
                family_id,
                fullMeal.strMeal,
                `Delicious ${fullMeal.strMeal} imported automatically via TheMealDB.`,
                fullMeal.strMealThumb,
                [fullMeal.strCategory || "General"],
                4,
                mealInstructions,
                "TheMealDB System",
              ],
            );

            const newRecipe = savedRecipeResult.rows[0];

            for (let k = 1; k <= 20; k++) {
              const ingName = fullMeal[`strIngredient${k}`];
              const ingMeasure = fullMeal[`strMeasure${k}`];

              if (ingName && ingName.trim().length > 0) {
                await db.query(
                  "INSERT INTO recipe_ingredients (recipe_id, name, amount, unit) VALUES ($1, $2, $3, $4)",
                  [
                    newRecipe.id,
                    ingName.trim().toLowerCase(),
                    parseFloat(ingMeasure) || 1,
                    ingMeasure.trim() || "unit",
                  ],
                );
              }
            }

            scored.push({ ...newRecipe, matchScore: 1 });
          }
        }
      }
    }

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored);
  } catch (err) {
    console.error("CRITICAL AUTOMATIC SEARCH RECIPE ERROR:", err.message);
    res
      .status(500)
      .json({ error: err.message, tracking: "Search route crash" });
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
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );

    if (memberCheck.rows.length === 0) {
      return res.json([]);
    }

    const result = diet
      ? await db.query(
          "SELECT * FROM recipes WHERE family_id::text = $1::text AND $2 = ANY(diet_tags) ORDER BY created_at DESC",
          [family_id, diet],
        )
      : await db.query(
          "SELECT * FROM recipes WHERE family_id::text = $1::text ORDER BY created_at DESC",
          [family_id],
        );

    res.json(result.rows);
  } catch (err) {
    console.error("CRITICAL RECIPE GET ERROR:", err.message);
    res
      .status(500)
      .json({ error: err.message, tracking: "Recipe route crash" });
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
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const recipeResult = await db.query(
      "SELECT * FROM recipes WHERE id::text = $1::text AND family_id::text = $2::text",
      [id, family_id],
    );
    if (recipeResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    const ingredientsResult = await db.query(
      "SELECT * FROM recipe_ingredients WHERE recipe_id::text = $1::text ORDER BY id ASC",
      [id],
    );

    res.json({ ...recipeResult.rows[0], ingredients: ingredientsResult.rows });
  } catch (err) {
    console.error("CRITICAL SINGLE RECIPE FETCH ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, family_id } = req.body;

  if (!username || !family_id) {
    return res
      .status(400)
      .json({ success: false, message: "Missing credentials" });
  }

  try {
    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const ownerCheck = await db.query(
      "SELECT id FROM recipes WHERE id::text = $1::text AND family_id::text = $2::text",
      [id, family_id],
    );
    if (ownerCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Recipe not found" });
    }

    await db.query("DELETE FROM recipes WHERE id::text = $1::text", [id]);
    res.json({ success: true, message: "Recipe deleted" });
  } catch (err) {
    console.error("CRITICAL RECIPE DELETE ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
