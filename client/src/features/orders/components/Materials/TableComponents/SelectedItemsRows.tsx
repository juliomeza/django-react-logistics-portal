import React from 'react';
import { TableRow, TableCell, TextField, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { formatQuantity } from '../../../utils/MaterialUtils';
import { DEFAULT_QUANTITY } from '../../../utils/materialSelectionUtils';
import { 
  MaterialDisplay, 
  SelectedItem, 
  MaterialUOMsMap,
  UOM
} from '../../../../../types/materials';

interface SelectedItemsRowsProps {
  selectedItems: SelectedItem[];
  materials: MaterialDisplay[];
  handleQuantityChange: (itemId: number | string, newQuantity: number | string) => void;
  handleUomChange: (itemId: number | string, newUom: number | string) => void;
  handleRemoveItem: (itemId: number | string) => void;
  materialUoms: MaterialUOMsMap;
}

const SelectedItemsRows: React.FC<SelectedItemsRowsProps> = ({
  selectedItems,
  materials,
  handleQuantityChange,
  handleUomChange,
  handleRemoveItem,
  materialUoms
}) => {
  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      {selectedItems.map((item) => {
        const material = materials.find((m) => m.id === item.material);
        const materialId = material?.id?.toString() || '';
        
        return (
          <TableRow key={item.id}>
            <TableCell>{item.materialCode || material?.lookup_code || '-'}</TableCell>
            <TableCell>{item.materialName || material?.name || 'Unknown Material'}</TableCell>
            <TableCell>{item.lot || '-'}</TableCell>
            <TableCell>{item.license_plate || item.licensePlate || '-'}</TableCell>
            <TableCell align="right">{formatQuantity(item.availableQty)}</TableCell>
            <TableCell>
              <TextField
                size="small"
                value={item.orderQuantity || DEFAULT_QUANTITY}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  if (val === '' || !isNaN(Number(val))) {
                    handleQuantityChange(item.id, val);
                  }
                }}
                InputProps={{
                  inputProps: {
                    min: 1,
                    ...(typeof item.availableQty === 'number' &&
                    !isNaN(item.availableQty) &&
                    item.availableQty > 0
                      ? { max: item.availableQty }
                      : {}),
                    type: 'number',
                    style: { textAlign: 'center' }
                  }
                }}
                sx={{ width: '80px' }}
              />
            </TableCell>
            <TableCell align="center">
              <TextField
                select
                size="small"
                value={item.uom || material?.uom || ''}
                onChange={(e) => {
                  if (handleUomChange) {
                    handleUomChange(item.id, e.target.value);
                  }
                }}
                SelectProps={{
                  native: true,
                }}
                sx={{ width: '120px' }}
              >
                {materialId && materialUoms[materialId] ? 
                  materialUoms[materialId].map((uom: UOM) => (
                    <option key={uom.id} value={uom.id}>
                      {uom.name}
                    </option>
                  )) : 
                  <option value="1">Each</option>
                }
              </TextField>
            </TableCell>
            <TableCell align="center">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => handleRemoveItem(item.id)}
              >
                <Delete fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

export default SelectedItemsRows;