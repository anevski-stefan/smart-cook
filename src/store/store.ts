import { configureStore, Middleware } from '@reduxjs/toolkit';
import recipeReducer from './slices/recipeSlice';
import ingredientReducer from './slices/ingredientSlice';

// Create store with reducers
export const store = configureStore({
  reducer: {
    recipes: recipeReducer,
    ingredients: ingredientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      // Simple logging middleware
      ((store) => (next) => (action) => {
        // Only log recipe-related actions
        if (typeof action === 'object' && action !== null && 'type' in action && typeof action.type === 'string' && action.type.startsWith('recipes/')) {
          console.log('[Redux] Action:', action);
          const result = next(action);
          console.log('[Redux] New Recipe State:', store.getState().recipes);
          return result;
        }
        return next(action);
      }) as Middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 