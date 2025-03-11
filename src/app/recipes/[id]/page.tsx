'use client';

import { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCurrentRecipe, setLoading, setError } from '@/store/slices/recipeSlice';
import Navbar from '@/components/Navbar';
import SaveRecipeButton from '@/components/SaveRecipeButton';
import RecipeRating from '@/components/RecipeRating';
import AddToShoppingList from '@/components/AddToShoppingList';
import NutritionalInfo from '@/components/NutritionalInfo';
import RecipeInstructions from '@/components/RecipeInstructions';
import RecipeIngredients from '@/components/RecipeIngredients';

export default function RecipePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentRecipe, loading, error } = useSelector(
    (state: RootState) => state.recipes
  );

  useEffect(() => {
    const fetchRecipe = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch(`/api/recipes/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch recipe');
        }

        dispatch(setCurrentRecipe(data));
      } catch (error) {
        console.error('Error fetching recipe:', error);
        dispatch(setError('Failed to load recipe'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error || !currentRecipe) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography color="error">{error || 'Recipe not found'}</Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" component="h1">
                  {currentRecipe.title}
                </Typography>
                <Box>
                  <SaveRecipeButton recipeId={currentRecipe.id} />
                  <AddToShoppingList ingredients={currentRecipe.ingredients} />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={currentRecipe.image}
                alt={currentRecipe.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                {currentRecipe.description}
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${currentRecipe.readyInMinutes} minutes`}
                />
                <Chip
                  icon={<GroupIcon />}
                  label={`${currentRecipe.servings} servings`}
                />
                <Chip
                  icon={<RestaurantIcon />}
                  label={currentRecipe.cuisine}
                />
                <Chip
                  icon={<SignalCellularAltIcon />}
                  label={currentRecipe.difficulty}
                />
              </Box>

              <Box mb={3}>
                <NutritionalInfo nutritionalInfo={currentRecipe.nutritionalInfo} />
              </Box>

              <RecipeRating recipeId={currentRecipe.id} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RecipeIngredients ingredients={currentRecipe.ingredients} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RecipeInstructions instructions={currentRecipe.instructions} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
} 