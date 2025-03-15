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
import { supabase } from '@/utils/supabase-client';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { gapi } from 'gapi-script';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
  });
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState<{ category: string; description: string; date?: Date }[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentGoalIndex, setCurrentGoalIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedGoals = localStorage.getItem('weeklyGoals');
    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: { category: string; description: string; date?: string }) => ({
        ...goal,
        date: goal.date ? new Date(goal.date) : undefined,
      }));
      setGoals(parsedGoals);
    }
  }, []);

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

  const handleAddGoal = () => {
    if (!goal || !description) {
      setMessage({
        type: 'error',
        text: 'Please fill in all fields before adding a goal.',
      });
      return;
    }
    const newGoals = [...goals, { category: goal, description }];
    setGoals(newGoals);
    localStorage.setItem('weeklyGoals', JSON.stringify(newGoals));
    setGoal('');
    setDescription('');
    setCurrentGoalIndex(newGoals.length - 1);
    setOpen(true);
  };

  const handleDeleteGoal = (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
  };

  const handleClose = () => setOpen(false);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleSaveToGoogleCalendar = () => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: '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',
        clientId: 'client id 494079691849-1njeki9km8niqsfjrit55valechdlhga.apps.googleusercontent.com',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events',
      }).then(() => {
        gapi.auth2.getAuthInstance().signIn().then(() => {
          const calendar = gapi.client.calendar;
          if (selectedDate && goals[currentGoalIndex as number]) {
            calendar.events.insert({
              calendarId: 'primary',
              resource: {
                summary: goals[currentGoalIndex as number].category,
                description: goals[currentGoalIndex as number].description,
                start: {
                  dateTime: selectedDate.toISOString(),
                  timeZone: 'Europe/Skopje',
                },
                end: {
                  dateTime: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(),
                  timeZone: 'Europe/Skopje',
                },
              },
            }).then(() => {
              console.log('Event created');
              setMessage({
                type: 'success',
                text: 'Event saved to Google Calendar!',
              });
            }).catch((error: unknown) => {
              console.error('Error creating event:', error);
              setMessage({
                type: 'error',
                text: 'Failed to save event to Google Calendar.',
              });
            });
          }
        });
      });
    });
    handleClose();
  };

  const handleOpenCalendar = (index: number) => {
    setCurrentGoalIndex(index);
    setOpen(true);
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
            <Button onClick={() => {
              if (selectedDate && currentGoalIndex !== null) {
                const updatedGoals = [...goals];
                updatedGoals[currentGoalIndex].date = selectedDate;
                setGoals(updatedGoals);
                localStorage.setItem('weeklyGoals', JSON.stringify(updatedGoals));
                setMessage({
                  type: 'success',
                  text: 'Date saved locally!',
                });
              }
              handleClose();
            }}>Save Locally</Button>
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
