import { NextResponse } from 'next/server';
import type { Recipe } from '@/types/ingredient';

interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularNutrition {
  nutrients: SpoonacularNutrient[];
}

interface SpoonacularIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
}

interface SpoonacularStep {
  number: number;
  step: string;
}

interface SpoonacularInstructions {
  steps: SpoonacularStep[];
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  summary: string;
  readyInMinutes: number;
  servings: number;
  cuisines: string[];
  nutrition: SpoonacularNutrition;
  extendedIngredients: SpoonacularIngredient[];
  analyzedInstructions: SpoonacularInstructions[];
}

interface SpoonacularSearchResponse {
  results: SpoonacularRecipe[];
  totalResults: number;
  offset: number;
  number: number;
}

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const cuisine = searchParams.get('cuisine');
    const diet = searchParams.get('diet');
    const offset = searchParams.get('offset') || '0';
    const number = searchParams.get('number') || '12';

    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!SPOONACULAR_API_KEY) {
      return NextResponse.json(
        { message: 'Spoonacular API key is not configured' },
        { status: 500 }
      );
    }

    const params = new URLSearchParams({
      apiKey: SPOONACULAR_API_KEY,
      query,
      offset,
      number,
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      ...(cuisine && { cuisine }),
      ...(diet && { diet }),
    });

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/complexSearch?${params}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes from Spoonacular');
    }

    const data = (await response.json()) as SpoonacularSearchResponse;

    // Transform the response to match our Recipe type
    const recipes: Recipe[] = data.results.map(recipe => ({
      id: recipe.id.toString(),
      title: recipe.title,
      image: recipe.image,
      description: recipe.summary,
      readyInMinutes: recipe.readyInMinutes,
      servings: recipe.servings,
      cuisine: recipe.cuisines?.[0] || 'Unknown',
      difficulty: getDifficulty(recipe.readyInMinutes),
      summary: recipe.summary,
      nutritionalInfo: {
        calories: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0),
        protein: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0),
        carbs: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0),
        fat: Math.round(recipe.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0),
      },
      ingredients: recipe.extendedIngredients.map(ingredient => ({
        id: ingredient.id.toString(),
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
      })),
      instructions: recipe.analyzedInstructions[0]?.steps.map(step => ({
        number: step.number,
        step: step.step,
      })) || [],
    }));

    return NextResponse.json({
      results: recipes,
      totalResults: data.totalResults,
    });
  } catch (error) {
    console.error('Error searching recipes:', error);
    return NextResponse.json(
      { message: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}

function getDifficulty(readyInMinutes: number): string {
  if (readyInMinutes <= 30) return 'Easy';
  if (readyInMinutes <= 60) return 'Medium';
  return 'Hard';
} 