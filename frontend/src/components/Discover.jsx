import React, { useState, useEffect } from "react";
import { Search, ChefHat, Save, ShoppingCart, Calendar } from "lucide-react";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://onrender.com") + "/api";

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
    if (familyId) {
      fetchInitialData();
    }
  }, [familyId]);

  const fetchInitialData = async () => {
    try {
      const resRecipes = await fetch(
        `${API_BASE_URL}/recipes/${familyId}?username=${username}`,
      );
      const dataRecipes = await resRecipes.json();
      setRecipes(Array.isArray(dataRecipes) ? dataRecipes : []);

      const resPlan = await fetch(
        `${API_BASE_URL}/mealplans/${familyId}?username=${username}`,
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
        `${API_BASE_URL}/recipes/${familyId}/search/ingredients?username=${username}&ingredients=${searchTerms}`,
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
    const selectedRecipe = recipes.find((r) => r.id === recipeId);
    const updatedPlan = [
      ...activePlan.filter(
        (item) => !(item.day_of_week === day && item.meal_type === type),
      ),
    ];

    updatedPlan.push({
      recipe_id: recipeId,
      recipe_name: selectedRecipe
        ? selectedRecipe.name
        : `Recipe ID: ${recipeId}`,
      day_of_week: day,
      meal_type: type,
      desired_servings: 4,
    });

    setActivePlan(updatedPlan);
  };

  const saveMealPlan = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/mealplans/save`, {
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
        setTimeout(() => setMessage(""), 4000);
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
      const res = await fetch(`${API_BASE_URL}/shoppinglist/generate`, {
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
    <div className="w-full min-h-screen bg-[#121214] text-slate-200 p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <ChefHat className="text-[#3b5d8f]" size={26} /> Family Recipe
            Discovery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search items on hand, adjust layouts, and coordinate weekly home
            grocery requirements.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={saveMealPlan}
            className="flex items-center gap-2 bg-[#3b5d8f] hover:bg-[#4a72ad] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md"
          >
            <Save size={16} /> Save Plan
          </button>
          <button
            onClick={generateShoppingList}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md"
          >
            <ShoppingCart size={16} /> Compile Grocery List
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium transition-all border ${
            message.includes("safely")
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-[#1a1a1c] border border-white/5 p-4 rounded-2xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search items on hand (e.g., chicken, garlic, salt)"
              value={searchTerms}
              onChange={(e) => setSearchTerms(e.target.value)}
              className="w-full bg-[#121214] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#3b5d8f] transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-[#121214] hover:bg-[#222226] border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0"
          >
            {loading ? "Ranking..." : "Find Matches"}
          </button>
        </form>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white tracking-wide">
          Available Options ({recipes.length})
        </h3>
        {recipes.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            No meals match your criteria or are currently available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#1a1a1c] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:border-white/10"
              >
                <div>
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-32 object-cover rounded-xl mb-3"
                    />
                  )}
                  <h4 className="font-semibold text-white text-base tracking-tight">
                    {recipe.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/5">
                  {recipe.matchScore && (
                    <span className="inline-block bg-[#3b5d8f]/10 border border-[#3b5d8f]/20 text-[#618ecd] px-2 py-0.5 rounded-lg text-xs font-semibold">
                      Match Score: {recipe.matchScore}
                    </span>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                      Schedule to dinner:
                    </label>
                    <select
                      onChange={(e) =>
                        assignRecipeToSlot(recipe.id, e.target.value, "Dinner")
                      }
                      defaultValue=""
                      className="w-full bg-[#121214] border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#3b5d8f]"
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
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white tracking-wide flex items-center gap-2">
          <Calendar size={18} className="text-[#3b5d8f]" /> Weekly Schedule Grid
        </h3>
        <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#1a1a1c]">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-[#121214]">
                <th className="p-4 font-semibold text-slate-400 w-32">
                  Time Slot
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="p-4 font-semibold text-slate-400 min-w-[140px]"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mealTypes.map((type) => (
                <tr key={type} className="hover:bg-[#222226]/30 transition-all">
                  <td className="p-4 font-semibold text-white bg-[#121214]/40">
                    {type}
                  </td>
                  {days.map((day) => {
                    const assigned = activePlan.find(
                      (p) => p.day_of_week === day && p.meal_type === type,
                    );
                    return (
                      <td
                        key={day}
                        className={`p-4 transition-all vertical-top ${
                          assigned ? "bg-[#3b5d8f]/5" : ""
                        }`}
                      >
                        {assigned ? (
                          <div className="space-y-2">
                            <div className="font-medium text-white text-xs leading-tight">
                              {assigned.recipe_name ||
                                `Recipe ID: ${assigned.recipe_id}`}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={assigned.desired_servings}
                                min="1"
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setActivePlan(
                                    activePlan.map((p) =>
                                      p.day_of_week === day &&
                                      p.meal_type === type
                                        ? { ...p, desired_servings: val }
                                        : p,
                                    ),
                                  );
                                }}
                                className="w-12 bg-[#121214] border border-white/10 rounded-lg px-1.5 py-0.5 text-center text-xs text-white focus:outline-none focus:border-[#3b5d8f]"
                              />
                              <span className="text-[11px] text-slate-500 font-medium uppercase">
                                srv
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600 italic">
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
        </div>
      </div>
    </div>
  );
}
