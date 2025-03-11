import { configureStore } from '@reduxjs/toolkit';
import recipeReducer from './slices/recipeSlice';
import ingredientReducer from './slices/ingredientSlice';

export const store = configureStore({
  reducer: {
    recipes: recipeReducer,
    ingredients: ingredientReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 