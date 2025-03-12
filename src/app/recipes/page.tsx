'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Typography, Box, CircularProgress, IconButton } from '@mui/material';
import { RootState } from '@/store/store';
import { setRecipes, appendRecipes, setLoading, setError } from '@/store/slices/recipeSlice';
import RecipeCard from '@/components/RecipeCard';
import Navbar from '@/components/Navbar';
import { FilterList } from '@mui/icons-material';
import RecipeFilterSidebar, { RecipeFilters } from '@/components/RecipeFilterSidebar';
import type { Recipe } from '@/types/ingredient';
import { useRouter } from 'next/navigation';

const initialFilters: RecipeFilters = {
  searchTerm: '',
  cookingTime: [0, 180],
  complexity: [],
  mealType: [],
  dietary: [],
};

export default function RecipesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { recipes, loading, error } = useSelector((state: RootState) => {
    console.log('Current Redux State:', state.recipes);
    return state.recipes;
  });
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const shouldResetPageRef = useRef(false);
  const currentFilters = useRef(initialFilters);
  const currentPage = useRef(1);
  const initialLoadDone = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRecipes = useCallback(async (pageNum: number, filters: RecipeFilters) => {
    try {
      const searchParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12'
      });
      
      // Only add search params if they have values
      if (filters.searchTerm?.trim()) {
        searchParams.append('search', filters.searchTerm.trim());
      }

      // Add filter parameters only if they have values
      if (filters.complexity?.length > 0) {
        searchParams.append('complexity', filters.complexity.join(','));
      }
      if (filters.mealType?.length > 0) {
        searchParams.append('mealType', filters.mealType.join(','));
      }
      if (filters.dietary?.length > 0) {
        searchParams.append('dietary', filters.dietary.join(','));
      }

      // Only add time constraints if they're different from default
      const [minTime, maxTime] = filters.cookingTime;
      if (maxTime < 180) {
        searchParams.append('maxTime', maxTime.toString());
      }
      if (minTime > 0) {
        searchParams.append('minTime', minTime.toString());
      }
      
      const url = `/api/recipes?${searchParams}`;
      console.log('[Client] Fetching recipes from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Log full response details
      console.log('[Client] Response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        type: response.type,
        url: response.url,
        ok: response.ok
      });

      let data;
      try {
        const text = await response.text();
        console.log('[Client] Raw response text:', text);
        data = JSON.parse(text);
        console.log('[Client] Parsed API Response:', data);
      } catch (parseError) {
        console.error('[Client] Failed to parse response:', parseError);
        throw new Error('Failed to parse API response');
      }
      
      if (!response.ok) {
        console.error('[Client] Response not OK:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (!data.results || !Array.isArray(data.results)) {
        console.error('[Client] Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }

      // Filter recipes client-side to ensure time constraints are strictly met
      console.log('[Client] Filtering results with time constraints:', { minTime, maxTime });
      const results: Recipe[] = data.results.filter((recipe: Recipe) => {
        const cookingTime = recipe.readyInMinutes || 0;
        return cookingTime <= (maxTime < 180 ? maxTime : 180) && cookingTime >= minTime;
      });
      
      console.log('[Client] Filtered results:', results);

      if (shouldResetPageRef.current || pageNum === 1) {
        console.log('[Client] Setting initial recipes:', results);
        dispatch(setRecipes(results));
        shouldResetPageRef.current = false;
      } else {
        console.log('[Client] Appending recipes:', results);
        dispatch(appendRecipes(results));
      }
      setHasMore(data.hasMore && results.length > 0);
      dispatch(setLoading(false));
      dispatch(setError(''));
    } catch (err) {
      console.error('[Client] Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      
      dispatch(setLoading(false));
      dispatch(setError(err instanceof Error ? err.message : 'Failed to fetch recipes'));
    }
  }, [dispatch, shouldResetPageRef, setHasMore]);

  const debouncedFetchRecipes = useCallback((pageNum: number, newFilters: RecipeFilters) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Store the current filter values
    const filterSnapshot = { ...newFilters };

    // Set loading state only for new searches
    if (pageNum === 1) {
      console.log('Starting new search, clearing recipes');
      dispatch(setLoading(true));
      // Clear existing recipes when starting a new search
      dispatch(setRecipes([]));
    }

    fetchTimeoutRef.current = setTimeout(() => {
      currentFilters.current = filterSnapshot;
      fetchRecipes(pageNum, filterSnapshot);
    }, 300);
  }, [fetchRecipes, dispatch]);

  const handleFiltersChange = useCallback((newFilters: RecipeFilters) => {
    setFilters(newFilters);
    shouldResetPageRef.current = true;
    currentPage.current = 1;
    debouncedFetchRecipes(1, newFilters);
  }, [debouncedFetchRecipes]);

  const lastRecipeElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        currentPage.current += 1;
        fetchRecipes(currentPage.current, currentFilters.current);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchRecipes]);

  // Cleanup function
  useEffect(() => {
    const controller = abortControllerRef.current;
    const timeoutId = fetchTimeoutRef.current;

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (controller) {
        controller.abort();
      }
    };
  }, []);

  // Load initial recipes only once when component mounts
  useEffect(() => {
    console.log('[Client] Component mounted, initialLoadDone:', initialLoadDone.current);
    if (!initialLoadDone.current) {
      console.log('[Client] Starting initial load');
      dispatch(setLoading(true));
      dispatch(setError(''));
      initialLoadDone.current = true;
      currentPage.current = 1;
      currentFilters.current = initialFilters;
      fetchRecipes(1, initialFilters).catch(err => {
        console.error('[Client] Initial load error:', err);
        dispatch(setError('Failed to load initial recipes'));
      });
    }
  }, [fetchRecipes, dispatch]);

  // Log state changes
  useEffect(() => {
    console.log('[Client] State updated - recipes:', recipes.length, 'loading:', loading, 'error:', error);
  }, [recipes, loading, error]);

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <RecipeFilterSidebar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <Box sx={{ flex: 1 }}>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <IconButton
                onClick={() => setSidebarOpen(true)}
                sx={{ mr: 2, display: { sm: 'none' } }}
              >
                <FilterList />
              </IconButton>
              <Typography variant="h4" component="h1">
                Browse Recipes
              </Typography>
            </Box>

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
                  <RecipeCard 
                    recipe={recipe} 
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
                  />
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
                No recipes found. Try different filters.
              </Typography>
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
} 