'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Typography, TextField, Box, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { RootState } from '@/store/store';
import { setRecipes, appendRecipes, setLoading, setError } from '@/store/slices/recipeSlice';
import RecipeCard from '@/components/RecipeCard';
import Navbar from '@/components/Navbar';
import { Search as SearchIcon } from '@mui/icons-material';

export default function RecipesPage() {
  const dispatch = useDispatch();
  const { recipes, loading, error } = useSelector((state: RootState) => state.recipes);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const shouldResetPageRef = useRef(false);
  const currentSearchTerm = useRef('');
  const currentPage = useRef(1);
  const initialLoadDone = useRef(false);

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
      
      if (shouldResetPageRef.current || pageNum === 1) {
        dispatch(setRecipes(data.results));
        shouldResetPageRef.current = false;
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
        currentPage.current += 1;
        fetchRecipes(currentPage.current, currentSearchTerm.current);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchRecipes]);

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;
    
    shouldResetPageRef.current = true;
    currentSearchTerm.current = searchTerm;
    currentPage.current = 1;
    fetchRecipes(1, searchTerm);
  }, [searchTerm, fetchRecipes]);

  // Load initial recipes only once when component mounts
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      currentPage.current = 1;
      fetchRecipes(1, '');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          onChange={(e) => {
            // Only update the input value, don't trigger any fetches
            setSearchTerm(e.target.value);
          }}
          sx={{ mb: 4 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearch(e);
                  }}
                  aria-label="search recipes"
                  disabled={loading || !searchTerm.trim()}
                  sx={{
                    mr: 1,
                    color: '#666666',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <SearchIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              backgroundColor: '#F5F5F5',
              borderRadius: '12px',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              handleSearch(e);
            }
          }}
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