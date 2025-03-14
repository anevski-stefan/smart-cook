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
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';


export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  const features = [
    {
      title: t('home.features.search.title'),
      description: t('home.features.search.description'),
      icon: <Search sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/recipes'),
      buttonText: t('home.features.search.button'),
    },
    {
      title: t('home.features.scanner.title'),
      description: t('home.features.scanner.description'),
      icon: <CameraAlt sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/scan'),
      buttonText: t('home.features.scanner.button'),
      requiresAuth: true
    },
    {
      title: t('home.features.management.title'),
      description: t('home.features.management.description'),
      icon: <Kitchen sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/ingredients'),
      buttonText: t('home.features.management.button'),
      requiresAuth: true
    },
    {
      title: t('home.features.shopping.title'),
      description: t('home.features.shopping.description'),
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/shopping-list'),
      buttonText: t('home.features.shopping.button'),
      requiresAuth: true
    },
    {
      title: t('home.features.collection.title'),
      description: t('home.features.collection.description'),
      icon: <BookmarkBorder sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/saved-recipes'),
      buttonText: t('home.features.collection.button'),
      requiresAuth: true
    },
    {
      title: t('home.features.assistant.title'),
      description: t('home.features.assistant.description'),
      icon: <Assistant sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/recipes'),
      buttonText: t('home.features.assistant.button'),
      requiresAuth: true
    }
  ];

  return (
    <>
      <Navbar />
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 4, md: 8 }, 
          mb: 8,
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 2,
          boxShadow: 3,
          p: { xs: 2, md: 4 },
          color: 'white',
        }}
      >
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
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 2,
            mb: { xs: 1, md: 2 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2 
            }}>
              <Restaurant sx={{ fontSize: { xs: 40, md: 56 }, color: 'primary.main' }} />
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  color: 'white',
                  letterSpacing: '-0.5px',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {t('common.welcome')}
              </Typography>
            </Box>
            {/* <LanguageSelector /> */}
          </Box>

          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            sx={{ 
              maxWidth: 800,
              mb: { xs: 2, md: 4 },
              px: 2,
              fontStyle: 'italic',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            {t('home.subtitle')}
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
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
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
                      mt: 'auto',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    }}
                  >
                    {feature.requiresAuth && !user ? t('auth.signInButton') : feature.buttonText}
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
