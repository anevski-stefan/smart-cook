import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { UpdateRecipeInput, Instruction } from '@/types/recipe';

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

// GET /api/recipes/[id] - Get a single recipe
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Add timer information to instructions if present
    if (recipe.instructions) {
      recipe.instructions = recipe.instructions.map((instruction: Instruction) => ({
        ...instruction,
        timerRequired: stepRequiresTimer(instruction.text),
        duration: estimateStepDuration(instruction.text)
      }));
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}

// PATCH /api/recipes/[id] - Update a recipe
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const updates: UpdateRecipeInput = await request.json();

    // Verify user owns the recipe
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: recipe, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
  }
}

// DELETE /api/recipes/[id] - Delete a recipe
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify user owns the recipe
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
  }
} 