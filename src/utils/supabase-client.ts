import { createClient } from '@supabase/supabase-js';
import type { Recipe } from '@/types/ingredient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function saveRecipe(recipeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('saved_recipes')
    .insert({ recipe_id: recipeId, user_id: user.id });
}

export async function unsaveRecipe(recipeId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('saved_recipes')
    .delete()
    .match({ recipe_id: recipeId, user_id: user.id });
}

export async function getSavedRecipes(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', user.id);

  if (error) throw error;
  return data.map(row => row.recipe_id);
}

export async function addUserIngredient(name: string, quantity?: number, unit?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('user_ingredients')
    .insert({
      name,
      quantity,
      unit,
      user_id: user.id,
    });
}

export async function getUserIngredients() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('user_ingredients')
    .select('*')
    .eq('user_id', user.id);
}

export async function rateRecipe(recipeId: string, rating: number, comment?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return supabase
    .from('recipe_ratings')
    .upsert({
      recipe_id: recipeId,
      user_id: user.id,
      rating,
      comment,
    });
}

export async function getRecipeRating(recipeId: string) {
  const { data, error } = await supabase
    .rpc('get_recipe_average_rating', { recipe_id: recipeId });

  if (error) throw error;
  return data;
} 