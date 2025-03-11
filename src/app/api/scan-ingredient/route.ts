import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export async function POST(request: Request) {
  try {
    // First verify that we have an API key
    if (!GEMINI_API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate image data
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Remove the data URL prefix to get just the base64 image data
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Validate base64 data
    try {
      atob(base64Image);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid base64 image data' },
        { status: 400 }
      );
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: "List all food ingredients visible in this image. Separate multiple ingredients with commas. Only list the ingredient names, no other text. If you can't identify any food ingredients, respond with 'unknown'."
        }, {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    console.log('Making request to Gemini API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      if (response.status === 401) {
        console.error('API Key authentication failed');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }
      
      // Return a more user-friendly error message
      return NextResponse.json(
        { error: 'Unable to analyze image. Please try again with a clearer photo.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));
    
    const ingredientsText = data.candidates[0]?.content?.parts[0]?.text?.trim();

    if (!ingredientsText || ingredientsText.toLowerCase() === 'unknown') {
      return NextResponse.json(
        { error: 'Could not identify any ingredients. Please try again with a clearer photo.' },
        { status: 400 }
      );
    }

    // Split the comma-separated ingredients and clean up each one
    const ingredients = ingredientsText
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);

    // Add each ingredient individually
    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Error scanning ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to process image. Please try again.' },
      { status: 500 }
    );
  }
} 