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
  Chip,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// Import the shared Supabase client
import { supabase } from '@/utils/supabase-client';

const categories = [
  'Weekly Calories',
  'Number of Meals',
  'Try New Recipes',
  'Cook a Balanced Meal',
  'Try an International Dish',
  'Reduce Food Waste',
];

// Helper function for JSON serialization of dates
const serializeForStorage = (data: unknown) => {
  return JSON.stringify(data, (key, value) => {
    // Convert Date objects to ISO strings for JSON serialization
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
  });
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState<{ 
    id?: number; 
    category: string; 
    description: string; 
    dates?: Date[];
    achieved?: boolean;
  }[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number | null>(null);
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState<{
    category: string;
    description: string;
  }>({ category: '', description: '' });

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
              try {
                const parsedGoals = JSON.parse(savedGoals);
                // Convert date strings back to Date objects
                const formattedGoals = parsedGoals.map((goal: { 
                  category: string; 
                  description: string; 
                  dates?: string[];
                  achieved?: boolean;
                }) => ({
                  category: goal.category,
                  description: goal.description,
                  dates: goal.dates ? goal.dates.map((date: string) => {
                    // Ensure date strings are properly parsed to Date objects
                    const parsedDate = new Date(date);
                    // Check if the date is valid
                    return isNaN(parsedDate.getTime()) ? null : parsedDate;
                  }).filter(Boolean) : undefined, // Filter out any invalid dates
                  achieved: goal.achieved || false,
                }));
                setGoals(formattedGoals);
              } catch (parseError) {
                console.error('Error parsing saved goals:', parseError);
              }
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
            dates: goal.dates ? goal.dates.map((date: string) => {
              // Ensure date strings are properly parsed to Date objects
              const parsedDate = new Date(date);
              // Check if the date is valid
              return isNaN(parsedDate.getTime()) ? null : parsedDate;
            }).filter(Boolean) : undefined, // Filter out any invalid dates
            achieved: goal.achieved || false,
          }));
          setGoals(formattedGoals);
        }
      } catch (error) {
        console.error('Error in fetchGoals:', error);
        // Fallback to localStorage
        const savedGoals = localStorage.getItem('weeklyGoals');
        if (savedGoals) {
          try {
            const parsedGoals = JSON.parse(savedGoals);
            // Convert date strings back to Date objects
            const formattedGoals = parsedGoals.map((goal: { 
              category: string; 
              description: string; 
              dates?: string[];
              achieved?: boolean;
            }) => ({
              category: goal.category,
              description: goal.description,
              dates: goal.dates ? goal.dates.map((date: string) => {
                // Ensure date strings are properly parsed to Date objects
                const parsedDate = new Date(date);
                // Check if the date is valid
                return isNaN(parsedDate.getTime()) ? null : parsedDate;
              }).filter(Boolean) : undefined, // Filter out any invalid dates
              achieved: goal.achieved || false,
            }));
            setGoals(formattedGoals);
          } catch (parseError) {
            console.error('Error parsing saved goals:', parseError);
          }
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
    
    // Create the new goal object
    const newGoal = { 
      category: goal, 
      description,
      dates: undefined,
      achieved: false
    };
    
    try {
      // Try to save to Supabase first
      if (user) {
        // Prepare the data for Supabase
        const goalData = {
          category: goal,
          description,
          user_id: user.id,
          week_start_date: new Date(),
          achieved: false
        };
        
        // Try to insert the goal
        const { data, error } = await supabase
          .from('weeklygoals')
          .insert([goalData])
          .select();
          
        if (error) {
          console.error('Error saving goal:', error);
          
          // Fallback to localStorage for any database error
          const updatedGoals = [...goals, newGoal];
          setGoals(updatedGoals);
          localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
          
          setMessage({
            type: 'info',
            text: 'Goal saved locally! (Database error: ' + error.message + ')',
          });
        } else {
          // Use the returned data instead of fetching again
          if (data && data.length > 0) {
            const newGoalWithId = {
              id: data[0].id,
              category: data[0].category,
              description: data[0].description,
              dates: data[0].dates ? data[0].dates.map((date: string) => new Date(date)) : undefined,
              achieved: data[0].achieved || false,
            };
            
            setGoals(prevGoals => [...prevGoals, newGoalWithId]);
            
            setMessage({
              type: 'success',
              text: 'Goal saved to database!',
            });
          } else {
            // No data returned but no error either
            const updatedGoals = [...goals, newGoal];
            setGoals(updatedGoals);
            localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
            
            setMessage({
              type: 'success',
              text: 'Goal saved!',
            });
          }
        }
      } else {
        // No user, save to localStorage
        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
        
        setMessage({
          type: 'success',
          text: 'Goal saved locally!',
        });
      }
    } catch (error: unknown) {
      console.error('Error in handleAddGoal:', error);
      // Fallback to localStorage
      const updatedGoals = [...goals, newGoal];
      setGoals(updatedGoals);
      localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
      
      setMessage({
        type: 'info',
        text: 'Goal saved locally! (Error: ' + (error instanceof Error ? error.message : 'Unknown error') + ')',
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
          console.error('Error deleting goal:', error);
          setMessage({
            type: 'error',
            text: 'Failed to delete goal from database: ' + error.message,
          });
          
          // Still delete from local state to maintain UI consistency
          const updatedGoals = goals.filter((_, i) => i !== index);
          setGoals(updatedGoals);
          localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
          
          return;
        } else {
          // Update state after successful deletion
          const updatedGoals = goals.filter((_, i) => i !== index);
          setGoals(updatedGoals);
          localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
          
          setMessage({
            type: 'success',
            text: 'Goal deleted successfully!',
          });
        }
      } else {
        // No user or no goal ID, delete from localStorage
        const updatedGoals = goals.filter((_, i) => i !== index);
        setGoals(updatedGoals);
        localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
        
        setMessage({
          type: 'success',
          text: 'Goal deleted from local storage!',
        });
      }
    } catch (error: unknown) {
      console.error('Error in handleDeleteGoal:', error);
      // Fallback to localStorage
      const updatedGoals = goals.filter((_, i) => i !== index);
      setGoals(updatedGoals);
      localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
      
      setMessage({
        type: 'info',
        text: 'Goal deleted locally! (Error: ' + (error instanceof Error ? error.message : 'Unknown error') + ')',
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (editingGoalIndex !== null) {
      setEditingGoalIndex(null);
      setEditingGoal({ category: '', description: '' });
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    
    // Check if date already exists in the array
    const dateExists = selectedDates.some(
      selectedDate => selectedDate.toDateString() === date.toDateString()
    );
    
    if (dateExists) {
      // Remove the date if it already exists
      setSelectedDates(selectedDates.filter(
        selectedDate => selectedDate.toDateString() !== date.toDateString()
      ));
    } else {
      // Add the date if it doesn't exist
      setSelectedDates([...selectedDates, date]);
    }
  };

  // Simplified Google Calendar integration using a popup approach
  const handleSaveToGoogleCalendar = () => {
    if (selectedDates.length === 0 || currentGoalIndex === null) {
      setMessage({
        type: 'error',
        text: 'Please select at least one date first.',
      });
      return;
    }

    // Filter out any invalid dates
    const validDates = selectedDates.filter(date => date instanceof Date && !isNaN(date.getTime()));
    
    if (validDates.length === 0) {
      setMessage({
        type: 'error',
        text: 'No valid dates selected.',
      });
      return;
    }

    // First save the dates to our website (Supabase or localStorage)
    const updatedGoals = [...goals];
    updatedGoals[currentGoalIndex].dates = validDates;
    setGoals(updatedGoals);
    
    // Save to Supabase or localStorage
    try {
      const goalId = goals[currentGoalIndex].id;
      if (user && goalId) {
        // Save to Supabase
        (async () => {
          try {
            // Convert dates to ISO strings for Supabase
            const dateStrings = validDates.map(date => date.toISOString());
            
            const { error } = await supabase
              .from('weeklygoals')
              .update({ dates: dateStrings })
              .eq('id', goalId);
              
            if (error) {
              console.error('Error updating dates in Supabase:', error);
              // Continue with Google Calendar even if Supabase fails
            }
          } catch (updateError: unknown) {
            console.error('Error in Supabase update:', updateError);
            // Continue with Google Calendar even if Supabase fails
          }
        })();
      } 
      
      // Always save to localStorage as a backup
      localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
      
    } catch (error: unknown) {
      console.error('Error saving dates locally:', error);
      // Still save to localStorage as fallback
      localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
    }

    // Create Google Calendar events for each selected date
    const goal = goals[currentGoalIndex];
    
    // Open only the first date in Google Calendar (user can add more manually)
    if (validDates.length > 0) {
      try {
        const firstDate = validDates[0];
        const startTime = firstDate.toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, '');
        const endTime = new Date(firstDate.getTime() + 60 * 60 * 1000)
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
          text: `${validDates.length} date(s) saved and Google Calendar opened in a new tab!`,
        });
      } catch (calendarError: unknown) {
        console.error('Error opening Google Calendar:', calendarError);
        setMessage({
          type: 'warning',
          text: `Dates saved, but there was an error opening Google Calendar: ${calendarError instanceof Error ? calendarError.message : 'Unknown error'}`,
        });
      }
    }
    
    handleClose();
  };

  const handleOpenCalendar = (index: number) => {
    setCurrentGoalIndex(index);
    setEditingGoalIndex(null);
    setSelectedDates(goals[index].dates || []);
    setOpen(true);
  };

  const handleSaveDate = () => {
    if (selectedDates.length > 0 && currentGoalIndex !== null) {
      // Filter out any invalid dates
      const validDates = selectedDates.filter(date => date instanceof Date && !isNaN(date.getTime()));
      
      if (validDates.length === 0) {
        setMessage({
          type: 'error',
          text: 'No valid dates selected.',
        });
        return;
      }
      
      const updatedGoals = [...goals];
      updatedGoals[currentGoalIndex].dates = validDates;
      setGoals(updatedGoals);
      
      try {
        // Try to save to Supabase first
        const goalId = goals[currentGoalIndex].id;
        if (user && goalId) {
          // Use async/await with try/catch for better error handling
          (async () => {
            try {
              // Convert dates to ISO strings for Supabase
              const dateStrings = validDates.map(date => date.toISOString());
              
              const { error } = await supabase
                .from('weeklygoals')
                .update({ dates: dateStrings })
                .eq('id', goalId);
                
              if (error) {
                console.error('Error updating dates in Supabase:', error);
                setMessage({
                  type: 'info',
                  text: `${validDates.length} date(s) saved locally! (Database error: ${error.message})`,
                });
              } else {
                setMessage({
                  type: 'success',
                  text: `${validDates.length} date(s) saved successfully!`,
                });
              }
            } catch (updateError: unknown) {
              console.error('Error in Supabase update:', updateError);
              setMessage({
                type: 'info',
                text: `${validDates.length} date(s) saved locally! (Error: ${updateError instanceof Error ? updateError.message : 'Unknown error'})`,
              });
            }
          })();
        } else {
          // No user or goal ID, just save locally
          setMessage({
            type: 'success',
            text: `${validDates.length} date(s) saved locally!`,
          });
        }
        
        // Always save to localStorage as a backup
        localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
        
      } catch (error: unknown) {
        console.error('Error saving dates:', error);
        // Still save to localStorage as fallback
        localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
        
        setMessage({
          type: 'info',
          text: `${validDates.length} date(s) saved locally! (Error: ${error instanceof Error ? error.message : 'Unknown error'})`,
        });
      }
      
      handleClose();
    } else if (selectedDates.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please select at least one date.',
      });
    }
  };

  const handleMarkAchieved = (index: number) => {
    // Check if the goal has future dates
    const goal = goals[index];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
    
    // If the goal has dates, check if any are in the future
    if (goal.dates && goal.dates.length > 0) {
      const hasFutureDates = goal.dates.some(date => {
        const goalDate = new Date(date);
        goalDate.setHours(0, 0, 0, 0); // Reset time to start of day
        return goalDate > today;
      });
      
      if (hasFutureDates) {
        setMessage({
          type: 'warning',
          text: 'This goal cannot be marked as achieved because it contains future dates.',
        });
        return;
      }
    }
    
    // Mark the goal as achieved
    const updatedGoals = [...goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      achieved: !updatedGoals[index].achieved // Toggle the achieved status
    };
    setGoals(updatedGoals);
    
    // Save to Supabase if available
    if (user && goal.id) {
      (async () => {
        try {
          const { error } = await supabase
            .from('weeklygoals')
            .update({ achieved: !goal.achieved })
            .eq('id', goal.id);
            
          if (error) {
            console.error('Error updating goal achievement status:', error);
          }
        } catch (updateError: unknown) {
          console.error('Error in updating achievement status:', updateError);
        }
      })();
    }
    
    // Always save to localStorage as a backup
    localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
    
    setMessage({
      type: 'success',
      text: updatedGoals[index].achieved 
        ? 'Goal marked as achieved! Congratulations!' 
        : 'Goal marked as not achieved.',
    });
  };

  const handleEditGoal = (index: number) => {
    setEditingGoalIndex(index);
    setEditingGoal({
      category: goals[index].category,
      description: goals[index].description,
    });
    setOpen(true);
  };

  const handleSaveEditedGoal = async () => {
    if (editingGoalIndex === null) return;
    
    if (!editingGoal.category || !editingGoal.description) {
      setMessage({
        type: 'error',
        text: 'Please fill in all fields before saving the goal.',
      });
      return;
    }
    
    const updatedGoals = [...goals];
    updatedGoals[editingGoalIndex] = {
      ...updatedGoals[editingGoalIndex],
      category: editingGoal.category,
      description: editingGoal.description,
    };
    
    setGoals(updatedGoals);
    
    // Save to Supabase if available
    if (user && updatedGoals[editingGoalIndex].id) {
      const goalId = updatedGoals[editingGoalIndex].id;
      
      (async () => {
        try {
          const { error } = await supabase
            .from('weeklygoals')
            .update({
              category: editingGoal.category,
              description: editingGoal.description,
            })
            .eq('id', goalId);
            
          if (error) {
            console.error('Error updating goal:', error);
            setMessage({
              type: 'info',
              text: 'Goal updated locally! (Database error: ' + error.message + ')',
            });
          } else {
            setMessage({
              type: 'success',
              text: 'Goal updated successfully!',
            });
          }
        } catch (updateError: unknown) {
          console.error('Error in updating goal:', updateError);
          setMessage({
            type: 'info',
            text: 'Goal updated locally! (Error: ' + (updateError instanceof Error ? updateError.message : 'Unknown error') + ')',
          });
        }
      })();
    } else {
      setMessage({
        type: 'success',
        text: 'Goal updated locally!',
      });
    }
    
    // Always save to localStorage as a backup
    localStorage.setItem('weeklyGoals', serializeForStorage(updatedGoals));
    
    // Reset editing state
    setEditingGoalIndex(null);
    setEditingGoal({ category: '', description: '' });
    setOpen(false);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
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
                  id="fullName"
                  label={t('profile.fullName')}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  InputLabelProps={{
                    htmlFor: "fullName"
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="avatarUrl"
                  label={t('profile.avatarUrl')}
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  disabled={loading}
                  helperText={t('profile.avatarHelp')}
                  InputLabelProps={{
                    htmlFor: "avatarUrl"
                  }}
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
                  id="goalCategory"
                  label="Category"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    htmlFor: "goalCategory"
                  }}
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
                  id="goalDescription"
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    htmlFor: "goalDescription"
                  }}
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

        <Paper elevation={3} sx={{ p: 2, mt: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Goals
          </Typography>
          <List>
            {goals.map((goal, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  backgroundColor: goal.achieved ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                  borderLeft: goal.achieved ? '4px solid #4caf50' : 'none',
                }}
              >
                <ListItemText
                  primary={
                    <Typography 
                      component="div" 
                      variant="subtitle1"
                      sx={{
                        textDecoration: goal.achieved ? 'line-through' : 'none',
                        color: goal.achieved ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {goal.category}
                    </Typography>
                  }
                  secondary={
                    <Typography component="div" variant="body2" color="text.secondary">
                      {goal.description}
                      {goal.dates && goal.dates.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {goal.dates.map((date, i) => (
                            <Chip 
                              key={i} 
                              label={date.toLocaleDateString()} 
                              size="small" 
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5,
                                backgroundColor: new Date(date) < new Date() ? 'rgba(76, 175, 80, 0.1)' : 'inherit',
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Typography>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button 
                    onClick={() => handleMarkAchieved(index)}
                    color={goal.achieved ? "success" : "primary"}
                    variant={goal.achieved ? "contained" : "outlined"}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    {goal.achieved ? "Achieved" : "Mark Achieved"}
                  </Button>
                  <Button 
                    onClick={() => handleEditGoal(index)}
                    color="info"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleOpenCalendar(index)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Select Days
                  </Button>
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
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{editingGoalIndex !== null ? "Edit Goal" : "Select Multiple Days"}</DialogTitle>
          <DialogContent>
            {editingGoalIndex !== null ? (
              <Box sx={{ pt: 1 }}>
                <TextField
                  select
                  id="editGoalCategory"
                  label="Category"
                  value={editingGoal.category}
                  onChange={(e) => setEditingGoal({...editingGoal, category: e.target.value})}
                  fullWidth
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    htmlFor: "editGoalCategory"
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  id="editGoalDescription"
                  label="Description"
                  value={editingGoal.description}
                  onChange={(e) => setEditingGoal({...editingGoal, description: e.target.value})}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  InputLabelProps={{
                    htmlFor: "editGoalDescription"
                  }}
                />
              </Box>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click on multiple dates to select them. Click again to deselect.
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Select Dates"
                    value={null}
                    onChange={handleDateChange}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        id: "datePicker",
                        InputLabelProps: {
                          htmlFor: "datePicker"
                        }
                      } 
                    }}
                  />
                </LocalizationProvider>
                
                {selectedDates.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Selected Dates:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {selectedDates.map((date, index) => (
                        <Chip 
                          key={index} 
                          label={date.toLocaleDateString()} 
                          onDelete={() => {
                            setSelectedDates(selectedDates.filter((_, i) => i !== index));
                          }}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            {editingGoalIndex !== null ? (
              <Button onClick={handleSaveEditedGoal} color="primary" variant="contained">
                Save Changes
              </Button>
            ) : (
              <>
                <Button onClick={handleSaveDate}>Save Dates</Button>
                <Button onClick={handleSaveToGoogleCalendar}>Save to Google Calendar</Button>
              </>
            )}
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
