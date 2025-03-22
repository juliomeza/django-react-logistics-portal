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
  SxProps,
  Theme,
} from '@mui/material';
import { SelectedItem } from '../../../../types/materials';

interface MaterialsTableProps {
  materialItems: SelectedItem[];
  getMaterialName: (id: number | string) => string;
  displayValue: (value?: any) => React.ReactNode;
  isReviewMode: boolean;
  sx?: SxProps<Theme>;
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materialItems,
  getMaterialName,
  displayValue,
  isReviewMode,
  sx,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, ...sx }}>
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
                <TableCell>{displayValue(item.license_plate || item.licensePlate)}</TableCell>
                <TableCell align="right">
                  {isReviewMode ? (item.orderQuantity || 1) : ((item as any).quantity || 1)}
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