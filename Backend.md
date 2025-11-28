# Back-end (Node + Express)

How to run: node ./backend/server.js

For the technical challenge I also sketched a small back-end slice in Node/Express to show how I’d structure the server side for RecipeKeeper.

The API exposes:

 - POST /recipes - validates a draft (title, ingredient strings, instructions) using normalization rules, then creates a structured Recipe object.
 - GET /recipes - returns all recipes for the current user (derived from the x-user-id header / ownerId query).
 - POST /recipes/save-from-user - takes a sourceRecipe authored by another user and copies it into the current user’s collection, setting sourceType="saved" and sourceRecipeId.
 - GET /recipes/search – searches user’s recipes by ingredient names with any/all matching

 For the challenge I keep state in an in-memory array instead of a database, but the domain logic (makeId, validateAndBuildRecipe, searchRecipesByIngredients) is isolated so it can be reused in a real persistence layer (MongoDB)
