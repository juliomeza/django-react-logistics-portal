import React from 'react';
import { TableRow, TableCell, Typography } from '@mui/material';

/**
 * Componente que muestra mensajes para estados vacíos en la tabla
 */
const EmptyStateMessages = ({ selectedItems, materialOptions }) => {
  if (selectedItems.length > 0) {
    return null;
  }
  
  if (materialOptions?.length > 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Search and select materials to add to your order
          </Typography>
        </TableCell>
      </TableRow>
    );
  }
  
  return (
    <TableRow>
      <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No inventory items available
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export default EmptyStateMessages;