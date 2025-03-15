'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Typography, Grid, CircularProgress, Box, Alert, Button } from '@mui/material';
import { getSavedRecipes, unsaveRecipe } from '@/utils/recipes';
import RecipeCard from '@/components/RecipeCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Recipe } from '@/types/recipe';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';

export default function SavedRecipesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [invalidRecipeIds, setInvalidRecipeIds] = useState<string[]>([]);
  const isMounted = useRef(false);
  const fetchCount = useRef(0);

  // Function to remove invalid recipes from saved recipes
  const handleCleanupInvalidRecipes = async () => {
    if (!invalidRecipeIds.length) return;
    
    setLoading(true);
    try {
      // Remove each invalid recipe ID from saved recipes
      for (const id of invalidRecipeIds) {
        await unsaveRecipe(id);
        console.log(`Removed invalid recipe ID: ${id}`);
      }
      
      // Clear the invalid recipe IDs
      setInvalidRecipeIds([]);
      setDebugInfo('Invalid recipes have been removed from your saved recipes.');
      
      // Refresh the page to show updated list
      window.location.reload();
    } catch (error) {
      console.error('Error removing invalid recipes:', error);
      setError('Failed to remove invalid recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch recipe details directly from the external API
  const fetchRecipeFromAPI = useCallback(async (recipeId: string): Promise<Recipe | null> => {
    try {
      console.log(`Fetching recipe ${recipeId} directly from external API...`);
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.meals || data.meals.length === 0) {
        console.log(`Recipe ${recipeId} not found in external API`);
        return null;
      }
      
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
        user_id: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching recipe ${recipeId} from API:`, error);
      return null;
    }
  }, [user]);

  useEffect(() => {
    // Skip if auth is still loading or user is not authenticated
    if (authLoading || !user) {
      return;
    }

    // Prevent multiple fetches
    if (isMounted.current) {
      console.log('Component already mounted, skipping additional fetches');
      return;
    }
    
    isMounted.current = true;
    
    const fetchSavedRecipes = async () => {
      try {
        fetchCount.current += 1;
        console.log(`Fetch attempt #${fetchCount.current}`);
        
        if (fetchCount.current > 2) {
          console.error('Too many fetch attempts, breaking potential infinite loop');
          setLoading(false);
          setError('Too many fetch attempts. Please refresh the page.');
          return;
        }
        
        console.log('Fetching saved recipes...');
        const savedRecipeIds = await getSavedRecipes();
        console.log('Saved recipe IDs:', savedRecipeIds);
        
        if (savedRecipeIds.length === 0) {
          setRecipes([]);
          setLoading(false);
          setDebugInfo('No saved recipes found for this user.');
          return;
        }
        
        // Fetch recipe details for each saved recipe directly from the external API
        const invalidIds: string[] = [];
        const recipePromises = savedRecipeIds.map(id => {
          console.log(`Fetching details for recipe ${id} from API`);
          return fetchRecipeFromAPI(id)
            .then(recipe => {
              if (!recipe) {
                console.log(`Recipe ${id} not found in API, marking as invalid`);
                invalidIds.push(id);
                return null;
              }
              return recipe;
            })
            .catch(err => {
              console.error(`Error fetching recipe ${id} from API:`, err);
              invalidIds.push(id);
              return null;
            });
        });
        
        const recipeResults = await Promise.all(recipePromises);
        const validRecipes = recipeResults.filter(recipe => recipe !== null) as Recipe[];
        console.log(`Fetched ${validRecipes.length} valid recipes from API`);
        
        // Set invalid recipe IDs for potential cleanup
        if (invalidIds.length > 0) {
          setInvalidRecipeIds(invalidIds);
          setDebugInfo(`Found ${invalidIds.length} invalid recipe IDs that could not be loaded from the API. You can clean them up to remove them from your saved recipes.`);
        }
        
        if (validRecipes.length === 0 && savedRecipeIds.length > 0) {
          setDebugInfo(`Found ${savedRecipeIds.length} saved recipe IDs, but couldn't fetch any valid recipes from the API. IDs: ${savedRecipeIds.join(', ')}`);
        }
        
        setRecipes(validRecipes);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        setError(error instanceof Error ? error.message : t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [t, user, authLoading, fetchRecipeFromAPI]); // Add fetchRecipeFromAPI to the dependency array

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.savedRecipes')}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : recipes.length === 0 ? (
          <>
            <Typography color="text.secondary">
              {t('recipe.noRecipesFound')}
            </Typography>
            {debugInfo && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">Debug Info: {debugInfo}</Typography>
                {invalidRecipeIds.length > 0 && (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={handleCleanupInvalidRecipes}
                    sx={{ mt: 1 }}
                  >
                    Clean up invalid recipes
                  </Button>
                )}
              </Alert>
            )}
          </>
        ) : (
          <>
            <Grid container spacing={3}>
              {recipes.map((recipe) => (
                <Grid item key={recipe.id} xs={12} sm={6} md={4}>
                  <RecipeCard 
                    recipe={recipe}
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                  />
                </Grid>
              ))}
            </Grid>
            {debugInfo && (
              <Alert severity="info" sx={{ mt: 4 }}>
                <Typography variant="body2">Debug Info: {debugInfo}</Typography>
                {invalidRecipeIds.length > 0 && (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={handleCleanupInvalidRecipes}
                    sx={{ mt: 1 }}
                  >
                    Clean up invalid recipes
                  </Button>
                )}
              </Alert>
            )}
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
} 