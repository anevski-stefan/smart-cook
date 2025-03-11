import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  Mic,
  MicOff,
  Timer,
  TipsAndUpdates,
  DeviceThermostat,
  Edit,
} from '@mui/icons-material';
import type { Instruction } from '@/types/ingredient';
import type { SpeechRecognition, SpeechRecognitionEvent } from '@/types/speech';

interface CookingAssistantProps {
  instructions: Instruction[];
  ingredients: Array<{ id: string; name: string; amount: number; unit: string }>;
  onComplete?: () => void;
}

interface StepNote {
  stepIndex: number;
  note: string;
}

export default function CookingAssistant({ instructions, ingredients, onComplete }: CookingAssistantProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [showTempDialog, setShowTempDialog] = useState(false);
  const [stepNotes, setStepNotes] = useState<StepNote[]>([]);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number>(0);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total time and progress
  useEffect(() => {
    const total = instructions.reduce((acc, instruction) => {
      return acc + (instruction.duration || 0);
    }, 0);
    setTotalTimeRemaining(total);
  }, [instructions]);

  const speakCurrentStep = useCallback(() => {
    if (!synthesisRef.current) return;

    const utterance = new SpeechSynthesisUtterance(instructions[currentStep].text);
    synthesisRef.current.speak(utterance);
  }, [instructions, currentStep]);

  const checkIngredients = useCallback((stepIndex: number) => {
    const stepText = instructions[stepIndex].text.toLowerCase();
    const requiredIngredients = ingredients.filter(ing => 
      stepText.includes(ing.name.toLowerCase())
    );

    if (requiredIngredients.length > 0) {
      setNotification(`For this step, you'll need: ${requiredIngredients.map(ing => 
        `${ing.amount} ${ing.unit} ${ing.name}`
      ).join(', ')}`);
    }
  }, [instructions, ingredients, setNotification]);

  const handleNextStep = useCallback(() => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
      speakCurrentStep();
      checkIngredients(currentStep + 1);
    } else {
      onComplete?.();
    }
  }, [currentStep, instructions.length, speakCurrentStep, checkIngredients, onComplete]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      speakCurrentStep();
      checkIngredients(currentStep - 1);
    }
  }, [currentStep, speakCurrentStep, checkIngredients]);

  const handleVoiceCommand = useCallback((command: string) => {
    if (command.includes('next') || command.includes('next step')) {
      handleNextStep();
    } else if (command.includes('previous') || command.includes('back')) {
      handlePreviousStep();
    } else if (command.includes('start timer') || command.includes('set timer')) {
      setShowTimerDialog(true);
    } else if (command.includes('pause') || command.includes('stop')) {
      setIsPlaying(false);
    } else if (command.includes('resume') || command.includes('continue')) {
      setIsPlaying(true);
    } else if (command.includes('repeat') || command.includes('what')) {
      speakCurrentStep();
    } else if (command.includes('convert temperature')) {
      setShowTempDialog(true);
    } else if (command.includes('add note')) {
      setShowNoteDialog(true);
    }
  }, [handleNextStep, handlePreviousStep, speakCurrentStep, setIsPlaying, setShowTimerDialog, setShowTempDialog, setShowNoteDialog]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
          handleVoiceCommand(command);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }

      // Initialize speech synthesis
      if (window.speechSynthesis) {
        synthesisRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [handleVoiceCommand]);

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setNotification('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const startTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTimeRemaining(seconds);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setNotification('Timer completed! Time to move to the next step.');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const convertTemperature = (value: number, fromUnit: 'F' | 'C'): number => {
    if (fromUnit === 'F') {
      return Math.round((value - 32) * 5 / 9);
    } else {
      return Math.round((value * 9 / 5) + 32);
    }
  };

  const addStepNote = (note: string) => {
    setStepNotes([...stepNotes, { stepIndex: currentStep, note }]);
    setCurrentNote('');
    setShowNoteDialog(false);
    setNotification('Note added successfully');
  };

  const calculateProgress = (): number => {
    if (totalTimeRemaining === 0) return 0;
    
    const completedTime = instructions
      .slice(0, currentStep)
      .reduce((acc, instruction) => acc + (instruction.duration || 0), 0);
    return Math.min((completedTime / totalTimeRemaining) * 100, 100);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Cooking Assistant
      </Typography>

      <Box sx={{ mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={calculateProgress()} 
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
          Progress: {Math.round(calculateProgress())}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <IconButton
          onClick={() => setIsPlaying(!isPlaying)}
          color="primary"
        >
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        <IconButton
          onClick={toggleVoiceRecognition}
          color={isListening ? 'error' : 'primary'}
        >
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>

        <IconButton
          onClick={() => setShowTimerDialog(true)}
          color="primary"
        >
          <Timer />
        </IconButton>

        <IconButton
          onClick={() => setShowTempDialog(true)}
          color="primary"
        >
          <DeviceThermostat />
        </IconButton>

        <IconButton
          onClick={() => setShowNoteDialog(true)}
          color="primary"
        >
          <Edit />
        </IconButton>

        {timeRemaining !== null && (
          <Chip 
            label={`Timer: ${formatTime(timeRemaining)}`}
            color="primary"
            variant="outlined"
          />
        )}

        {totalTimeRemaining > 0 && (
          <Chip
            label={`Est. Time: ${formatTime(totalTimeRemaining * 60)}`}
            color="secondary"
            variant="outlined"
          />
        )}
      </Box>

      <List>
        {instructions.map((instruction, index) => {
          const stepNote = stepNotes.find(note => note.stepIndex === index);
          
          return (
            <ListItem
              key={`step-${instruction.id || index}`}
              sx={{
                bgcolor: currentStep === index ? 'action.selected' : 'transparent',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1">
                    Step {index + 1}
                  </Typography>
                  {instruction.duration && (
                    <Chip 
                      size="small" 
                      label={`${instruction.duration} min`}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {instruction.timerRequired && (
                    <Tooltip title="Timer recommended for this step">
                      <Timer fontSize="small" color="action" />
                    </Tooltip>
                  )}
                </Box>

                <Typography 
                  variant="body2" 
                  sx={{ mb: 1 }}
                >
                  {instruction.text}
                </Typography>

                {instruction.description && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 1,
                      pl: 2,
                      borderLeft: '2px solid',
                      borderColor: 'primary.main',
                      fontStyle: 'italic'
                    }}
                  >
                    {instruction.description}
                  </Typography>
                )}

                {stepNote && (
                  <Card variant="outlined" sx={{ mt: 1, bgcolor: 'action.hover' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TipsAndUpdates fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {stepNote.note}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          onClick={handlePreviousStep}
          disabled={currentStep === 0}
        >
          Previous Step
        </Button>
        <Button
          onClick={handleNextStep}
          endIcon={<SkipNext />}
          disabled={currentStep === instructions.length - 1}
        >
          Next Step
        </Button>
      </Box>

      {/* Timer Dialog */}
      <Dialog open={showTimerDialog} onClose={() => setShowTimerDialog(false)}>
        <DialogTitle>Set Timer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            {[1, 3, 5, 10, 15, 30].map((minutes) => (
              <Button
                key={minutes}
                variant="outlined"
                onClick={() => {
                  startTimer(minutes);
                  setShowTimerDialog(false);
                }}
              >
                {minutes}m
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTimerDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Temperature Conversion Dialog */}
      <Dialog open={showTempDialog} onClose={() => setShowTempDialog(false)}>
        <DialogTitle>Temperature Conversion</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {[350, 375, 400, 425, 450].map((temp) => (
              <Box key={temp} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>{temp}°F = {convertTemperature(temp, 'F')}°C</Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTempDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onClose={() => setShowNoteDialog(false)}>
        <DialogTitle>Add Note for Step {currentStep + 1}</DialogTitle>
        <DialogContent>
          <textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              marginTop: '16px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
            placeholder="Add your cooking notes here..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNoteDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => addStepNote(currentNote)}
            disabled={!currentNote.trim()}
            variant="contained"
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotification(null)} 
          severity="info"
          variant="filled"
        >
          {notification}
        </Alert>
      </Snackbar>
    </Paper>
  );
} 