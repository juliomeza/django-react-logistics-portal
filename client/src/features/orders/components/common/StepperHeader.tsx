import React from 'react';
import { Stepper, Step, StepLabel, Container } from '@mui/material';

interface StepperHeaderProps {
  activeStep: number;
  steps: string[];
}

const StepperHeader: React.FC<StepperHeaderProps> = ({ activeStep, steps }) => {
  return (
    <Container maxWidth="lg">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={activeStep > index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Container>
  );
};

export default StepperHeader;
