'use client';

import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 4,
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Smart Cook
          </Typography>

          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Your AI-powered cooking assistant that helps you discover recipes, manage ingredients, and cook with confidence.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/recipes')}
            >
              Explore Recipes
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/scan')}
            >
              Scan Ingredients
            </Button>
          </Box>

          <Box sx={{ mt: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                flex: 1,
                minWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recipe Discovery
              </Typography>
              <Typography color="text.secondary">
                Browse through thousands of recipes, filter by cuisine or dietary preferences, and find your next favorite meal.
              </Typography>
            </Paper>

            <Paper
              elevation={2}
              sx={{
                p: 3,
                flex: 1,
                minWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Ingredient Scanner
              </Typography>
              <Typography color="text.secondary">
                Use your camera to scan ingredients and get recipe suggestions based on what you have.
              </Typography>
            </Paper>

            <Paper
              elevation={2}
              sx={{
                p: 3,
                flex: 1,
                minWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Shopping List
              </Typography>
              <Typography color="text.secondary">
                Keep track of ingredients you need and manage your shopping list with ease.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
}
