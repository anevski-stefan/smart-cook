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
  useTheme,
  useMediaQuery,
  Button,
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
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RecipePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentRecipe, loading, error } = useSelector(
    (state: RootState) => state.recipes
  );
  const [notification, setNotification] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<{
    id: number;
    text: string;
    description?: string;
  } | undefined>();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const renderLoginPrompt = () => (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Sign in to Access Cooking Assistant
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Please sign in to use the cooking assistant and camera features.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        href={`/auth/login?redirect=/recipes/${id}`}
      >
        Sign In
      </Button>
    </Paper>
  );

  return (
    <>
      <Navbar />
      <Container 
        maxWidth="xl" 
        sx={{ 
          mt: 4,
          px: { xs: 1, sm: 2, md: 3 }
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
              <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 2, sm: 3 },
                    mb: 3
                  }}
                >
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    width: '100%',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}>
                    <Typography 
                      variant="h4" 
                      component="h1"
                      sx={{
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' },
                        lineHeight: 1.2,
                        flex: 1,
                        minWidth: 0 // Allows text to wrap properly
                      }}
                    >
                      {currentRecipe.title}
                    </Typography>
                    {user && (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          gap: { xs: 1, sm: 2 },
                          ml: 'auto'
                        }}
                      >
                        <SaveRecipeButton recipeId={currentRecipe.id} />
                        <AddToShoppingList ingredients={currentRecipe.ingredients} />
                      </Box>
                    )}
                  </Box>
                </Box>

                <Typography 
                  variant="body1" 
                  paragraph 
                  sx={{ mb: 2 }}
                >
                  {currentRecipe.description.split('Tags:')[0].trim()}
                </Typography>

                {currentRecipe.description.includes('Tags:') && (
                  <Box 
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 3
                    }}
                  >
                    {currentRecipe.description
                      .split('Tags:')[1]
                      .split(',')
                      .map((tag) => (
                        <Chip
                          key={tag}
                          label={tag.trim()}
                          color="primary"
                          variant="outlined"
                          size={isMobile ? "small" : "medium"}
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
                        mb: { xs: 2, sm: 0 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box 
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: { xs: 1, sm: 2 },
                        mb: 3,
                        '& .MuiChip-root': {
                          minWidth: { xs: 'calc(50% - 4px)', sm: 'auto' }
                        }
                      }}
                    >
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`${currentRecipe.readyInMinutes} minutes`}
                        sx={{ flex: { xs: '1 0 auto', sm: '0 1 auto' } }}
                      />
                      <Chip
                        icon={<GroupIcon />}
                        label={`${currentRecipe.servings} servings`}
                        sx={{ flex: { xs: '1 0 auto', sm: '0 1 auto' } }}
                      />
                      <Chip
                        icon={<RestaurantIcon />}
                        label={currentRecipe.cuisine}
                        sx={{ flex: { xs: '1 0 auto', sm: '0 1 auto' } }}
                      />
                      <Chip
                        icon={<SignalCellularAltIcon />}
                        label={currentRecipe.difficulty}
                        sx={{ flex: { xs: '1 0 auto', sm: '0 1 auto' } }}
                      />
                    </Box>

                    <Box mb={3}>
                      <NutritionalInfo nutritionalInfo={currentRecipe.nutritionalInfo} />
                    </Box>

                    <RecipeRating recipeId={currentRecipe.id} />
                  </Grid>

                  <Grid item xs={12} md={4} order={{ xs: 2, md: 1 }}>
                    <Box sx={{ position: 'sticky', top: 24 }}>
                      <RecipeIngredients ingredients={currentRecipe.ingredients} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8} order={{ xs: 1, md: 2 }}>
                    {user ? (
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
                    ) : renderLoginPrompt()}
                  </Grid>

                  <Grid item xs={12} order={3}>
                    {user ? (
                      <CameraAssistant 
                        currentStep={currentStep}
                        ingredients={currentRecipe.ingredients.map(ingredient => ({
                          ...ingredient,
                          amount: ingredient.amount.toString()
                        }))}
                      />
                    ) : null}
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
          anchorOrigin={{ 
            vertical: 'bottom', 
            horizontal: 'center' 
          }}
        >
          <Alert 
            onClose={() => setNotification(null)} 
            severity="success"
            sx={{ width: '100%' }}
          >
            {notification}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
} 