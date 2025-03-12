'use client';

import { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoId: string;
  category: string;
  duration: string;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Basic Knife Skills',
    description: 'Learn essential knife skills and cutting techniques from Gordon Ramsay.',
    thumbnail: 'https://i.ytimg.com/vi/-av6cz9upO0/hqdefault.jpg',
    videoId: '-av6cz9upO0',
    category: 'Basic Skills',
    duration: '6:12'
  },
  {
    id: '2',
    title: 'Perfect Rice Cooking Guide',
    description: 'Learn how to cook fluffy rice perfectly every time.',
    thumbnail: 'https://i.ytimg.com/vi/Jf75I9LKhvg/hqdefault.jpg',
    videoId: 'Jf75I9LKhvg',
    category: 'Basic Skills',
    duration: '5:15'
  },
  {
    id: '3',
    title: 'Stock Making Basics',
    description: 'Learn how to make perfect chicken, beef, and vegetable stocks from America\'s Test Kitchen.',
    thumbnail: 'https://i.ytimg.com/vi/V23HlsUdbaM/hqdefault.jpg',
    videoId: 'V23HlsUdbaM',
    category: 'Advanced Techniques',
    duration: '8:47'
  },
  {
    id: '4',
    title: 'Bread Baking Basics',
    description: 'Simple no-knead bread recipe for beginners.',
    thumbnail: 'https://i.ytimg.com/vi/13Ah9ES2yTU/hqdefault.jpg',
    videoId: '13Ah9ES2yTU',
    category: 'Baking',
    duration: '8:16'
  },
  {
    id: '5',
    title: 'Vegetable Cutting Techniques',
    description: 'Master basic vegetable cuts used by professional chefs.',
    thumbnail: 'https://i.ytimg.com/vi/JMA2SqaDgG8/hqdefault.jpg',
    videoId: 'JMA2SqaDgG8',
    category: 'Basic Skills',
    duration: '9:27'
  }
];

export default function CookingTutorials() {
  const [selectedVideo, setSelectedVideo] = useState<Tutorial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleVideoClick = (tutorial: Tutorial) => {
    setSelectedVideo(tutorial);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const categories = Array.from(new Set(tutorials.map(tutorial => tutorial.category)));

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 5 }}>
        Video Tutorials
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* First render multi-video categories */}
        {categories
          .filter(category => tutorials.filter(t => t.category === category).length > 1)
          .map(category => {
            const categoryVideos = tutorials.filter(tutorial => tutorial.category === category);
            return (
              <Box key={category} sx={{ width: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  {category}
                </Typography>
                <Grid container spacing={3}>
                  {categoryVideos.map(tutorial => (
                    <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            transition: 'transform 0.2s ease-in-out'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="180"
                          image={tutorial.thumbnail}
                          alt={tutorial.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 188,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: 1,
                            fontSize: '0.875rem'
                          }}
                        >
                          {tutorial.duration}
                        </Box>
                        <CardContent sx={{ 
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          p: '12px',
                          '&:last-child': { p: '12px' }
                        }}>
                          <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '1.1rem' }}>
                            {tutorial.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
                            {tutorial.description}
                          </Typography>
                          <Box sx={{ mt: 'auto' }}>
                            <Button
                              variant="contained"
                              startIcon={<PlayArrow />}
                              onClick={() => handleVideoClick(tutorial)}
                              fullWidth
                              size="small"
                            >
                              Watch Tutorial
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}

        {/* Then render single-video categories in a single row */}
        <Box sx={{ width: '100%', mt: 2 }}>
          <Grid container spacing={3}>
            {categories
              .filter(category => tutorials.filter(t => t.category === category).length === 1)
              .map(category => {
                const tutorial = tutorials.find(t => t.category === category)!;
                return (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Typography variant="h6" gutterBottom>
                      {category}
                    </Typography>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          transition: 'transform 0.2s ease-in-out'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="180"
                        image={tutorial.thumbnail}
                        alt={tutorial.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 188,
                          right: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: 1,
                          fontSize: '0.875rem'
                        }}
                      >
                        {tutorial.duration}
                      </Box>
                      <CardContent sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: '12px',
                        '&:last-child': { p: '12px' }
                      }}>
                        <Typography variant="h6" component="div" sx={{ mb: 1, fontSize: '1.1rem' }}>
                          {tutorial.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
                          {tutorial.description}
                        </Typography>
                        <Box sx={{ mt: 'auto' }}>
                          <Button
                            variant="contained"
                            startIcon={<PlayArrow />}
                            onClick={() => handleVideoClick(tutorial)}
                            fullWidth
                            size="small"
                          >
                            Watch Tutorial
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
          </Grid>
        </Box>
      </Grid>

      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedVideo && (
          <>
            <DialogTitle>{selectedVideo.title}</DialogTitle>
            <DialogContent>
              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </Box>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedVideo.description}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
} 