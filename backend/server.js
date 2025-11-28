// backend/server.js
const express = require("express");
const cors = require("cors");

//In a real project, I would create a shared module and import these helper functions used below from there
const {
    validateAndBuildRecipe,
    searchRecipesByIngredients,
    makeId,
} = require("./shared/recipeUtils");


// In a real system this would be persisted in a database. 
// For this exercise, I am using an in-memory array so the focus is on the domain logic and API design.
const recipes = [];

const app = express();

app.use(cors());
app.use(express.json());

// Simple "current user" mechanism: from header or query
function getCurrentUserId(req) {
    return (
        req.header("x-user-id") ||
        req.query.ownerId ||
        "user-123" // default to the same id as the frontend demo
    );
}

//Creates a new recipe for the current user.
app.post("/recipes", (req, res) => {
    const ownerId = getCurrentUserId(req);

    const draft = req.body;
    //   Body: {
    //     title: string,
    //     ingredientStrings: string[],
    //     instructions: string[],
    //     photoUrls?: string[],
    //     tags?: string[]
    //   }

    const result = validateAndBuildRecipe(draft, ownerId);

    if (!result.ok) {
        return res.status(400).json({
            message: "Invalid recipe",
            errors: result.errors,
        });
    }

    recipes.push(result.recipe);
    return res.status(201).json(result.recipe);
});

// Returns all recipes for the current user.
app.get("/recipes", (req, res) => {
    const ownerId = getCurrentUserId(req);
    const userRecipes = recipes.filter((r) => r.ownerId === ownerId);
    res.json(userRecipes);
});


//Copies a recipe from another user into the current user's collection.
app.post("/recipes/save-from-user", (req, res) => {
    const currentUserId = getCurrentUserId(req);

    const sourceRecipe = req.body.sourceRecipe;
    //    Body: {
    //     sourceRecipe: Recipe
    //   }

    if (!sourceRecipe || !sourceRecipe.id) {
        return res.status(400).json({
            message: "sourceRecipe with a valid id is required",
        });
    }

    const now = new Date().toISOString();
    const copy = {
        ...sourceRecipe,
        id: makeId(),
        ownerId: currentUserId,
        sourceType: "saved",
        sourceRecipeId: sourceRecipe.id,
        createdAt: now,
        updatedAt: now,
    };

    recipes.push(copy);
    res.status(201).json(copy);
});


//Search by ingredients for the current user.
app.get("/recipes/search", (req, res) => {
    const ownerId = getCurrentUserId(req);

    const mode = req.query.mode === "all" ? "all" : "any";
    const ingredientsParam = req.query.ingredients || "";
    //   Query params example:
    //     ingredients=garlic,tomato
    //     mode=any | all  (default "any")

    const ingredientNames = ingredientsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const userRecipes = recipes.filter((r) => r.ownerId === ownerId);
    const results = searchRecipesByIngredients(userRecipes, ingredientNames, mode);

    res.json(results);
});

//Test endpoint
app.get("/test", (_req, res) => {
    res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`RecipeKeeper API listening on port ${PORT}`);
});
