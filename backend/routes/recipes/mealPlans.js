const express = require("express");
const router = express.Router();
const db = require("../../database/db");

router.post("/save", async (req, res) => {
  const { family_id, username, mealPlan } = req.body;

  if (!family_id || !username || !Array.isArray(mealPlan)) {
    return res
      .status(400)
      .json({ success: false, message: "Missing or invalid data" });
  }

  try {
    // Sanitized with text-casting
    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await db.query("BEGIN");

    await db.query("DELETE FROM meal_plans WHERE family_id::text = $1::text", [
      family_id.trim(),
    ]);

    const savedEntries = [];
    for (const item of mealPlan) {
      const recipeIdInput = item.recipe_id;

      const result = await db.query(
        `INSERT INTO meal_plans (family_id, recipe_id, day_of_week, meal_type, desired_servings, added_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          family_id.trim(),
          recipeIdInput,
          item.day_of_week,
          item.meal_type,
          item.desired_servings || 4,
          username.trim(),
        ],
      );
      savedEntries.push(result.rows[0]);
    }

    await db.query("COMMIT");

    res.json({
      success: true,
      message: "Meal plan updated successfully!",
      mealPlan: savedEntries,
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("MEALPLAN SAVE CRASH DETAILS:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get("/:family_id", async (req, res) => {
  const { family_id } = req.params;
  const { username } = req.query;

  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username" });
  }

  try {
    // Sanitized with text-casting
    const memberCheck = await db.query(
      "SELECT id FROM users WHERE username::text = $1::text AND family_id::text = $2::text",
      [username.trim(), family_id.trim()],
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await db.query(
      `SELECT mp.*, r.name as recipe_name, r.image_url, r.servings as base_servings
       FROM meal_plans mp
       LEFT JOIN recipes r ON mp.recipe_id::text = r.id::text
       WHERE mp.family_id::text = $1::text
       ORDER BY 
         CASE mp.day_of_week
           WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 
           WHEN 'Sunday' THEN 7 
         END,
         CASE mp.meal_type
           WHEN 'Breakfast' THEN 1 WHEN 'Lunch' THEN 2 WHEN 'Dinner' THEN 3 ELSE 4
         END`,
      [family_id.trim()],
    );

    res.json({ success: true, mealPlan: result.rows });
  } catch (err) {
    console.error("MEALPLAN GET FETCH CRASH DETAILS:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
