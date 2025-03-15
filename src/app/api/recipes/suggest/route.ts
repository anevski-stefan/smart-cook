import { NextResponse } from 'next/server';
import { suggestRecipesFromIngredients } from '@/utils/gemini-client';

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set');
}

export async function POST(request: Request) {
  try {
    console.log('Received recipe suggestion request');
    const { ingredients, basicIngredients } = await request.json();
    console.log('Ingredients received:', ingredients);
    console.log('Basic ingredients received:', basicIngredients);

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      console.error('Invalid ingredients list received:', ingredients);
      return NextResponse.json(
        { message: 'Invalid ingredients list' },
        { status: 400 }
      );
    }

    if (!Array.isArray(basicIngredients)) {
      console.error('Invalid basic ingredients list received:', basicIngredients);
      return NextResponse.json(
        { message: 'Invalid basic ingredients list' },
        { status: 400 }
      );
    }

    console.log('Requesting suggestions for ingredients:', ingredients);
    console.log('With basic ingredients:', basicIngredients);
    const suggestions = await suggestRecipesFromIngredients(ingredients, basicIngredients);
    console.log('Successfully received suggestions:', suggestions);
    
    return NextResponse.json({
      suggestions
    });
  } catch (error) {
    console.error('Error in recipe suggestion API route:', error);
    let errorMessage = 'Failed to get recipe suggestions';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      if (errorMessage.includes('API key')) {
        statusCode = 503;
      }
    }

    return NextResponse.json(
      { message: errorMessage },
      { status: statusCode }
    );
  }
} 