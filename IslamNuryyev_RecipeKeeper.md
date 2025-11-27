# 1. Overview

This document describes a **Recipe Keeper** application that allows users to:

- Create and store their own recipes  
- Save recipes authored by other users into their personal collection  
- Find recipes based on ingredients they have on hand  
- Attach photos to each recipe  

The implementation example uses **React.js** for the front-end, with a design that can be extended to a backend API and persistent data store.

---

# 2. Assumptions

- Authentication is already handled upstream (we receive a `currentUserId`).  
- For the purpose of the snippet, recipes live in-memory (via React state). In a real system, this would be backed by an API and database.  
- Photos are represented by URLs in the snippet; in a real app, file uploads would go to blob storage and we’d store the resulting URL.

---

# 3. Data Model

High-level recipe model:
```
type Ingredient = {
  id: string;
  name: string;        // normalized lowercase name ("garlic")
  displayName: string; // what the user typed ("Fresh Garlic Cloves")
  amount: number | null;
  unit: string | null; // "g", "cup", etc.
};

type Recipe = {
  id: string;
  title: string;
  ownerId: string;
  sourceType: "own" | "saved";
  sourceRecipeId: string | null;  // populated when recipe is saved from another user
  ingredients: Ingredient[];
  instructions: string[];
  photoUrls: string[];
  tags: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
```

> (Implementation uses a recipe object with fields for title, owner, ingredients, instructions, photos, tags, and timestamps.)

**Key ideas:**

- `sourceType` + `sourceRecipeId` differentiate between recipes a user created vs. recipes they saved from someone else.  
- Normalized ingredient names (lowercase) make it easy to perform fast equality-based ingredient search.  
- Display name preserves exactly what the user typed so the UI doesn’t feel “over-normalized.”

---

# 4. High-Level Architecture

Even though the snippet only shows the React layer, it is designed as if this were a small full-stack system.

## Front-end (React.js)

### `RecipeProvider` (Context)

- Owns recipe state.  
- Exposes domain operations:
  - `addRecipe(draft)`  
  - `saveRecipeFromUser(recipe)`  
  - `findByIngredients(ingredientNames, mode)`

### UI Components (not fully implemented in the snippet)

- **`RecipeForm`** – creates/edits recipes and calls `addRecipe`.  
- **`RecipeList`** – displays recipes from `useRecipeStore().recipes`.  
- **`RecipeSearch`** – lets users type ingredients and calls `findByIngredients`.

## Backend (conceptual)

- REST or GraphQL API:
  - `POST /recipes` – create a recipe  
  - `POST /recipes/:id/save` – save another user’s recipe into personal collection  
  - `GET /recipes?ingredients=chicken,garlic` – search by ingredients  

### Data store

- Relational (PostgreSQL) or document DB (MongoDB) keyed by `recipe_id` and indexed by owner + ingredient name.

For the exercise, API calls are kept abstracted out behind the React context. In a real implementation, `addRecipe` and `saveRecipeFromUser` would delegate to async API calls rather than updating local state only.

---

# 5. Focused Code Snippet: Why This Part?

The focus is on the **`RecipeStore`** (React Context + domain logic) because:

1. It shows how the domain is structured in a React application.  
2. It addresses all three core behaviours:
   - Create & store recipes (`addRecipe`).  
   - Save recipes from other users (`saveRecipeFromUser`).  
   - Find recipes based on ingredients (`findByIngredients` + `searchRecipesByIngredients`).  
3. It keeps UI concerns (forms, styling, layout) separate from business rules (validation, normalization, search).  
4. This makes it easier to test the logic in isolation and to evolve the UI without rewriting core logic.  
5. It centralizes **input validation and normalization** around the recipe model.

---

# 6. Extensibility & Trade-Offs

## What I would extend next (if this were production):

- Persist recipes via an API: replace `setRecipes` with async calls + optimistic updates.  
- Add pagination & sorting for large recipe collections.  
- Implement fuzzy search / partial matches for ingredients and search on both your recipes and other users’ recipes.  
- Improve ingredient parsing: automatically extract amount and unit from strings like `"2 cups flour"`.  
- Add tags & categories to better organize recipes.  
- Add image upload handling: integrate with a storage service and store returned URLs in `photoUrls`.  
- Introduce error boundaries and loading states around async operations.

## Trade-offs in this exercise:

- **In-memory storage only.** This keeps the snippet small and focused on the core logic instead of API wiring.  
- **Simple string-based ingredient search.** It’s enough to demonstrate the approach without pulling in external libraries.  
- **Minimal UI code.** UI pieces are kept conceptual so the snippet stays within scope and highlights domain structuring instead.
