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
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createClient } from '@supabase/supabase-js';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single Supabase client instance to be reused
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const categories = [
  'Weekly Calories',
  'Number of Meals',
  'Try New Recipes',
  'Cook a Balanced Meal',
  'Try an International Dish',
  'Reduce Food Waste',
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
  });
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState<{ id?: number; category: string; description: string; date?: Date }[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number | null>(null);

  useEffect(() => {
    // Load goals from Supabase or fallback to localStorage if table doesn't exist
    const fetchGoals = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('weeklygoals')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          // If the table doesn't exist, fallback to localStorage
          if (error.code === '42P01') {
            console.log('weeklygoals table does not exist, falling back to localStorage');
            const savedGoals = localStorage.getItem('weeklyGoals');
            if (savedGoals) {
              const parsedGoals = JSON.parse(savedGoals);
              // Convert date strings back to Date objects
              const formattedGoals = parsedGoals.map((goal: { category: string; description: string; date?: string }) => ({
                category: goal.category,
                description: goal.description,
                date: goal.date ? new Date(goal.date) : undefined,
              }));
              setGoals(formattedGoals);
            }
          } else {
            console.error('Error fetching goals:', error);
          }
          return;
        }
        
        if (data) {
          const formattedGoals = data.map(goal => ({
            id: goal.id,
            category: goal.category,
            description: goal.description,
            date: goal.date ? new Date(goal.date) : undefined,
          }));
          setGoals(formattedGoals);
        }
      } catch (error) {
        console.error('Error in fetchGoals:', error);
        // Fallback to localStorage
        const savedGoals = localStorage.getItem('weeklyGoals');
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals);
          // Convert date strings back to Date objects
          const formattedGoals = parsedGoals.map((goal: { category: string; description: string; date?: string }) => ({
            category: goal.category,
            description: goal.description,
            date: goal.date ? new Date(goal.date) : undefined,
          }));
          setGoals(formattedGoals);
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          avatar_url: formData.avatarUrl,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: t('profile.updateSuccess'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: t('profile.updateError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setMessage(null);
  };

  const handleAddGoal = async () => {
    if (!goal || !description) {
      setMessage({
        type: 'error',
        text: 'Please fill in all fields before adding a goal.',
      });
      return;
    }
    
    const newGoal = { 
      category: goal, 
      description,
      date: undefined
    };
    
    try {
      // Try to save to Supabase first
      if (user) {
        const { data, error } = await supabase
          .from('weeklygoals')
          .insert([{
            ...newGoal,
            user_id: user.id,
            week_start_date: new Date()
          }])
          .select();
          
        if (error) {
          // If table doesn't exist, fallback to localStorage
          if (error.code === '42P01') {
            console.log('weeklygoals table does not exist, saving to localStorage');
            const updatedGoals = [...goals, newGoal];
            setGoals(updatedGoals);
            localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
            
            setMessage({
              type: 'success',
              text: 'Goal saved locally!',
            });
          } else {
            console.error('Error saving goal:', error);
            setMessage({
              type: 'error',
              text: 'Failed to save goal.',
            });
            return;
          }
        } else {
          // Use the returned data instead of fetching again
          if (data && data.length > 0) {
            const newGoalWithId = {
              id: data[0].id,
              category: data[0].category,
              description: data[0].description,
              date: data[0].date ? new Date(data[0].date) : undefined,
            };
            
            setGoals(prevGoals => [...prevGoals, newGoalWithId]);
            
            setMessage({
              type: 'success',
              text: 'Goal saved!',
            });
            
            // Set current goal index to the newly added goal
            setCurrentGoalIndex(goals.length);
            setOpen(true);
            return;
          }
        }
      } else {
        // No user, save to localStorage
        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
        
        setMessage({
          type: 'success',
          text: 'Goal saved locally!',
        });
      }
    } catch (error) {
      console.error('Error in handleAddGoal:', error);
      // Fallback to localStorage
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
      
      setMessage({
        type: 'success',
        text: 'Goal saved locally!',
      });
    }
    
    setGoal('');
    setDescription('');
    setCurrentGoalIndex(goals.length);
    setOpen(true);
  };

  const handleDeleteGoal = async (index: number) => {
    try {
      if (user && goals[index].id) {
        const goalId = goals[index].id;
        
        const { error } = await supabase
          .from('weeklygoals')
          .delete()
          .eq('id', goalId);
          
        if (error) {
          if (error.code === '42P01') {
            // Table doesn't exist, delete from localStorage
            const updatedGoals = goals.filter((_, i) => i !== index);
            setGoals(updatedGoals);
            localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
          } else {
            console.error('Error deleting goal:', error);
            setMessage({
              type: 'error',
              text: 'Failed to delete goal.',
            });
            return;
          }
        } else {
          // Update state after successful deletion
          const updatedGoals = goals.filter((_, i) => i !== index);
          setGoals(updatedGoals);
        }
      } else {
        // No user or no goal ID, delete from localStorage
        const updatedGoals = goals.filter((_, i) => i !== index);
        setGoals(updatedGoals);
        localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
      }
    } catch (error) {
      console.error('Error in handleDeleteGoal:', error);
      // Fallback to localStorage
      const updatedGoals = goals.filter((_, i) => i !== index);
      setGoals(updatedGoals);
      localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
    }
  };

  const handleClose = () => setOpen(false);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  // Simplified Google Calendar integration using a popup approach
  const handleSaveToGoogleCalendar = () => {
    if (!selectedDate || currentGoalIndex === null) {
      setMessage({
        type: 'error',
        text: 'Please select a date first.',
      });
      return;
    }

    // First save the date to our website (Supabase or localStorage)
    const updatedGoals = [...goals];
    updatedGoals[currentGoalIndex].date = selectedDate;
    setGoals(updatedGoals);
    
    // Save to Supabase or localStorage
    try {
      const goalId = goals[currentGoalIndex].id;
      if (user && goalId) {
        // Save to Supabase
        supabase
          .from('weeklygoals')
          .update({ date: selectedDate.toISOString() })
          .eq('id', goalId)
          .then(({ error }) => {
            if (error && error.code !== '42P01') {
              console.error('Error updating date in Supabase:', error);
            }
          });
      } 
      
      // Always save to localStorage as a backup
      localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
      
    } catch (error) {
      console.error('Error saving date locally:', error);
      // Still save to localStorage as fallback
      localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
    }

    // Create a manual calendar URL
    const goal = goals[currentGoalIndex];
    const startTime = selectedDate.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
    const endTime = new Date(selectedDate.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d+/g, '');
    
    const text = encodeURIComponent(goal.category);
    const details = encodeURIComponent(goal.description);
    
    // Create Google Calendar event URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${startTime}/${endTime}`;
    
    // Open in a new window
    window.open(calendarUrl, '_blank');
    
    setMessage({
      type: 'success',
      text: 'Date saved and Google Calendar opened in a new tab!',
    });
    
    handleClose();
  };

  const handleOpenCalendar = (index: number) => {
    setCurrentGoalIndex(index);
    setOpen(true);
  };

  const handleSaveDate = () => {
    if (selectedDate && currentGoalIndex !== null) {
      const updatedGoals = [...goals];
      updatedGoals[currentGoalIndex].date = selectedDate;
      setGoals(updatedGoals);
      
      try {
        // Try to save to Supabase first
        const goalId = goals[currentGoalIndex].id;
        if (user && goalId) {
          supabase
            .from('weeklygoals')
            .update({ date: selectedDate.toISOString() })
            .eq('id', goalId)
            .then(({ error }) => {
              if (error) {
                if (error.code === '42P01') {
                  // Table doesn't exist, save to localStorage
                  localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
                  setMessage({
                    type: 'success',
                    text: 'Date saved locally!',
                  });
                } else {
                  console.error('Error updating date:', error);
                  setMessage({
                    type: 'error',
                    text: 'Failed to save date.',
                  });
                }
              } else {
                setMessage({
                  type: 'success',
                  text: 'Date saved!',
                });
              }
            });
        } else {
          // No user or no goal ID, save to localStorage
          localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
          setMessage({
            type: 'success',
            text: 'Date saved locally!',
          });
        }
      } catch (error) {
        console.error('Error saving date:', error);
        // Fallback to localStorage
        localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
        setMessage({
          type: 'success',
          text: 'Date saved locally!',
        });
      }
    }
    handleClose();
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Avatar
                  src={formData.avatarUrl}
                  alt={formData.fullName}
                  sx={{ width: 100, height: 100 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                  {t('profile.settings')}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.fullName')}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.avatarUrl')}
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  disabled={loading}
                  helperText={t('profile.avatarHelp')}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('profile.email')}: {user?.email}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Weekly Goals
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Category"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddGoal}
                >
                  Add Goal
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? t('profile.updating') : t('profile.updateProfile')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Goals
          </Typography>
          <List>
            {goals.map((goal, index) => (
              <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText
                  primary={goal.category}
                  secondary={`${goal.description} ${goal.date ? `- ${goal.date.toLocaleDateString()}` : ''}`}
                />
                <div>
                  <Button onClick={() => handleOpenCalendar(index)}>Select Days</Button>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteGoal(index)}
                    sx={{
                      color: 'darkred',
                      '&:hover': {
                        backgroundColor: 'rgba(139, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Select Days</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSaveDate}>Save Date</Button>
            <Button onClick={handleSaveToGoogleCalendar}>Save to Google Calendar</Button>
          </DialogActions>
        </Dialog>

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
