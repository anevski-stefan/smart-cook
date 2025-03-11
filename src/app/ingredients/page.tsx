'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import KitchenIcon from '@mui/icons-material/Kitchen';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '@/utils/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

interface UserIngredient {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  created_at: string;
}

export default function IngredientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<UserIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchIngredients();
    }
  }, [user]);

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ingredients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group ingredients with the same name and unit
      const groupedIngredients = (data || []).reduce((acc: UserIngredient[], curr) => {
        const existingIngredient = acc.find(
          item => 
            item.name.toLowerCase() === curr.name.toLowerCase() && 
            item.unit === curr.unit
        );

        if (existingIngredient) {
          // Update existing ingredient quantity
          existingIngredient.quantity += curr.quantity;
          // Keep the most recent created_at date
          existingIngredient.created_at = new Date(existingIngredient.created_at) > new Date(curr.created_at) 
            ? existingIngredient.created_at 
            : curr.created_at;
          return acc;
        } else {
          // Add new ingredient
          return [...acc, curr];
        }
      }, []);

      setIngredients(groupedIngredients);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      setError('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const deleteIngredient = async (ingredientId: string) => {
    try {
      const { error } = await supabase
        .from('user_ingredients')
        .delete()
        .eq('id', ingredientId);

      if (error) throw error;

      // Refetch ingredients to ensure proper grouping after deletion
      fetchIngredients();
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      setError('Failed to delete ingredient');
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={2}
          mb={4}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                fontWeight: 600,
                mb: 1
              }}
            >
              My Ingredients
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Manage your pantry ingredients and track what you have on hand
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/scan')}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Add Ingredients
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : ingredients.length === 0 ? (
          <Paper 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'background.default'
            }}
          >
            <KitchenIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Your pantry is empty
            </Typography>
            <Typography color="text.secondary" paragraph>
              Start by scanning ingredients to add them to your list
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => router.push('/scan')}
              sx={{ mt: 2 }}
            >
              Scan Ingredients
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <List disablePadding>
                  {ingredients.map((ingredient, index) => (
                    <ListItem
                      key={ingredient.id}
                      divider={index !== ingredients.length - 1}
                      sx={{
                        px: { xs: 2, sm: 3 },
                        py: { xs: 2, sm: 2.5 },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1"
                            sx={{ 
                              fontWeight: 500,
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          >
                            {ingredient.name}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mt: 0.5,
                              fontSize: { xs: '0.875rem', sm: '0.95rem' }
                            }}
                          >
                            {`${ingredient.quantity} ${ingredient.unit}`}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={new Date(ingredient.created_at).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            display: { xs: 'none', sm: 'flex' },
                            bgcolor: 'background.default'
                          }}
                        />
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => deleteIngredient(ingredient.id)}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.lighter',
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
} 