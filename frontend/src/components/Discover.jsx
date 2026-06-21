import React, { useState, useEffect } from "react";

export default function Discover({ familyId, username }) {
  const [recipes, setRecipes] = useState([]);
  const [searchTerms, setSearchTerms] = useState("");
  const [activePlan, setActivePlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["Breakfast", "Lunch", "Dinner"];

  useEffect(() => {
    fetchInitialData();
  }, [familyId]);

  const fetchInitialData = async () => {
    try {
      const resRecipes = await fetch(
        `/api/recipes/${familyId}?username=${username}`,
      );
      const dataRecipes = await resRecipes.json();
      setRecipes(Array.isArray(dataRecipes) ? dataRecipes : []);

      const resPlan = await fetch(
        `/api/mealplans/${familyId}?username=${username}`,
      );
      const dataPlan = await resPlan.json();
      if (dataPlan.success) setActivePlan(dataPlan.mealPlan);
    } catch (err) {
      console.error("Error loading discover dashboard data:", err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerms.trim()) {
      fetchInitialData();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/recipes/${familyId}/search/ingredients?username=${username}&ingredients=${searchTerms}`,
      );
      const matchedRecipes = await res.json();
      setRecipes(Array.isArray(matchedRecipes) ? matchedRecipes : []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const assignRecipeToSlot = (recipeId, day, type) => {
    const updatedPlan = [
      ...activePlan.filter(
        (item) => !(item.day_of_week === day && item.meal_type === type),
      ),
    ];

    updatedPlan.push({
      recipe_id: recipeId,
      day_of_week: day,
      meal_type: type,
      desired_servings: 4,
    });

    setActivePlan(updatedPlan);
  };

  const saveMealPlan = async () => {
    try {
      const res = await fetch("/api/mealplans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_id: familyId,
          username,
          mealPlan: activePlan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Meal plan updated safely for the family!");
        fetchInitialData();
      }
    } catch (err) {
      setMessage("Failed to commit meal plan changes.");
    }
  };

  const generateShoppingList = async () => {
    if (activePlan.length === 0) {
      alert(
        "Please assign at least one meal to your plan before generating a list.",
      );
      return;
    }
    try {
      const res = await fetch("/api/shoppinglist/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family_id: familyId,
          username,
          recipes: activePlan.map((item) => ({
            recipe_id: item.recipe_id,
            desired_servings: item.desired_servings,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(
          `Success! Generated ${data.shoppingList.length} shopping items based on missing stock.`,
        );
      }
    } catch (err) {
      console.error(
        "Failed to calculate differences against stock profiles.",
        err,
      );
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Family Recipe Discovery & Weekly Planner</h2>
      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
      )}

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search items on hand (e.g., chicken, garlic, salt)"
          value={searchTerms}
          onChange={(e) => setSearchTerms(e.target.value)}
          style={{ width: "350px", padding: "8px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 12px" }}>
          {loading ? "Ranking..." : "Find Matches"}
        </button>
      </form>

      <h3>Available Options ({recipes.length})</h3>
      <div
        style={{
          display: "flex",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              borderRadius: "6px",
              width: "220px",
            }}
          >
            {recipe.image_url && (
              <img
                src={recipe.image_url}
                alt={recipe.name}
                style={{ width: "100%", height: "120px", objectFit: "cover" }}
              />
            )}
            <h4>{recipe.name}</h4>
            <p style={{ fontSize: "0.85em", color: "#55hr" }}>
              {recipe.description}
            </p>
            {recipe.matchScore && (
              <span
                style={{
                  background: "#e1ffb1",
                  padding: "2px 6px",
                  fontSize: "0.8em",
                }}
              >
                Match Score: {recipe.matchScore}
              </span>
            )}

            <div style={{ marginTop: "10px" }}>
              <label style={{ fontSize: "0.75em" }}>Schedule to day:</label>
              <select
                onChange={(e) =>
                  assignRecipeToSlot(recipe.id, e.target.value, "Dinner")
                }
                defaultValue=""
              >
                <option value="" disabled>
                  Choose Day...
                </option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <h3>Weekly Schedule Grid</h3>
      <table
        border="1"
        cellPadding="8"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Time Slot</th>
            {days.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mealTypes.map((type) => (
            <tr key={type}>
              <strong>{type}</strong>
              {days.map((day) => {
                const assigned = activePlan.find(
                  (p) => p.day_of_week === day && p.meal_type === type,
                );
                return (
                  <td
                    key={day}
                    style={{
                      background: assigned ? "#f0faff" : "#fff",
                      minWidth: "100px",
                    }}
                  >
                    {assigned ? (
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "0.9em" }}>
                          {assigned.recipe_name ||
                            `Recipe ID: ${assigned.recipe_id}`}
                        </div>
                        <input
                          type="number"
                          value={assigned.desired_servings}
                          style={{ width: "40px", fontSize: "0.8em" }}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setActivePlan(
                              activePlan.map((p) =>
                                p.day_of_week === day && p.meal_type === type
                                  ? { ...p, desired_servings: val }
                                  : p,
                              ),
                            );
                          }}
                        />{" "}
                        <span style={{ fontSize: "0.8em" }}>srv</span>
                      </div>
                    ) : (
                      <span style={{ color: "#ccc", fontSize: "0.85em" }}>
                        Empty Slot
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          onClick={saveMealPlan}
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Save Active Layout Configuration
        </button>
        <button
          onClick={generateShoppingList}
          style={{
            background: "#008CBA",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Compile Final Grocery Needs List
        </button>
      </div>
    </div>
  );
}
