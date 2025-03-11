'use client';

import { Box, Container, Typography, Button, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { 
  Search, 
  CameraAlt, 
  Kitchen, 
  ShoppingCart, 
  BookmarkBorder,
  Assistant,
  Restaurant
} from '@mui/icons-material';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      title: 'Smart Recipe Search',
      description: 'Find recipes that match your preferences, dietary restrictions, and available ingredients.',
      icon: <Search sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/recipes'),
      buttonText: 'Find Recipes'
    },
    {
      title: 'Ingredient Scanner',
      description: 'Use your camera to scan ingredients and get instant recipe suggestions.',
      icon: <CameraAlt sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/scan'),
      buttonText: 'Scan Now',
      requiresAuth: true
    },
    {
      title: 'Ingredient Management',
      description: 'Keep track of your pantry and get notified when items are running low.',
      icon: <Kitchen sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/ingredients'),
      buttonText: 'Manage Ingredients',
      requiresAuth: true
    },
    {
      title: 'Shopping List',
      description: 'Automatically generate shopping lists from recipes and manage your grocery needs.',
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/shopping-list'),
      buttonText: 'View List',
      requiresAuth: true
    },
    {
      title: 'Recipe Collection',
      description: 'Save your favorite recipes and organize them for quick access.',
      icon: <BookmarkBorder sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/saved-recipes'),
      buttonText: 'My Recipes',
      requiresAuth: true
    },
    {
      title: 'Cooking Assistant',
      description: 'Get step-by-step guidance and smart timers while cooking your meals.',
      icon: <Assistant sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/recipes'),
      buttonText: 'Start Cooking',
      requiresAuth: true
    }
  ];

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 8 }, mb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: { xs: 3, md: 4 },
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            mb: { xs: 1, md: 2 }
          }}>
            <Restaurant sx={{ fontSize: { xs: 40, md: 56 }, color: 'primary.main' }} />
            <Typography 
              variant={isMobile ? "h3" : "h2"} 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: '#2C3E50',
                letterSpacing: '-0.5px'
              }}
            >
              Smart Cook
            </Typography>
          </Box>

          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            color="text.secondary" 
            sx={{ 
              maxWidth: 800,
              mb: { xs: 2, md: 4 },
              px: 2
            }}
          >
            Your AI-powered cooking companion that helps you discover recipes, manage ingredients, and cook with confidence.
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3,
                      flexGrow: 1
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Button
                    variant={feature.requiresAuth && !user ? "outlined" : "contained"}
                    onClick={() => feature.requiresAuth && !user ? router.push('/auth/login') : feature.action()}
                    sx={{ 
                      width: '100%',
                      mt: 'auto'
                    }}
                  >
                    {feature.requiresAuth && !user ? 'Sign In to Access' : feature.buttonText}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
}
