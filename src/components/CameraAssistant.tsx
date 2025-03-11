import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface CameraAssistantProps {
  currentStep?: {
    id: number;
    text: string;
    description?: string;
  };
  ingredients?: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
}

export default function CameraAssistant({ currentStep, ingredients }: CameraAssistantProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Setup camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error('Error accessing camera:', err));
    }
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    try {
      // Capture current frame
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      // Match canvas size to video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      
      // Draw the current video frame
      context.drawImage(videoRef.current, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95)
      );

      // Create a FileReader to convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Initialize Gemini Vision model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        // Create context-aware prompt
        const prompt = [
          "You are a professional cooking assistant. Analyze this cooking scene in the context of the current recipe step and ingredients.",
          currentStep ? `Current step: ${currentStep.text}` : "",
          currentStep?.description ? `Step description: ${currentStep.description}` : "",
          ingredients ? `Required ingredients: ${ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`).join(', ')}` : "",
          "",
          "Provide detailed feedback about:",
          "1. Progress on current step (if applicable)",
          "2. Ingredient preparation and measurements",
          "3. Cooking technique assessment",
          "4. Safety concerns",
          "5. Specific suggestions for improvement",
          "",
          "Focus on helping the cook complete the current step successfully. If you can't clearly see something important, say so.",
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64data.split(',')[1]
            }
          }
        ].filter(Boolean); // Remove empty strings

        // Analyze the image
        const result = await model.generateContent(prompt);
        const response = await result.response;
        setAnalysis(response.text());
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalysis('Error analyzing image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, position: 'relative' }}>
      <Typography variant="h6" gutterBottom>
        Smart Cooking Assistant
        {currentStep && (
          <Typography variant="subtitle2" color="text.secondary">
            Current Step: {currentStep.text}
          </Typography>
        )}
      </Typography>
      
      <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            display: 'none', // Hide canvas, we only use it for capturing
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button 
          variant="contained" 
          onClick={captureAndAnalyze}
          disabled={isAnalyzing}
          sx={{ position: 'relative' }}
        >
          {isAnalyzing ? (
            <>
              Analyzing...
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute',
                  right: 10
                }} 
              />
            </>
          ) : 'Analyze Current Step'}
        </Button>

        {analysis && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Analysis:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {analysis}
            </Typography>
          </Paper>
        )}
      </Box>
    </Paper>
  );
} 