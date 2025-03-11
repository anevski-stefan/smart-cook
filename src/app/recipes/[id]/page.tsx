'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
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
import RecipeIngredients from '@/components/RecipeIngredients';
import CookingAssistant from '@/components/CookingAssistant';
import CameraAssistant from '@/components/CameraAssistant';

export default function RecipePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentRecipe, loading, error } = useSelector(
    (state: RootState) => state.recipes
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<{
    id: number;
    text: string;
    description?: string;
  } | undefined>();

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

  return (
    <>
      <Navbar />
      <Container 
        maxWidth={false} 
        sx={{ 
          mt: 4,
          maxWidth: '1400px !important'
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        ) : currentRecipe ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h4" component="h1">
                    {currentRecipe.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <SaveRecipeButton recipeId={currentRecipe.id} />
                    <AddToShoppingList ingredients={currentRecipe.ingredients} />
                  </Box>
                </Box>

                <Typography variant="body1" paragraph mb={2}>
                  {currentRecipe.description.split('Tags:')[0].trim()}
                </Typography>

                {currentRecipe.description.includes('Tags:') && (
                  <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
                    {currentRecipe.description
                      .split('Tags:')[1]
                      .split(',')
                      .map((tag) => (
                        <Chip
                          key={tag}
                          label={tag.trim()}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                  </Box>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box
                      component="img"
                      src={currentRecipe.image}
                      alt={currentRecipe.title}
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: 2,
                        mb: 2,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
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

                  <Grid item xs={12} md={4}>
                    <RecipeIngredients ingredients={currentRecipe.ingredients} />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <CookingAssistant 
                      instructions={currentRecipe.instructions}
                      ingredients={currentRecipe.ingredients}
                      totalRecipeTime={currentRecipe.readyInMinutes}
                      onComplete={() => {
                        setNotification('Congratulations! You have completed the recipe!');
                      }}
                      onStepChange={(step) => {
                        setCurrentStep(step);
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <CameraAssistant 
                      currentStep={currentStep}
                      ingredients={currentRecipe.ingredients.map(ingredient => ({
                        ...ingredient,
                        amount: ingredient.amount.toString()
                      }))}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        ) : null}

        <Snackbar
          open={!!notification}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setNotification(null)} 
            severity="success"
            variant="filled"
          >
            {notification}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
} 