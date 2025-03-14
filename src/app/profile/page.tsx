'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/utils/supabase-client';

interface WeeklyGoal {
  week: string;
  calories: number;
  meals: number;
}

interface Progress {
  caloriesMet: string;
  mealsMade: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
  });

  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal>({
    week: '',
    calories: 0,
    meals: 0,
  });

  const [progress] = useState<Progress>({
    caloriesMet: '',
    mealsMade: '',
  });

  const [previousGoals, setPreviousGoals] = useState<WeeklyGoal[]>([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user?.id);

        if (error) {
          console.error('Error fetching goals:', error.message);
          throw error;
        }

        setPreviousGoals(data as WeeklyGoal[]);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchGoals();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWeeklyGoals((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
          weekly_goals: weeklyGoals,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', borderRadius: '8px', padding: '2rem' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  sx={{ width: 100, height: 100, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                  Profile Settings
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Avatar URL"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  disabled={loading}
                  helperText="Enter a URL for your profile picture"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Weekly Goals
                </Typography>
                <TextField
                  fullWidth
                  label="Weekly Calories"
                  name="calories"
                  value={weeklyGoals.calories}
                  onChange={handleGoalsChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Weekly Meals"
                  name="meals"
                  value={weeklyGoals.meals}
                  onChange={handleGoalsChange}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Progress
                </Typography>
                <Typography>Calories Met: {progress.caloriesMet}</Typography>
                <Typography>Meals Made: {progress.mealsMade}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Previous Goals
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Week</TableCell>
                        <TableCell>Calories</TableCell>
                        <TableCell>Meals</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previousGoals.map((goal, index) => (
                        <TableRow key={index}>
                          <TableCell>{goal.week}</TableCell>
                          <TableCell>{goal.calories}</TableCell>
                          <TableCell>{goal.meals}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email: {user?.email}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ background: 'linear-gradient(45deg, #66bb6a, #43a047)', color: '#fff', '&:hover': { background: 'linear-gradient(45deg, #43a047, #66bb6a)' } }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {message && (
          <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={handleCloseMessage}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseMessage}
              severity={message.type}
              sx={{ width: '100%' }}
            >
              {message.text}
            </Alert>
          </Snackbar>
        )}
      </Container>
    </ProtectedRoute>
  );
} 