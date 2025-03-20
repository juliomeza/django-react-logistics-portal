import React from 'react';
import { Box, Button, BoxProps } from '@mui/material';

/**
 * Props para el componente OrderStepActions
 */
interface OrderStepActionsProps {
  /**
   * Índice del paso actual (base 0)
   */
  currentStep: number;
  
  /**
   * Número total de pasos en el flujo
   */
  totalSteps: number;
  
  /**
   * Función para manejar la navegación hacia atrás
   */
  onBack: () => void;
  
  /**
   * Función para manejar la navegación hacia adelante
   */
  onNext: () => void;
  
  /**
   * Función para guardar el estado actual del formulario
   */
  onSave: () => void;
  
  /**
   * Función para enviar la orden completada
   */
  onSubmit: () => void;
  
  /**
   * Si el botón de envío debe estar deshabilitado
   */
  disableSubmit?: boolean;
  
  /**
   * Si el botón de guardar debe estar deshabilitado
   */
  disableSave?: boolean;
  
  /**
   * Props adicionales para el contenedor Box
   */
  containerProps?: Omit<BoxProps, 'children'>;
}

/**
 * Componente que muestra los botones de navegación para un formulario multi-paso.
 * Maneja los botones de navegación (atrás/siguiente), guardar y enviar.
 */
const OrderStepActions: React.FC<OrderStepActionsProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSave,
  onSubmit,
  disableSubmit = false,
  disableSave = false,
  containerProps,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const showSaveButton = currentStep === 1;
  
  return (
    <Box 
      sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
      {...containerProps}
    >
      <Button 
        variant="outlined" 
        onClick={onBack} 
        disabled={isFirstStep}
      >
        Back
      </Button>
      <Box>
        {showSaveButton && (
          <Button 
            variant="outlined" 
            onClick={onSave} 
            sx={{ mr: 2 }} 
            disabled={disableSave}
          >
            Save
          </Button>
        )}
        {!isLastStep ? (
          <Button 
            variant="contained" 
            onClick={onNext}
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={onSubmit} 
            variant="contained" 
            color="primary" 
            disabled={disableSubmit}
          >
            Submit Order
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OrderStepActions;