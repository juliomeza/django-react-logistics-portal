import React from 'react';
import { TableRow, TableCell, TextField, IconButton, Autocomplete } from '@mui/material';
import { Add } from '@mui/icons-material';
import { formatQuantity } from '../../../utils/MaterialUtils';
import { DEFAULT_QUANTITY } from '../../../utils/materialSelectionUtils';
import { 
  MaterialOption, 
  LotOption, 
  LicensePlateOption,
  MaterialUOMsMap
} from '../../../../../types/materials';

interface CascadeSearchRowProps {
  materialOptions: MaterialOption[];
  lotOptions: LotOption[];
  lpOptions: LicensePlateOption[];
  currentMaterialSelection: MaterialOption | null;
  currentLotSelection: LotOption | null;
  currentLPSelection: LicensePlateOption | null;
  setCurrentMaterialSelection: (value: MaterialOption | null) => void;
  setCurrentLotSelection: (value: LotOption | null) => void;
  setCurrentLPSelection: (value: LicensePlateOption | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  getCurrentAvailableQty: () => number;
  materialUoms: MaterialUOMsMap;
  handleAddButtonClick: () => void;
}

const CascadeSearchRow: React.FC<CascadeSearchRowProps> = ({
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
  getCurrentAvailableQty,
  materialUoms,
  handleAddButtonClick
}) => {
  // Helper to get the UOM name from the material selection
  const getUomName = (): string => {
    if (!currentMaterialSelection) return 'Each';
    
    const materialId = currentMaterialSelection.material.toString();
    const uoms = materialUoms[materialId];
    
    if (uoms && uoms.length > 0) {
      return uoms[0].name;
    }
    
    return 'Each';
  };

  return (
    <TableRow>
      {/* Búsqueda de material - primer nivel de cascada */}
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
      
      {/* Búsqueda de lote - segundo nivel de cascada */}
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
      
      {/* Búsqueda de license plate - tercer nivel de cascada */}
      <TableCell>
        <Autocomplete
          id="lp-select"
          options={lpOptions}
          value={currentLPSelection}
          onChange={(event, newValue) => {
            setCurrentLPSelection(newValue);
          }}
          disabled={!currentLotSelection}
          getOptionLabel={(option) => {
            if (!option) return '';
            return option.license_plate || option.licensePlate || '';
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
      
      {/* Cantidad disponible - se actualiza a medida que se estrechan las selecciones */}
      <TableCell align="right">
        {formatQuantity(getCurrentAvailableQty())}
      </TableCell>
      
      {/* Cantidad de orden - disponible tan pronto como se selecciona el material */}
      <TableCell>
        {currentMaterialSelection && (
          <TextField
            size="small"
            defaultValue={DEFAULT_QUANTITY}
            id="order-quantity-input"
            disabled={!currentMaterialSelection}
            InputProps={{
              inputProps: {
                min: 1,
                max: getCurrentAvailableQty(),
                type: 'number',
                style: { textAlign: 'center' }
              }
            }}
            sx={{ width: '80px' }}
          />
        )}
      </TableCell>
      
      {/* UOM - mostrar UOM basado en el material seleccionado */}
      <TableCell align="center">
        {currentMaterialSelection && getUomName()}
      </TableCell>
      
      {/* Botón Agregar - solo requiere selección de material */}
      <TableCell align="center">
        <IconButton 
          color="primary"
          disabled={!currentMaterialSelection}
          onClick={handleAddButtonClick}
        >
          <Add />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default CascadeSearchRow;