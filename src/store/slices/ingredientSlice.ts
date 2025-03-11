import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScannedIngredient {
  id: string;
  name: string;
  image: string;
}

interface IngredientState {
  scannedIngredients: ScannedIngredient[];
  loading: boolean;
  error: string | null;
}

const initialState: IngredientState = {
  scannedIngredients: [],
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
  setLoading,
  setError,
} = ingredientSlice.actions;

export default ingredientSlice.reducer; 