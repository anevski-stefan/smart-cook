'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Typography, TextField, Box, CircularProgress } from '@mui/material';
import { RootState } from '@/store/store';
import { setRecipes, appendRecipes, setLoading, setError } from '@/store/slices/recipeSlice';
import RecipeCard from '@/components/RecipeCard';
import Navbar from '@/components/Navbar';

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

export default function RecipesPage() {
  const dispatch = useDispatch();
  const { recipes, loading, error } = useSelector((state: RootState) => state.recipes);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchRecipes = useCallback(async (pageNum: number, searchQuery: string) => {
    dispatch(setLoading(true));
    try {
      const searchParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12'
      });
      
      if (searchQuery) {
        searchParams.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/recipes?${searchParams}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recipes');
      }
      
      if (pageNum === 1) {
        dispatch(setRecipes(data.results));
      } else {
        dispatch(appendRecipes(data.results));
      }
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      dispatch(setError('Failed to fetch recipes'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const lastRecipeElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Handle search and pagination
  useEffect(() => {
    const handleSearch = () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        if (page === 1) {
          fetchRecipes(1, searchTerm);
        } else {
          setPage(1); // This will trigger a new fetch through the page effect
        }
      }, DEBOUNCE_DELAY);
    };

    if (page === 1) {
      handleSearch();
    } else {
      fetchRecipes(page, searchTerm);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [page, searchTerm, fetchRecipes]);

  // Reset page when search term changes
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [searchTerm, page]);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Recipes
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Grid container spacing={3}>
          {recipes.map((recipe, index) => (
            <Grid 
              item 
              key={`${recipe.id}-${index}`} 
              xs={12} 
              sm={6} 
              md={4}
              ref={index === recipes.length - 1 ? lastRecipeElementRef : undefined}
            >
              <RecipeCard recipe={recipe} />
            </Grid>
          ))}
        </Grid>

        {loading && (
          <Box 
            ref={loadingRef}
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4, 
              mb: 4 
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center" sx={{ mt: 4 }}>
            {error}
          </Typography>
        )}

        {!loading && !hasMore && recipes.length > 0 && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            No more recipes to load
          </Typography>
        )}

        {!loading && recipes.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            No recipes found. Try a different search term.
          </Typography>
        )}
      </Container>
    </>
  );
} 