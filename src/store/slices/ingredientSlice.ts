import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScannedIngredient {
  id: string;
  name: string;
  image: string;
}

interface UserIngredient {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  unit: string;
  created_at: string;
}

interface IngredientState {
  scannedIngredients: ScannedIngredient[];
  userIngredients: UserIngredient[];
  loading: boolean;
  error: string | null;
}

const initialState: IngredientState = {
  scannedIngredients: [],
  userIngredients: [],
  loading: false,
  error: null,
};

const ingredientSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    addScannedIngredient: (state, action: PayloadAction<ScannedIngredient>) => {
      state.scannedIngredients.push(action.payload);
      state.error = null;
    },
    clearScannedIngredients: (state) => {
      state.scannedIngredients = [];
      state.error = null;
    },
    setUserIngredients: (state, action: PayloadAction<UserIngredient[]>) => {
      state.userIngredients = action.payload;
      state.error = null;
    },
    addUserIngredient: (state, action: PayloadAction<UserIngredient>) => {
      state.userIngredients.push(action.payload);
      state.error = null;
    },
    removeUserIngredient: (state, action: PayloadAction<string>) => {
      state.userIngredients = state.userIngredients.filter(
        (ingredient) => ingredient.id !== action.payload
      );
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addScannedIngredient,
  clearScannedIngredients,
  setUserIngredients,
  addUserIngredient,
  removeUserIngredient,
  setLoading,
  setError,
} = ingredientSlice.actions;

export default ingredientSlice.reducer; 