import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Order } from '../../../types';

interface DeleteOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order?: Pick<Order, 'id' | 'lookup_code_order'>; // Solo necesitamos algunos campos del Order
}

const DeleteOrderDialog: React.FC<DeleteOrderDialogProps> = ({ 
  open, 
  onClose, 
  onConfirm, 
  order 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">Delete Order</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          {order && `Are you sure you want to delete order ${order.lookup_code_order}?`}
          {!order && 'Are you sure you want to delete this order?'} 
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={onConfirm} color="error" autoFocus>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteOrderDialog;