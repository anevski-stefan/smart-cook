'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { getSavedRecipes } from '@/utils/supabase-client';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Recipe } from '@/types/ingredient';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function SavedRecipesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      try {
        const savedRecipeIds = await getSavedRecipes();
        
        // Fetch recipe details for each saved recipe
        const recipePromises = savedRecipeIds.map(id =>
          fetch(`/api/recipes/${id}`).then(res => res.json())
        );
        
        const recipes = await Promise.all(recipePromises);
        setRecipes(recipes);
      } catch (error) {
        console.error('Error fetching saved recipes:', error);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchSavedRecipes();
  }, [t]);

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('navigation.savedRecipes')}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : recipes.length === 0 ? (
          <Typography color="text.secondary">
            {t('recipe.noRecipesFound')}
          </Typography>
        ) : (
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
        )}
      </Container>
    </ProtectedRoute>
  );
} 