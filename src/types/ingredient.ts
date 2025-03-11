export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Instruction {
  number: number;
  step: string;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  description: string;
  readyInMinutes: number;
  servings: number;
  cuisine: string;
  difficulty: string;
  summary: string;
  nutritionalInfo: NutritionalInfo;
  ingredients: Ingredient[];
  instructions: Instruction[];
} 