import { createClient } from '@/utils/supabase/client';
import type { Recipe, DifficultyLevel, RecipeIngredient, Instruction } from '@/types/recipe';

/**
 * Gets the list of saved recipe IDs for the current authenticated user
 * @returns Promise<string[]> Array of recipe IDs
 */
export async function getSavedRecipes(): Promise<string[]> {
  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Not authenticated in getSavedRecipes');
      return []; // Return empty array instead of throwing
    }

    const userId = session.user.id;
    console.log('Fetching saved recipes for user:', userId);
    
    // First, let's check if the saved_recipes table exists and what columns it has
    const { data: tableInfo, error: tableError } = await supabase
      .from('saved_recipes')
      .select('*')
      .limit(1);
      
    if (tableError) {
      console.error('Error checking saved_recipes table:', tableError);
      console.error('Table error details:', {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      });
    } else {
      console.log('saved_recipes table exists. Sample data structure:', 
        tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : 'No data found');
    }
    
    // Now fetch the user's saved recipes
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('recipe_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching saved recipes:', error);
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return []; // Return empty array instead of throwing
    }

    if (data && data.length > 0) {
      console.log('Sample saved recipe data:', data[0]);
    }
    
    console.log(`Found ${data?.length || 0} saved recipes`);
    return data?.map(row => row.recipe_id) || [];
  } catch (error) {
    console.error('Error in getSavedRecipes:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Fetches a recipe by ID directly from Supabase
 * @param recipeId The ID of the recipe to fetch
 * @returns Promise with the recipe data
 */
export async function getRecipeById(recipeId: string): Promise<Recipe | null> {
  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('Not authenticated in getRecipeById');
      throw new Error('Not authenticated');
    }

    console.log('Fetching recipe details for:', recipeId);
    
    // Try to fetch from the meals table
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (mealError) {
      console.error(`Error fetching recipe ${recipeId} from meals table:`, mealError);
      
      // If the meal doesn't exist with the exact ID, try to fetch by title or other fields
      // This is a fallback in case the recipe_id in saved_recipes doesn't match the id in meals
      console.log('Trying to fetch meal by alternative methods...');
      
      // Try to fetch all meals and find one that might match
      const { data: allMeals, error: allMealsError } = await supabase
        .from('meals')
        .select('*')
        .limit(100);
        
      if (allMealsError) {
        console.error('Error fetching all meals:', allMealsError);
      } else if (allMeals && allMeals.length > 0) {
        console.log(`Found ${allMeals.length} meals in the database`);
        
        // Try to find a meal that might match the recipe ID
        // First, check if there's a meal with a matching external_id or similar field
        const matchingMeal = allMeals.find(m => 
          m.external_id === recipeId || 
          m.id === recipeId || 
          m.recipe_id === recipeId ||
          (m.title && m.title.includes(recipeId))
        );
        
        if (matchingMeal) {
          console.log('Found a potentially matching meal:', matchingMeal.id);
          return createRecipeFromMeal(matchingMeal);
        }
      }
      
      // Try to fetch from external API (The Meal DB)
      try {
        console.log(`Trying to fetch recipe ${recipeId} from external API...`);
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.meals && data.meals.length > 0) {
            const apiMeal = data.meals[0];
            console.log('Found recipe in external API:', apiMeal.strMeal);
            
            // Extract ingredients
            const ingredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = apiMeal[`strIngredient${i}`];
              const measure = apiMeal[`strMeasure${i}`];
              
              if (ingredient && ingredient.trim()) {
                ingredients.push({
                  name: ingredient.trim(),
                  amount: 1,
                  unit: measure?.trim() || ''
                });
              }
            }
            
            // Extract instructions
            const instructions = apiMeal.strInstructions
              .split(/\r\n|\n|\r/)
              .filter((step: string) => step.trim().length > 0)
              .map((step: string) => ({
                text: step.trim(),
                timerRequired: false
              }));
            
            // Create a recipe object from the API data
            return {
              id: recipeId,
              title: apiMeal.strMeal,
              description: `${apiMeal.strCategory} dish from ${apiMeal.strArea} cuisine`,
              image: apiMeal.strMealThumb,
              cookingTime: 30, // Default value
              readyInMinutes: 30, // Default value
              servings: 4, // Default value
              difficulty: 'medium',
              cuisine: apiMeal.strArea || '',
              categories: [apiMeal.strCategory],
              summary: '',
              nutritionalInfo: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0
              },
              ingredients,
              instructions,
              user_id: session.user.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
        }
      } catch (apiError) {
        console.error('Error fetching from external API:', apiError);
      }
      
      // For other errors, return a minimal recipe object instead of throwing
      console.error(`Could not find recipe ${recipeId} in any source, returning fallback`);
      return {
        id: recipeId,
        title: `Recipe ${recipeId}`,
        description: 'Recipe details could not be loaded',
        image: 'https://via.placeholder.com/300x200?text=Recipe+Not+Found',
        ingredients: [],
        instructions: [],
        cookingTime: 30,
        readyInMinutes: 30,
        difficulty: 'medium',
        servings: 4,
        nutritionalInfo: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        user_id: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    if (!meal) {
      console.log(`Recipe ${recipeId} not found (null data)`);
      return null;
    }

    console.log('Raw meal data:', meal);
    
    return createRecipeFromMeal(meal);
  } catch (error) {
    console.error('Error in getRecipeById:', error);
    // Return null instead of throwing to prevent infinite loops
    return null;
  }
}

/**
 * Helper function to create a Recipe object from a meal record
 */
function createRecipeFromMeal(meal: {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  cooking_time?: number;
  ready_in_minutes?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string;
  categories?: string[];
  summary?: string;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  ingredients?: Partial<RecipeIngredient>[];
  instructions?: Partial<Instruction>[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}): Recipe {
  // Combine all data and ensure all required fields are present
  const completeRecipe: Recipe = {
    id: meal.id || 'unknown',
    title: meal.title || 'Untitled Recipe',
    description: meal.description || '',
    image: meal.image || 'https://via.placeholder.com/300x200?text=No+Image',
    cookingTime: meal.cooking_time || 30,
    readyInMinutes: meal.ready_in_minutes || 30,
    servings: meal.servings || 4,
    difficulty: (meal.difficulty as DifficultyLevel) || 'medium',
    cuisine: meal.cuisine || '',
    categories: meal.categories || [],
    summary: meal.summary || '',
    nutritionalInfo: meal.nutritional_info ? {
      calories: meal.nutritional_info.calories || 0,
      protein: meal.nutritional_info.protein || 0,
      carbs: meal.nutritional_info.carbs || 0,
      fat: meal.nutritional_info.fat || 0
    } : {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    ingredients: (meal.ingredients || []).map(ing => ({
      name: ing.name || 'Unknown ingredient',
      amount: ing.amount || 1,
      unit: ing.unit || 'piece'
    })),
    instructions: (meal.instructions || []).map(inst => ({
      text: inst.text || 'No instructions provided',
      timerRequired: inst.timerRequired || false
    })),
    user_id: meal.user_id || 'unknown',
    createdAt: meal.created_at || new Date().toISOString(),
    updatedAt: meal.updated_at || new Date().toISOString()
  };

  console.log('Recipe details fetched successfully:', completeRecipe.title);
  return completeRecipe;
}

/**
 * Saves a recipe for the current authenticated user
 * @param recipeId The ID of the recipe to save
 * @returns Promise with the result of the operation
 */
export async function saveRecipe(recipeId: string) {
  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;
    console.log('Saving recipe:', recipeId, 'for user:', userId);
    
    const { error } = await supabase
      .from('saved_recipes')
      .insert({ recipe_id: recipeId, user_id: userId });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveRecipe:', error);
    throw error;
  }
}

/**
 * Removes a saved recipe for the current authenticated user
 * @param recipeId The ID of the recipe to unsave
 * @returns Promise with the result of the operation
 */
export async function unsaveRecipe(recipeId: string) {
  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;
    console.log('Unsaving recipe:', recipeId, 'for user:', userId);
    
    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .match({ recipe_id: recipeId, user_id: userId });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unsaveRecipe:', error);
    throw error;
  }
}

/**
 * Saves a recipe from the external API to our database
 * @param recipe The recipe to save
 * @returns Promise with the result of the operation
 */
export async function saveRecipeToDatabase(recipe: Recipe) {
  try {
    // Create authenticated Supabase client
    const supabase = createClient();
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    console.log('Saving recipe to database:', recipe.title);
    
    // Prepare the meal data
    const mealData = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image,
      cooking_time: recipe.cookingTime,
      ready_in_minutes: recipe.readyInMinutes,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cuisine: recipe.cuisine,
      categories: recipe.categories,
      summary: recipe.summary,
      nutritional_info: recipe.nutritionalInfo,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: 'IMPORTED'
    };
    
    // Insert the meal into the database
    const { data, error } = await supabase
      .from('meals')
      .upsert(mealData)
      .select();

    if (error) {
      console.error('Error saving recipe to database:', error);
      throw error;
    }

    console.log('Recipe saved to database successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error in saveRecipeToDatabase:', error);
    throw error;
  }
} 