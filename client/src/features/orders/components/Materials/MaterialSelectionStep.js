import React from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';
import MaterialTable from './MaterialTable';
import { useMaterialSelection } from '../../hooks/useMaterialSelection';

const MaterialSelectionStep = ({ 
  formData, 
  setFormData, 
  inventories = [], 
  materials = [],
  loading = false,
  materialUoms = {}
}) => {
  const {
    selectedItems,
    materialOptions,
    lotOptions,
    lpOptions,
    currentMaterialSelection,
    currentLotSelection,
    currentLPSelection,
    materialInputValue,
    isProjectSelected,
    setCurrentMaterialSelection,
    setCurrentLotSelection,
    setCurrentLPSelection,
    setMaterialInputValue,
    handleAddItem,
    handleQuantityChange,
    handleUomChange,
    handleRemoveItem
  } = useMaterialSelection({
    formData,
    setFormData,
    inventories,
    materials
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Select Materials
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!isProjectSelected && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              Please select a project in the Logistics Information section first.
            </Typography>
          )}

          {/* MaterialTable con selección en cascada */}
          <MaterialTable 
            selectedItems={selectedItems}
            materials={materials}
            handleQuantityChange={handleQuantityChange}
            handleUomChange={handleUomChange}
            handleRemoveItem={handleRemoveItem}
            availableOptions={materialOptions}
            materialOptions={materialOptions}
            lotOptions={lotOptions}
            lpOptions={lpOptions}
            currentMaterialSelection={currentMaterialSelection}
            currentLotSelection={currentLotSelection}
            currentLPSelection={currentLPSelection}
            setCurrentMaterialSelection={setCurrentMaterialSelection}
            setCurrentLotSelection={setCurrentLotSelection}
            setCurrentLPSelection={setCurrentLPSelection}
            inputValue={materialInputValue}
            setInputValue={setMaterialInputValue}
            handleAddItem={handleAddItem}
            materialUoms={materialUoms}
            isProjectSelected={isProjectSelected}
          />
          
          {/* Contador de items seleccionados */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              {selectedItems.length} items selected
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MaterialSelectionStep;