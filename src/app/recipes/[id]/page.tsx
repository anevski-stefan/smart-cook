import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Recipe, RecipeIngredient, Instruction } from '@/types/recipe';
import { createClient } from '@/utils/supabase/server';

interface RecipeWithUser extends Recipe {
  users: {
    email: string;
  };
}

export default async function RecipePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch recipe
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*, users(email)')
    .eq('id', params.id)
    .single<RecipeWithUser>();

  if (error || !recipe) {
    notFound();
  }

  // Check if current user is the owner
  const { data: { session } } = await supabase.auth.getSession();
  const isOwner = session?.user.id === recipe.userId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        {isOwner && (
          <div className="flex gap-4">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="rounded-md bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200"
            >
              Edit Recipe
            </Link>
            <Link
              href="/recipes"
              className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              Back to Recipes
            </Link>
          </div>
        )}
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
                <li key={index} className="flex items-center gap-2">
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
                <li key={index} className="flex gap-4">
                  <span className="font-medium text-gray-400">{index + 1}.</span>
                  <span>{instruction.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        <p>Created by {recipe.users.email}</p>
      </div>
    </div>
  );
} 