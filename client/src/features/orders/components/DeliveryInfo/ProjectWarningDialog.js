import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

/**
 * Diálogo de advertencia que se muestra cuando se intenta agregar un nuevo contacto
 * sin haber seleccionado un proyecto primero
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Controla si el diálogo está abierto o cerrado
 * @param {Function} props.onClose - Función para cerrar el diálogo
 */
const ProjectWarningDialog = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="project-required-dialog-title"
    >
      <DialogTitle id="project-required-dialog-title">
        Project Required
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary">
          Please select a Project in the "Logistics Information" section before adding a new contact.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="primary"
        >
          CANCEL
        </Button>
        <Button 
          onClick={onClose} 
          color="primary" 
          variant="contained"
          autoFocus
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectWarningDialog;