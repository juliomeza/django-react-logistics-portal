import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

interface MaterialsTableProps {
  materialItems: any[];
  getMaterialName: (id: any) => string;
  displayValue: (value?: any) => React.ReactNode;
  isReviewMode: boolean;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materialItems,
  getMaterialName,
  displayValue,
  isReviewMode,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Selected Materials
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell>Lot</TableCell>
              <TableCell>License Plate</TableCell>
              <TableCell align="right">Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materialItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{getMaterialName(item.material)}</TableCell>
                <TableCell>{displayValue(item.lot)}</TableCell>
                <TableCell>{displayValue(item.license_plate)}</TableCell>
                <TableCell align="right">
                  {isReviewMode ? (item.orderQuantity || 1) : (item.quantity || 1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default MaterialsTable;
