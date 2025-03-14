'use client';

import { Box, Container, Typography, Button, Paper } from '@mui/material';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { Search, CameraAlt } from '@mui/icons-material';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          mt: 8,
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '4rem',
          borderRadius: '8px',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '2rem',
            borderRadius: '8px',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', fontSize: '3rem' }}>
            Welcome to Smart Cook
          </Typography>

          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontSize: '1.25rem', color: '#fff' }}>
            Your AI-powered cooking assistant that helps you discover recipes, manage ingredients, and cook with confidence.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/recipes')}
              startIcon={<Search />}
              sx={{
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                background: 'linear-gradient(45deg, #66bb6a, #43a047)',
                color: '#fff',
                boxShadow: '0 3px 5px 2px rgba(105, 135, 255, .3)',
              }}
            >
              Explore Recipes
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/scan')}
              startIcon={<CameraAlt />}
              sx={{
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                borderColor: '#43a047',
                color: '#43a047',
                boxShadow: '0 3px 5px 2px rgba(105, 135, 255, .3)',
              }}
            >
              Scan Ingredients
            </Button>
          </Box>

          <Box sx={{ mt: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { title: 'Recipe Discovery', description: 'Browse through thousands of recipes, filter by cuisine or dietary preferences, and find your next favorite meal.' },
              { title: 'Ingredient Scanner', description: 'Use your camera to scan ingredients and get recipe suggestions based on what you have.' },
              { title: 'Shopping List', description: 'Keep track of ingredients you need and manage your shopping list with ease.' },
            ].map((item, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  p: 3,
                  flex: 1,
                  minWidth: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  },
                  '&:hover .hover-image': {
                    opacity: 1,
                    transform: 'scale(1.1)',
                  },
                }}
              >
               
                <Box
                className="hover-image"
                sx={{
                  position: 'absolute',
                  top: '5px', 
          
                  right: '2px',
                  width: '50px', 
                  height: '60px',
                  backgroundImage: 'url(/image.jpg)', 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '40%', 
                  border: '3px solid white',
                  opacity: 0,
                  transform: 'scale(0.8)',
                  transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                  zIndex: 2,
                }}
              />

                {/* Content */}
                <Typography variant="h6" gutterBottom sx={{ position: 'relative', zIndex: 2 }}>
                  {item.title}
                </Typography>
                <Typography color="text.secondary" sx={{ position: 'relative', zIndex: 2 }}>
                  {item.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    </>
  );
}
