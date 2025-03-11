import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Recipe } from '@/types/ingredient';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

interface MealDBRecipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string;
  strYoutube: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Estimated cooking times based on category (in minutes)
const COOKING_TIMES: { [key: string]: number } = {
  'Beef': 45,
  'Chicken': 35,
  'Dessert': 40,
  'Lamb': 50,
  'Miscellaneous': 30,
  'Pasta': 25,
  'Pork': 40,
  'Seafood': 25,
  'Side': 20,
  'Starter': 20,
  'Vegan': 30,
  'Vegetarian': 25,
  'Breakfast': 20,
  'Goat': 45
};

// Estimated nutritional values per ingredient category (per 100g)
const NUTRITION_ESTIMATES: { [key: string]: { calories: number; protein: number; carbs: number; fat: number } } = {
  'meat': { calories: 250, protein: 25, carbs: 0, fat: 15 },
  'fish': { calories: 200, protein: 22, carbs: 0, fat: 12 },
  'vegetable': { calories: 50, protein: 2, carbs: 10, fat: 0 },
  'fruit': { calories: 60, protein: 1, carbs: 15, fat: 0 },
  'grain': { calories: 350, protein: 8, carbs: 70, fat: 2 },
  'dairy': { calories: 150, protein: 8, carbs: 12, fat: 8 },
  'spice': { calories: 0, protein: 0, carbs: 0, fat: 0 },
  'oil': { calories: 900, protein: 0, carbs: 0, fat: 100 },
  'other': { calories: 100, protein: 2, carbs: 15, fat: 5 }
};

function categorizeIngredient(ingredient: string): string {
  ingredient = ingredient.toLowerCase();
  if (/chicken|beef|pork|lamb|meat|goat/.test(ingredient)) return 'meat';
  if (/fish|salmon|tuna|shrimp|seafood/.test(ingredient)) return 'fish';
  if (/carrot|onion|garlic|pepper|vegetable|celery|lettuce|spinach|broccoli/.test(ingredient)) return 'vegetable';
  if (/apple|banana|orange|fruit|berry|lemon/.test(ingredient)) return 'fruit';
  if (/flour|rice|pasta|bread|oat|wheat|corn|grain/.test(ingredient)) return 'grain';
  if (/milk|cheese|cream|yogurt|butter/.test(ingredient)) return 'dairy';
  if (/salt|pepper|spice|powder|seasoning/.test(ingredient)) return 'spice';
  if (/oil|olive|vegetable oil|coconut oil/.test(ingredient)) return 'oil';
  return 'other';
}

function estimateNutritionalInfo(ingredients: string[]) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  ingredients.forEach(ingredient => {
    if (!ingredient) return;
    const category = categorizeIngredient(ingredient);
    const values = NUTRITION_ESTIMATES[category];
    // Assume average portion size of 100g per ingredient
    total.calories += values.calories;
    total.protein += values.protein;
    total.carbs += values.carbs;
    total.fat += values.fat;
  });
  // Adjust for 4 servings
  return {
    calories: Math.round(total.calories / 4),
    protein: Math.round(total.protein / 4),
    carbs: Math.round(total.carbs / 4),
    fat: Math.round(total.fat / 4)
  };
}

function getCookingTime(category: string, instructions: string): number {
  const baseTime = COOKING_TIMES[category] || 30;
  const steps = instructions.split('\r\n').filter(step => step.trim().length > 0);
  // Adjust time based on number of steps
  return baseTime + (steps.length * 5);
}

function getDifficulty(cookingTime: number, ingredientCount: number): string {
  const score = (cookingTime / 30) + (ingredientCount / 5);
  if (score <= 2) return 'Easy';
  if (score <= 4) return 'Medium';
  return 'Hard';
}

function extractIngredientsFromMealDB(meal: MealDBRecipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBRecipe];
    const measure = meal[`strMeasure${i}` as keyof MealDBRecipe];
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        id: `${meal.idMeal}-${i}`,
        name: ingredient.trim(),
        amount: parseFloat(measure?.trim() || '1') || 1,
        unit: measure?.trim().replace(/^[\d.]+\s*/, '') || 'piece'
      });
    }
  }
  return ingredients;
}

async function generateStepDescriptions(steps: string[], ingredients: Array<{ name: string; amount: number; unit: string }>): Promise<string[]> {
  try {
    const prompt = `For each cooking step, provide a clear explanation focusing on technique and ingredient usage.

Available ingredients:
${ingredients.map(ing => `- ${ing.amount} ${ing.unit} ${ing.name}`).join('\n')}

For each step:
1. Identify the main technique or action
2. Note which ingredients from the list are being used
3. Explain what this step achieves in the recipe
4. If the step mentions an ingredient with a different name (e.g., "biscuits" instead of "cookies"), clarify which ingredient from the list should be used

Steps:
${steps.join('\n')}

For each step, provide ONE LINE containing:
1. A clear explanation of what the step achieves
2. "(Technique: [main technique])"
3. If needed, "(Using: [correct ingredient name from list])"

Example:
Step: "Crush the biscuits and mix with melted butter"
Response: "Creates a firm cookie base for the dessert. (Technique: Crushing and mixing) (Using: Peanut Cookies with Butter)"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up and format descriptions
    return text.split('\n')
      .filter((line: string) => line.trim())
      .map((line: string) => line.trim())
      .map((line: string) => line.replace(/^["']|["']$/g, ''));
  } catch (error) {
    console.error('Error generating step descriptions:', error);
    return steps.map(() => '');
  }
}

function extractInstructionsFromMealDB(instructions: string) {
  const steps = instructions
    .split(/\r\n|\n|\r/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim());

  return steps;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching recipe from TheMealDB...', params.id);
    
    const response = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${params.id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch recipe from TheMealDB');
    }

    const data = await response.json();
    const meal = data.meals?.[0] as MealDBRecipe;

    if (!meal) {
      return NextResponse.json(
        { message: 'Recipe not found' },
        { status: 404 }
      );
    }

    const ingredients = extractIngredientsFromMealDB(meal);
    const cookingTime = getCookingTime(meal.strCategory, meal.strInstructions);
    const ingredientNames = Array.from({ length: 20 }, (_, i) => meal[`strIngredient${i + 1}` as keyof MealDBRecipe])
      .filter((name): name is string => !!name);
    const nutritionalInfo = estimateNutritionalInfo(ingredientNames);

    // Extract steps and generate descriptions with ingredient validation
    const steps = extractInstructionsFromMealDB(meal.strInstructions);
    const descriptions = await generateStepDescriptions(steps, ingredients);

    const recipe: Recipe = {
      id: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      description: `${meal.strCategory} dish from ${meal.strArea} cuisine. ${meal.strTags ? `Tags: ${meal.strTags}` : ''}`,
      readyInMinutes: cookingTime,
      servings: 4,
      cuisine: meal.strArea || 'International',
      difficulty: getDifficulty(cookingTime, ingredients.length),
      summary: `${meal.strCategory} dish from ${meal.strArea} cuisine`,
      nutritionalInfo,
      ingredients,
      instructions: steps.map((step, index) => ({
        id: `${meal.idMeal}-step-${index + 1}`,
        text: step,
        description: descriptions[index] || undefined,
        duration: estimateStepDuration(step),
        timerRequired: stepRequiresTimer(step)
      })),
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// Helper function to estimate step duration
function estimateStepDuration(step: string): number | undefined {
  const text = step.toLowerCase();
  if (text.includes('minute') || text.includes('min')) {
    const match = text.match(/(\d+)[\s-]*(minute|min)/);
    if (match) return parseInt(match[1]);
  }
  if (text.includes('hour')) {
    const match = text.match(/(\d+)[\s-]*hour/);
    if (match) return parseInt(match[1]) * 60;
  }
  // Estimate based on common cooking actions
  if (text.includes('boil') || text.includes('simmer')) return 15;
  if (text.includes('bake') || text.includes('roast')) return 30;
  if (text.includes('fry') || text.includes('sauté')) return 10;
  if (text.includes('rest') || text.includes('cool')) return 10;
  return undefined;
}

// Helper function to determine if a step needs a timer
function stepRequiresTimer(step: string): boolean {
  const text = step.toLowerCase();
  return text.includes('minute') || 
         text.includes('min') || 
         text.includes('hour') ||
         text.includes('until') ||
         text.includes('boil') ||
         text.includes('simmer') ||
         text.includes('bake') ||
         text.includes('roast') ||
         text.includes('rest') ||
         text.includes('cool');
} 