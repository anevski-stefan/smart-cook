import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
} from '@mui/material';
import { useState } from 'react';
import type { Instruction } from '@/types/ingredient';

interface RecipeInstructionsProps {
  instructions: Instruction[];
}

export default function RecipeInstructions({ instructions }: RecipeInstructionsProps) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Instructions
      </Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        {instructions.map((instruction) => (
          <Step key={instruction.number}>
            <StepLabel>Step {instruction.number}</StepLabel>
            <StepContent>
              <Typography>{instruction.step}</Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {activeStep === instructions.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Back
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === instructions.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>All steps completed - you&apos;re finished!</Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Start Over
          </Button>
        </Paper>
      )}
    </Paper>
  );
} 