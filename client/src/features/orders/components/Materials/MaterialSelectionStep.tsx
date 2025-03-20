import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import MaterialTable from './MaterialTable';
import { useMaterialSelection } from '../../hooks/useMaterialSelection';
import { 
  UOM
} from '../../../../types/materials';
import { 
  EnrichedInventoryOption, 
  Material as UtilMaterial,
  SelectedInventoryItem 
} from '../../utils/MaterialUtils';
import { FormState } from '../../reducers/formReducer';

// Para entender mejor el tipo que espera useMaterialSelection
// Si tienes acceso al tipo FormData que usa useMaterialSelection, 
// sería mejor importarlo directamente
interface FormData {
  selectedInventories?: SelectedInventoryItem[];
  project?: number;  // Aquí project es number
  [key: string]: unknown;
}

// Interface para las props del componente
interface MaterialSelectionStepProps {
  formData: FormState;
  setFormData: (data: any) => void;  // Usamos any para mantener compatibilidad
  inventories?: EnrichedInventoryOption[];
  materials?: UtilMaterial[];
  loading?: boolean;
  materialUoms?: { [materialId: string]: UOM[] };
}

// Función adaptadora para convertir FormState a FormData
const adaptFormData = (data: FormState): FormData => {
  // En vez de hacer spread, creamos un objeto del tipo correcto
  const result: FormData = {
    selectedInventories: data.selectedInventories,
    // Convertimos explícitamente project a número si es posible
    project: typeof data.project === 'string' ? 
      (isNaN(Number(data.project)) ? undefined : Number(data.project)) : 
      data.project as number | undefined
  };
  
  return result;
};

const MaterialSelectionStep: React.FC<MaterialSelectionStepProps> = ({
  formData,
  setFormData,
  inventories = [],
  materials = [],
  loading = false,
  materialUoms = {}
}) => {
  // Adaptar formData al formato que espera useMaterialSelection
  const adaptedFormData = adaptFormData(formData);
  
  // Adaptamos el setFormData para que tenga el tipo correcto 
  const adaptedSetFormData = (data: any) => {
    setFormData(data);
  };
  
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
    formData: adaptedFormData as any, // Forzamos el tipo para evitar errores
    setFormData: adaptedSetFormData,
    inventories,
    materials
  });

  // Adaptamos handleQuantityChange para que acepte string | number
  const adaptedHandleQuantityChange = (
    itemId: string | number, 
    newQuantity: string | number
  ) => {
    // Si newQuantity es string, convertirlo a número
    const numberQuantity = typeof newQuantity === 'string' ? 
      Number(newQuantity) : newQuantity;
    
    handleQuantityChange(itemId, numberQuantity);
  };

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

          <MaterialTable 
            selectedItems={selectedItems}
            materials={materials}
            handleQuantityChange={adaptedHandleQuantityChange}
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
            materialUoms={materialUoms as any}  // Forzamos el tipo para resolver el error
          />
          
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