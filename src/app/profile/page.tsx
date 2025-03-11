'use client';

import { useState } from 'react';
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
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/utils/supabase-client';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    avatarUrl: user?.user_metadata?.avatar_url || '',
  });

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
                />
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