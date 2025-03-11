'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Pagination,
} from '@mui/material';
import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import type { Recipe } from '@/types/ingredient';

const ITEMS_PER_PAGE = 12;

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const searchParams = new URLSearchParams({
        query,
        ...(cuisine && { cuisine }),
        ...(diet && { diet }),
        offset: ((page - 1) * ITEMS_PER_PAGE).toString(),
        number: ITEMS_PER_PAGE.toString(),
      });

      const response = await fetch(`/api/recipes/search?${searchParams}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to search recipes');

      setRecipes(data.results);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    fetchRecipes();
  };

  const fetchRecipes = async () => {
    setLoading(true);
    
    try {
      const searchParams = new URLSearchParams({
        query,
        ...(cuisine && { cuisine }),
        ...(diet && { diet }),
        offset: ((page - 1) * ITEMS_PER_PAGE).toString(),
        number: ITEMS_PER_PAGE.toString(),
      });

      const response = await fetch(`/api/recipes/search?${searchParams}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to search recipes');

      setRecipes(data.results);
      setTotalResults(data.totalResults);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Search Recipes
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search recipes"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter keywords (e.g., chicken pasta)"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Cuisine</InputLabel>
                <Select
                  value={cuisine}
                  label="Cuisine"
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="italian">Italian</MenuItem>
                  <MenuItem value="mexican">Mexican</MenuItem>
                  <MenuItem value="chinese">Chinese</MenuItem>
                  <MenuItem value="indian">Indian</MenuItem>
                  <MenuItem value="japanese">Japanese</MenuItem>
                  <MenuItem value="thai">Thai</MenuItem>
                  <MenuItem value="mediterranean">Mediterranean</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Diet</InputLabel>
                <Select
                  value={diet}
                  label="Diet"
                  onChange={(e) => setDiet(e.target.value)}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="vegan">Vegan</MenuItem>
                  <MenuItem value="gluten-free">Gluten Free</MenuItem>
                  <MenuItem value="ketogenic">Ketogenic</MenuItem>
                  <MenuItem value="paleo">Paleo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : recipes.length > 0 ? (
          <>
            <Grid container spacing={3}>
              {recipes.map((recipe) => (
                <Grid item key={recipe.id} xs={12} sm={6} md={4} lg={3}>
                  <RecipeCard recipe={recipe} />
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        ) : query ? (
          <Typography color="text.secondary" align="center">
            No recipes found. Try different search terms or filters.
          </Typography>
        ) : null}
      </Container>
    </>
  );
} 