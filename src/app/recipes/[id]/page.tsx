import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Recipe, RecipeIngredient, Instruction } from '@/types/recipe';
import { createClient } from '@/utils/supabase/server';

interface RecipeWithUser extends Recipe {
  user?: {
    email: string;
  };
}

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

async function fetchMealDBRecipe(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.meals || !data.meals[0]) return null;
    
    const meal = data.meals[0];
    
    // Extract ingredients
    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          id: `${meal.idMeal}-${i}`,
          name: ingredient.trim(),
          amount: parseFloat(measure?.trim() || '1') || 1,
          unit: measure?.trim().replace(/^[\d.]+\s*/, '') || 'piece'
        });
      }
    }
    
    // Extract instructions
    const instructions: Instruction[] = meal.strInstructions
      .split(/\r\n|\n|\r/)
      .map((step: string, index: number) => ({
        id: `${meal.idMeal}-step-${index + 1}`,
        text: step.trim()
      }))
      .filter((step: Instruction) => step.text.length > 0);
    
    return {
      id: meal.idMeal,
      title: meal.strMeal,
      description: `${meal.strCategory} dish from ${meal.strArea} cuisine. ${meal.strTags ? `Tags: ${meal.strTags}` : ''}`,
      image: meal.strMealThumb,
      cookingTime: 30, // Default value
      servings: 4, // Default value
      cuisine: meal.strArea || 'International',
      difficulty: 'medium', // Default value
      ingredients,
      instructions,
      cuisine_type: meal.strArea,
      dietary_restrictions: []
    };
  } catch (error) {
    console.error('Error fetching MealDB recipe:', error);
    return null;
  }
}

export default async function RecipePage({
  params,
}: {
  params: { id: string };
}) {
  let recipe: RecipeWithUser | null = null;
  let isExternalRecipe = false;
  
  // Try to fetch from Supabase first
  const supabase = createClient();
  const { data: supabaseRecipe, error: supabaseError } = await supabase
    .from('recipes')
    .select('*, user:user_id(email)')
    .eq('id', params.id)
    .single<RecipeWithUser>();
  
  if (supabaseError || !supabaseRecipe) {
    // If not found in Supabase, try MealDB
    recipe = await fetchMealDBRecipe(params.id);
    if (recipe) {
      isExternalRecipe = true;
    }
  } else {
    recipe = supabaseRecipe;
  }

  if (!recipe) {
    notFound();
  }

  // Check if current user is the owner (only for Supabase recipes)
  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = !isExternalRecipe && session?.user.id === recipe.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        <div className="flex gap-4">
          {isOwner && (
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="rounded-md bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
            >
              Edit Recipe
            </Link>
          )}
          <Link
            href="/recipes"
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            Back to Recipes
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative mb-6 h-96 w-full overflow-hidden rounded-lg">
            {recipe.image ? (
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold">About this Recipe</h2>
            <p className="text-gray-600">{recipe.description || 'No description provided'}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cooking Time</h3>
              <p>{recipe.cookingTime} minutes</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Servings</h3>
              <p>{recipe.servings} servings</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Difficulty</h3>
              <p className="capitalize">{recipe.difficulty}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cuisine</h3>
              <p>{recipe.cuisine_type || 'Not specified'}</p>
            </div>
          </div>

          {recipe.dietary_restrictions && recipe.dietary_restrictions.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-gray-500">Dietary Information</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.dietary_restrictions.map((restriction: string) => (
                  <span
                    key={restriction}
                    className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                  >
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient: RecipeIngredient, index: number) => (
                <li key={ingredient.id || index} className="flex items-center gap-2">
                  <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                  <span>{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction: Instruction, index: number) => (
                <li key={instruction.id || index} className="flex gap-4">
                  <span className="font-medium text-gray-400">{index + 1}.</span>
                  <span>{instruction.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {recipe.user && (
        <div className="mt-8 border-t pt-4 text-sm text-gray-500">
          <p>Created by {recipe.user.email}</p>
        </div>
      )}
    </div>
  );
} 