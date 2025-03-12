import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  IconButton,
  Typography,
  Autocomplete
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { formatQuantity } from '../../utils/MaterialUtils';

const MaterialTable = ({ 
  selectedItems, 
  materials, 
  handleQuantityChange, 
  handleUomChange,
  handleRemoveItem, 
  availableOptions,
  materialOptions, 
  lotOptions, 
  lpOptions, 
  currentMaterialSelection, 
  currentLotSelection, 
  currentLPSelection, 
  setCurrentMaterialSelection, 
  setCurrentLotSelection, 
  setCurrentLPSelection, 
  inputValue, 
  setInputValue,
  handleAddItem,
  materialUoms = {}
}) => {
  return (
    <TableContainer sx={{ mb: 3 }}>
      <Table size="small">
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
        <TableBody>
          {selectedItems.map((item) => {
            const material = materials.find(m => m.id === item.material);
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
                    value={item.orderQuantity || 1}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      if (val === '' || !isNaN(val)) {
                        handleQuantityChange(item.id, val);
                      }
                    }}
                    InputProps={{
                      inputProps: {
                        min: 1,
                        // Ensure max is always a valid number or remove it if not
                        ...(typeof item.availableQty === 'number' && !isNaN(item.availableQty) && item.availableQty > 0
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
                      handleUomChange && handleUomChange(item.id, e.target.value);
                    }}
                    SelectProps={{
                      native: true,
                    }}
                    sx={{ width: '120px' }}
                  >
                    {materialUoms[material?.id] ? 
                      materialUoms[material?.id].map(uom => (
                        <option key={uom.id} value={uom.id}>{uom.name}</option>
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
          
          {/* Cascade search row */}
          <TableRow>
            {/* Material search - first level of cascade */}
            <TableCell colSpan={2}>
              <Autocomplete
                id="material-select"
                options={materialOptions}
                value={currentMaterialSelection}
                onChange={(event, newValue) => {
                  setCurrentMaterialSelection(newValue);
                  setCurrentLotSelection(null);
                  setCurrentLPSelection(null);
                }}
                inputValue={inputValue}
                onInputChange={(event, newValue) => {
                  setInputValue(newValue);
                }}
                getOptionLabel={(option) => `${option.materialCode || ''} - ${option.materialName || ''}`}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Search by code or name"
                    size="small"
                  />
                )}
                isOptionEqualToValue={(option, value) => option?.material === value?.material}
                noOptionsText="No materials available"
                fullWidth
              />
            </TableCell>
            
            {/* Lot search - second level of cascade */}
            <TableCell>
              <Autocomplete
                id="lot-select"
                options={lotOptions}
                value={currentLotSelection}
                onChange={(event, newValue) => {
                  setCurrentLotSelection(newValue);
                  setCurrentLPSelection(null);
                }}
                disabled={!currentMaterialSelection}
                getOptionLabel={(option) => option.lot || ''}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select lot"
                    size="small"
                  />
                )}
                noOptionsText="No lots available"
                fullWidth
              />
            </TableCell>
            
            {/* License Plate search - third level of cascade */}
            <TableCell>
              <Autocomplete
                id="lp-select"
                options={lpOptions}
                value={currentLPSelection}
                onChange={(event, newValue) => {
                  console.log("Selected LP:", newValue);
                  setCurrentLPSelection(newValue);
                }}
                disabled={!currentLotSelection}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return option.license_plate || '';
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    placeholder="Select license plate"
                    size="small"
                  />
                )}
                noOptionsText="No license plates available"
                fullWidth
              />
            </TableCell>
            
            {/* Available Qty - updates as selections narrow down */}
            <TableCell align="right">
              {(() => {
                // Use the same approach as the working parts of the cascade
                if (currentLPSelection) {
                  // Convert string to number if needed
                  const lpQuantity = currentLPSelection.quantity ? 
                    parseFloat(currentLPSelection.quantity) : 0;
                  
                  return formatQuantity(lpQuantity);
                } else if (currentLotSelection) {
                  return formatQuantity(currentLotSelection.availableQty || 0);
                } else if (currentMaterialSelection) {
                  return formatQuantity(currentMaterialSelection.availableQty || 0);
                } else {
                  return formatQuantity(0);
                }
              })()}
            </TableCell>
            
            {/* Order Qty - available as soon as material is selected */}
            <TableCell>
              {currentMaterialSelection && (
                <TextField
                  size="small"
                  defaultValue={1}
                  id="order-quantity-input"
                  disabled={!currentMaterialSelection}
                  InputProps={{
                    inputProps: {
                      min: 1,
                      max: currentLPSelection ? parseFloat(currentLPSelection.quantity) || 0 : 
                           currentLotSelection ? currentLotSelection.availableQty || 0 : 
                           currentMaterialSelection ? currentMaterialSelection.availableQty || 0 : 0,
                      type: 'number',
                      style: { textAlign: 'center' }
                    }
                  }}
                  sx={{ width: '80px' }}
                />
              )}
            </TableCell>
            
            {/* UOM - show UOM based on selected material */}
            <TableCell align="center">
              {currentMaterialSelection && (
                materialUoms[currentMaterialSelection.material] ? 
                  materialUoms[currentMaterialSelection.material][0]?.name : 
                  'Each'
              )}
            </TableCell>
            
            {/* Add button - only requires material selection */}
            <TableCell align="center">
              <IconButton 
                color="primary"
                disabled={!currentMaterialSelection}
                onClick={() => {
                  // Get the quantity value from the input field
                  const quantityInput = document.getElementById('order-quantity-input');
                  const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;
                  
                  // Call handleAddItem with the materials and quantity
                  handleAddItem(
                    currentMaterialSelection, 
                    currentLotSelection, 
                    currentLPSelection, 
                    quantity
                  );
                }}
              >
                <Add />
              </IconButton>
            </TableCell>
          </TableRow>
          
          {/* Empty state messages */}
          {selectedItems.length === 0 && materialOptions?.length > 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Search and select materials to add to your order
                </Typography>
              </TableCell>
            </TableRow>
          )}
          
          {materialOptions?.length === 0 && selectedItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No inventory items available
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable;