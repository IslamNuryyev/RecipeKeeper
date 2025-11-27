// src/App.jsx
import React, { useState } from "react";
import { useRecipeStore } from "./RecipeStore";

// This simulates a recipe that belongs to another user in the system
const SAMPLE_OTHER_USER_RECIPE = {
  id: "other-1",
  title: "Tomato Pasta",
  ownerId: "user-999", // different from currentUserId
  sourceType: "own",
  sourceRecipeId: null,
  ingredients: [
    { id: "ing-1", name: "pasta", displayName: "Pasta", amount: null, unit: null },
    { id: "ing-2", name: "tomato", displayName: "Tomato", amount: null, unit: null },
    { id: "ing-3", name: "garlic", displayName: "Garlic", amount: null, unit: null },
  ],
  instructions: [
    "Boil pasta until al dente.",
    "Cook tomatoes and garlic in a pan.",
    "Mix pasta with the sauce.",
  ],
  photoUrls: ["https://www.allrecipes.com/thmb/bF6FL8sPmakBygWfT4IpF51hgaY=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/11691-tomato-and-garlic-pasta-ddmfs-3x4-1-bf607984a23541f4ad936b33b22c9074.jpg"],
  tags: ["italian", "quick"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function App() {
  const { recipes, addRecipe, findByIngredients, saveRecipeFromUser } = useRecipeStore();

  // Form state for adding a recipe
  const [title, setTitle] = useState("");
  const [ingredientText, setIngredientText] = useState("");
  const [instructionText, setInstructionText] = useState("");
  const [formError, setFormError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Tracking if we've already saved the external recipe (just for UI feedback)
  const [hasSavedExternal, setHasSavedExternal] = useState(false);

  function handleAddRecipe(e) {
    e.preventDefault();
    setFormError("");

    // Convert comma-separated ingredients into array
    const ingredientStrings = ingredientText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Convert textarea (one instruction per line) into array
    const instructions = instructionText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const draft = {
      title,
      ingredientStrings,
      instructions,
      photoUrls: photoUrl ? [photoUrl] : [],
      tags: [],
    };

    try {
      addRecipe(draft);
      // Clear form on success
      setTitle("");
      setIngredientText("");
      setInstructionText("");
      setPhotoUrl("");
    } catch (err) {
      setFormError(err.message || "Something went wrong");
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const ingredients = searchText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const results = findByIngredients(ingredients, "any");
    setSearchResults(results);
  }

  function handleSaveExternalRecipe() {
    saveRecipeFromUser(SAMPLE_OTHER_USER_RECIPE);
    setHasSavedExternal(true);
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      <h1>Recipe Keeper</h1>

      {/* Add Recipe Form */}
      <section style={{ marginBottom: 32, padding: '1rem 2rem', border: "1px solid #ccc", borderRadius: 8, }}>
        <h2>Add a Recipe</h2>
        <form onSubmit={handleAddRecipe}>
          <div style={{ marginBottom: '2rem' }}>
            <label>
              Title:
              <br />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Garlic Chicken"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label>
              Ingredients (comma separated):
              <br />
              <input
                type="text"
                value={ingredientText}
                onChange={(e) => setIngredientText(e.target.value)}
                placeholder="e.g. chicken, garlic, salt"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label>
              Instructions (one step per line):
              <br />
              <textarea
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                placeholder={"e.g.\nMarinate the chicken.\nBake for 30 minutes."}
                rows={4}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>


          <div style={{ marginBottom: '2rem' }}>
            <label>
              Photo URL (optional):
              <br />
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/my-dish.jpg"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>

          {formError && (
            <div style={{ color: "red", marginBottom: 12 }}>
              {formError}
            </div>
          )}

          <button type="submit" style={{ padding: "8px 16px" }}>
            Add Recipe
          </button>
        </form>
      </section>

      {/* Example: Recipe from another user */}
      <section style={{ marginBottom: 32, padding: '1rem 2rem', border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Explore Recipies</h2>
        <p>
          <strong>{SAMPLE_OTHER_USER_RECIPE.title}</strong> by user{" "}
          <code>{SAMPLE_OTHER_USER_RECIPE.ownerId}</code>
        </p>
        <p>
          Ingredients:{" "}
          {SAMPLE_OTHER_USER_RECIPE.ingredients
            .map((i) => i.displayName)
            .join(", ")}
        </p>
        {SAMPLE_OTHER_USER_RECIPE.photoUrls &&
          SAMPLE_OTHER_USER_RECIPE.photoUrls.length > 0 && (
            <div style={{ margin: "16px 0" }}>
              <img
                src={SAMPLE_OTHER_USER_RECIPE.photoUrls[0]}
                alt={SAMPLE_OTHER_USER_RECIPE.title}
                style={{ maxWidth: "200px", borderRadius: 8, display: "block" }}
              />
            </div>
          )}

        <div>
          <em>Instructions:</em>
          <ol style={{ marginTop: 4, paddingLeft: 20 }}>
            {SAMPLE_OTHER_USER_RECIPE.instructions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
        <button
          onClick={handleSaveExternalRecipe}
          style={{ padding: "8px 16px" }}
          disabled={hasSavedExternal}
        >
          {hasSavedExternal ? "Saved to My Recipes" : "Save to My Recipes"}
        </button>
        {hasSavedExternal && (
          <p style={{ marginTop: 8, color: "green" }}>
            This recipe has been copied into your collection.
          </p>
        )}
      </section>

      {/* Search by Ingredients */}
      <section style={{ marginBottom: '2rem', padding: '1rem 2rem', border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Search by Ingredients</h2>
        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: 12 }}>
            <label>
              Ingredients to search (comma separated):
              <br />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="e.g. garlic, tomato"
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>
          <button type="submit" style={{ padding: "8px 16px" }}>
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3>Search Results</h3>
            <ul>
              {searchResults.map((r) => (
                <li key={r.id}>
                  <strong>{r.title}</strong> &nbsp;
                  <small>({r.ingredients.map((i) => i.displayName).join(", ")})</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {searchResults.length === 0 && searchText.trim() !== "" && (
          <p style={{ marginTop: 16 }}>No recipes matched those ingredients yet.</p>
        )}
      </section>

      {/* All Recipes */}
      <section style={{ padding: '1rem 2rem', border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Your Recipes ({recipes.length})</h2>
        {recipes.length === 0 ? (
          <p>No recipes yet. Add one above or save the external one.</p>
        ) : (
          <ul>
            {recipes.map((r) => (
              <li key={r.id} style={{ marginBottom: 8 }}>
                <strong>{r.title}</strong>{" "}
                <small>
                  [{r.sourceType === "own" ? "Your recipe" : "Saved from another user"}]
                </small>
                <br />
                <small>
                  Ingredients: {r.ingredients.map((i) => i.displayName).join(", ")}
                </small>

                {r.photoUrls && r.photoUrls.length > 0 && (
                  <div style={{ margin: "16px 0" }}>
                    <img
                      src={r.photoUrls[0]}
                      alt={r.title}
                      style={{ maxWidth: "200px", borderRadius: 8, display: "block" }}
                    />
                  </div>
                )}

                {r.instructions && r.instructions.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <em>Instructions:</em>
                    <ol style={{ marginTop: 4, paddingLeft: 20 }}>
                      {r.instructions.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
