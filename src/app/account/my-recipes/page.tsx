'use client';

import { useReducer, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/types/recipe';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Create a stable Supabase client
const supabase = createClient();

type State = {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Recipe[] }
  | { type: 'FETCH_ERROR'; payload: string };

const initialState: State = {
  recipes: [],
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        recipes: action.payload,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

export default function MyRecipes() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchRecipes = async () => {
    if (!user?.id) return;

    dispatch({ type: 'FETCH_START' });

    try {
      const { data, error: recipesError } = await supabase
        .from('recipes')
        .select('*, users(email)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;
      dispatch({ type: 'FETCH_SUCCESS', payload: data || [] });
    } catch (err) {
      console.error('Error fetching recipes:', err);
      dispatch({
        type: 'FETCH_ERROR',
        payload: err instanceof Error ? err.message : t('common.error'),
      });
    }
  };

  // Handle auth and initial fetch
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/auth/login?returnTo=/account/my-recipes');
      } else {
        fetchRecipes();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router]);

  const handleCreateRecipe = () => {
    router.push('/recipes/new');
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('navigation.myRecipes')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={fetchRecipes}
            sx={{ mr: 2 }}
            disabled={state.loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateRecipe}
          >
            {t('recipe.create')}
          </Button>
        </Box>
      </Box>

      {state.error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {state.error}
        </Alert>
      )}

      {state.loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : state.recipes.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="40vh"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('recipe.noRecipesFound')}
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            {t('recipe.createPrompt')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateRecipe}
            sx={{ mt: 2 }}
          >
            {t('recipe.create')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {state.recipes.map((recipe) => (
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
  );
} 