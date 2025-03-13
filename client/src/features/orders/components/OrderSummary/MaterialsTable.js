import React from 'react';
import { 
  Paper,
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

/**
 * Table component to display materials in the order summary
 * 
 * @param {Object} props - Component props
 * @param {Array} props.materialItems - List of materials to display
 * @param {Function} props.getMaterialName - Function to get material name by ID
 * @param {Function} props.displayValue - Function to format display values
 * @param {Boolean} props.isReviewMode - Whether in review mode
 */
const MaterialsTable = ({ 
  materialItems, 
  getMaterialName, 
  displayValue,
  isReviewMode 
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