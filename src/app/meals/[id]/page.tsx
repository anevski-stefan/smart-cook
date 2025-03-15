'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
} from '@mui/material';
import { format } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import NutritionalInfo from '@/components/NutritionalInfo';
import ProtectedRoute from '@/components/ProtectedRoute';

interface MealPageProps {
  params: {
    id: string;
  };
}

interface Instruction {
  id?: string;
  text: string;
  description?: string;
  duration?: number;
  timerRequired?: boolean;
}

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Meal {
  id: string;
  title: string;
  description: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image?: string;
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at: string;
  notes?: string;
  tags?: string[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  user_email?: string;
}

export default function MealPage({ params }: MealPageProps) {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const supabase = createClient();

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error || !data) {
          notFound();
        }

        // Parse ingredients and instructions from description if they exist
        const parsedData = {
          ...data,
          ingredients: data.ingredients || [],
          instructions: data.instructions || []
        };

        setMeal(parsedData);
      } catch (error) {
        console.error('Error fetching meal:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [params.id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }

  if (!meal) {
    return notFound();
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {meal.title}
            </Typography>

            {meal.image && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 400,
                  mb: 4,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={meal.image}
                  alt={meal.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            )}

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {meal.description}
              </Typography>
            </Box>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Ingredients
                </Typography>
                <List>
                  {meal.ingredients.map((ingredient, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <Typography>
                        <strong>{ingredient.amount} {ingredient.unit}</strong> {ingredient.name}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {meal.instructions && meal.instructions.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
                <List>
                  {meal.instructions.map((instruction, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <Box>
                        <Typography variant="body1" sx={{ display: 'flex', gap: 2 }}>
                          <span style={{ color: 'text.secondary' }}>{index + 1}.</span>
                          {instruction.text}
                        </Typography>
                        {instruction.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 1,
                              pl: 4,
                              borderLeft: '2px solid',
                              borderColor: 'primary.main',
                              fontStyle: 'italic'
                            }}
                          >
                            {instruction.description}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Meal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {meal.type}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(meal.created_at), 'PPP')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Nutritional Information
              </Typography>
              <NutritionalInfo
                nutritionalInfo={meal.nutritional_info}
              />
            </Paper>

            {meal.tags && meal.tags.length > 0 && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {meal.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          Created by {meal.user_email}
        </Typography>
      </Container>
    </ProtectedRoute>
  );
} 