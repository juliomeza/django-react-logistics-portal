import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

interface ProjectWarningDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProjectWarningDialog: React.FC<ProjectWarningDialogProps> = ({ open, onClose }) => {
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
        <Button onClick={onClose} color="primary">
          CANCEL
        </Button>
        <Button onClick={onClose} color="primary" variant="contained" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectWarningDialog;
