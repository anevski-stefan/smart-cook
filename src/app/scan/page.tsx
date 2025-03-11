'use client';

import { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Webcam from 'react-webcam';
import { Container, Typography, Button, Box, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { RootState } from '@/store/store';
import { addScannedIngredient, clearScannedIngredients, setLoading, setError } from '@/store/slices/ingredientSlice';
import Navbar from '@/components/Navbar';

interface ScannedIngredient {
  id: string;
  name: string;
  image: string;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ScanPage() {
  const dispatch = useDispatch();
  const { scannedIngredients, loading, error } = useSelector((state: RootState) => state.ingredients as {
    scannedIngredients: ScannedIngredient[];
    loading: boolean;
    error: string | null;
  });
  const [useNativeCamera, setUseNativeCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if we should use native camera (Safari or iOS)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isSafari || isIOS) {
      setUseNativeCamera(true);
      dispatch(setError(''));
    }
  }, [dispatch]);

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.src = e.target?.result as string;
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          // Create canvas and resize image if needed
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > 800 || height > 800) {
            if (width > height) {
              height = Math.round((height * 800) / width);
              width = 800;
            } else {
              width = Math.round((width * 800) / height);
              height = 800;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Get compressed image data
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedImage);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      dispatch(setError('Image size is too large. Please use an image under 5MB.'));
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(''));
    
    try {
      // Process and compress the image
      const processedImage = await processImage(file);
      
      const response = await fetch('/api/scan-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: processedImage }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const data = await response.json();
      if (data.ingredients && data.ingredients.length > 0) {
        data.ingredients.forEach((ingredient: string) => {
          dispatch(addScannedIngredient({
            id: Date.now().toString() + Math.random(),
            name: ingredient,
            image: processedImage,
          }));
        });
      } else {
        throw new Error('No ingredients detected');
      }
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Failed to process image'));
      console.error('Error processing image:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleWebcamRef = useCallback((node: Webcam | null) => {
    if (node !== null) {
      setIsCameraReady(true);
    }
  }, []);

  const handleCameraError = useCallback(() => {
    setUseNativeCamera(true);
    setIsCameraReady(false);
  }, []);

  const captureImage = useCallback(async () => {
    if (useNativeCamera) {
      fileInputRef.current?.click();
      return;
    }

    if (webcamRef.current) {
      dispatch(setLoading(true));
      dispatch(setError(''));
      
      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) throw new Error('Failed to capture image');

        const response = await fetch('/api/scan-ingredient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageSrc }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData);
        }

        const data = await response.json();
        if (data.ingredients && data.ingredients.length > 0) {
          data.ingredients.forEach((ingredient: string) => {
            dispatch(addScannedIngredient({
              id: Date.now().toString() + Math.random(),
              name: ingredient,
              image: imageSrc,
            }));
          });
        } else {
          throw new Error('No ingredients detected');
        }
      } catch (error) {
        dispatch(setError('Failed to scan ingredient'));
        console.error('Error scanning ingredient:', error);
      } finally {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, useNativeCamera]);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Scan Ingredients
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
              {!useNativeCamera ? (
                <Webcam
                  ref={handleWebcamRef}
                  screenshotFormat="image/jpeg"
                  style={{ width: '100%', borderRadius: 4 }}
                  videoConstraints={{ facingMode: 'environment' }}
                  onUserMediaError={handleCameraError}
                />
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    bgcolor: '#f5f5f5'
                  }}
                >
                  <Typography color="textSecondary">
                    Click below to take a photo
                  </Typography>
                </Box>
              )}
            </Paper>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<PhotoCamera />}
              onClick={captureImage}
              disabled={!useNativeCamera && (!isCameraReady || loading)}
            >
              {loading ? 'Processing...' : 'Take Photo'}
            </Button>
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Scanned Ingredients</Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => dispatch(clearScannedIngredients())}
                  disabled={scannedIngredients.length === 0}
                >
                  Clear All
                </Button>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              )}

              {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {error}
                </Typography>
              )}

              <List>
                {scannedIngredients.map((ingredient: ScannedIngredient) => (
                  <ListItem key={ingredient.id}>
                    <ListItemText primary={ingredient.name} />
                  </ListItem>
                ))}
                {scannedIngredients.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No ingredients scanned"
                      secondary="Use the camera to scan ingredients"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>
        </Box>
      </Container>
    </>
  );
} 