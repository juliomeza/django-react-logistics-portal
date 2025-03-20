import React from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';

const TableHeader: React.FC = () => {
  return (
    <TableHead>
      <TableRow>
        <TableCell>Material Code</TableCell>
        <TableCell width="20%">Material Name</TableCell>
        <TableCell width="15%">Lot</TableCell>
        <TableCell width="15%">License Plate</TableCell>
        <TableCell align="right">Available Qty</TableCell>
        <TableCell>Order Qty</TableCell>
        <TableCell align="center">UOM</TableCell>
        <TableCell align="center">Actions</TableCell>
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
