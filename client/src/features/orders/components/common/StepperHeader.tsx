import React from 'react';
import { Stepper, Step, StepLabel, Container, ContainerProps } from '@mui/material';

interface StepperHeaderProps {
  /**
   * Índice del paso activo (comenzando desde 0)
   */
  activeStep: number;
  /**
   * Lista de etiquetas para cada paso
   */
  steps: readonly string[];
  /**
   * Props opcionales para el Container
   */
  containerProps?: Omit<ContainerProps, 'children' | 'ref'>;
}

/**
 * Componente que muestra un encabezado con pasos de navegación
 * Útil para formularios o procesos que requieren múltiples pasos
 */
const StepperHeader: React.FC<StepperHeaderProps> = ({ 
  activeStep, 
  steps,
  containerProps
}) => {
  return (
    <Container maxWidth="lg" {...containerProps}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={`step-${index}-${label}`} completed={activeStep > index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Container>
  );
};

export default StepperHeader;