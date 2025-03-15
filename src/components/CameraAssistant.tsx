import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Chip } from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PhotoCamera } from '@mui/icons-material';
import RecipeSuggestions from './RecipeSuggestions';

// Initialize Gemini outside component to avoid re-creation
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export default function CameraAssistant() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedIngredients, setScannedIngredients] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const analyzeImage = async (imageData: string) => {
    try {
      setIsAnalyzing(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const prompt = `You are a cooking assistant. Look at this image and:
      1. Identify all food ingredients visible in the image
      2. For each ingredient, determine its approximate quantity if visible
      3. Return a JSON array of objects with 'name' and 'quantity' properties
      
      Example response format:
      [
        {"name": "tomato", "quantity": "2 pieces"},
        {"name": "onion", "quantity": "1 medium"},
        {"name": "garlic", "quantity": "3 cloves"}
      ]
      
      Be specific with quantities when visible (e.g., '2 pieces', '500g', '3 tablespoons').
      If quantity is not clear, just include the name.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageData.split(',')[1]
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      try {
        const detectedIngredients = JSON.parse(text);
        if (Array.isArray(detectedIngredients)) {
          setScannedIngredients(prev => {
            // Add new ingredients while avoiding duplicates
            const newIngredients = detectedIngredients
              .map(item => typeof item === 'object' ? item.name : item)
              .filter(ingredient => 
                !prev.includes(ingredient.toLowerCase())
              );
            return [...prev, ...newIngredients];
          });
        }
      } catch (error) {
        console.error('Error parsing ingredients:', error);
      }

    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    
    // Analyze the captured image
    await analyzeImage(imageData);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            maxHeight: '400px',
            display: isCameraActive ? 'block' : 'none'
          }}
          autoPlay
          playsInline
        />

        {isCameraActive ? (
          <Button
            variant="contained"
            color="primary"
            onClick={captureImage}
            disabled={isAnalyzing}
            startIcon={<PhotoCamera />}
            sx={{ mt: 2 }}
          >
            {isAnalyzing ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Analyzing...
              </>
            ) : 'Capture Ingredient'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={setupCamera}
            startIcon={<PhotoCamera />}
          >
            Start Camera
          </Button>
        )}
      </Box>

      {scannedIngredients.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Scanned Ingredients
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
            {scannedIngredients.map((ingredient, index) => (
              <Chip
                key={index}
                label={ingredient}
                onDelete={() => {
                  setScannedIngredients(prev => prev.filter((_, i) => i !== index));
                }}
              />
            ))}
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mt: 2,
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle1" align="center" gutterBottom>
              Ready to discover recipes with your ingredients?
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setShowSuggestions(true)}
              disabled={scannedIngredients.length === 0}
              sx={{
                minWidth: 250,
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 500,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4
                }
              }}
            >
              Get Meal Suggestions
            </Button>
          </Box>

          {showSuggestions && (
            <Box mt={4}>
              <RecipeSuggestions ingredients={scannedIngredients} />
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
} 