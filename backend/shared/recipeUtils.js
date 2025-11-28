
// Helper function to generate ids that work in most browsers.
function makeId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return String(Math.random());
}

// Normalize a free-form ingredient string into a structured object.
function normalizeIngredient(raw) {
    const trimmed = raw.trim();

    return {
        id: makeId(),
        name: trimmed.toLowerCase(), // for searching
        displayName: trimmed, // shown in UI
        amount: null,
        unit: null,
    };
}


// Validates a recipe draft and returns either: { ok: true, recipe } or { ok: false, errors }
function validateAndBuildRecipe(draft, ownerId) {
    const errors = {};

    if (!draft.title || draft.title.trim().length < 3) {
        errors.title = "Title must be at least 3 characters long.";
    }

    const normalizedIngredients = (draft.ingredientStrings || [])
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(normalizeIngredient);

    if (normalizedIngredients.length === 0) {
        errors.ingredients = "At least one ingredient is required.";
    }

    const cleanedInstructions = (draft.instructions || [])
        .map((step) => step.trim())
        .filter((step) => step.length > 0);

    if (cleanedInstructions.length === 0) {
        errors.instructions = "At least one instruction step is required.";
    }

    if (Object.keys(errors).length > 0) {
        return { ok: false, errors };
    }

    const now = new Date().toISOString();

    const recipe = {
        id: makeId(),
        title: draft.title.trim(),
        ownerId,
        sourceType: "own",
        sourceRecipeId: null,
        ingredients: normalizedIngredients,
        instructions: cleanedInstructions,
        photoUrls: draft.photoUrls || [],
        tags: (draft.tags || []).map((t) => t.trim()).filter(Boolean),
        createdAt: now,
        updatedAt: now,
    };

    return { ok: true, recipe };
}

// Search recipes by ingredient names (case-insensitive).
function searchRecipesByIngredients(recipes, ingredientQueryStrings, mode = "any") {
    //If mode is set to any, recipe matches if it has at least one ingredient, can be set to all to match only recipes that have all ingredients (done in context layer)
    const querySet = new Set(
        (ingredientQueryStrings || [])
            .map((q) => q.trim().toLowerCase())
            .filter(Boolean)
    );

    if (querySet.size === 0) return [];

    return recipes.filter((recipe) => {
        const recipeIngredientNames = new Set(
            recipe.ingredients.map((ing) => ing.name)
        );

        let matchCount = 0;
        querySet.forEach((q) => {
            if (recipeIngredientNames.has(q)) {
                matchCount++;
            }
        });

        //if mode is set to "all", recipe must contain all ingredients
        if (mode === "all") {
            return matchCount === querySet.size;
        }

        // "any" mode
        return matchCount > 0;
    });
}

module.exports = {
    makeId,
    validateAndBuildRecipe,
    searchRecipesByIngredients,
};