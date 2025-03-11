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
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '@/utils/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

interface UserIngredient {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  unit: string;
  created_at: string;
}

export default function IngredientsPage() {
  const { user } = useAuth();
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

      setIngredients(data || []);
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

      setIngredients(ingredients.filter(ing => ing.id !== ingredientId));
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      setError('Failed to delete ingredient');
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Ingredients
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        ) : ingredients.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No ingredients yet. Start scanning ingredients to add them to your list!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <List>
                  {ingredients.map((ingredient) => (
                    <ListItem
                      key={ingredient.id}
                      divider
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <ListItemText
                        primary={ingredient.name}
                        secondary={`${ingredient.amount} ${ingredient.unit}`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={new Date(ingredient.created_at).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => deleteIngredient(ingredient.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
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