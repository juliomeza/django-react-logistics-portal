import React from 'react';
import { 
  Table, 
  TableBody, 
  TableContainer
} from '@mui/material';
import TableHeader from './TableComponents/TableHeader';
import SelectedItemsRows from './TableComponents/SelectedItemsRows';
import CascadeSearchRow from './TableComponents/CascadeSearchRow';
import EmptyStateMessages from './TableComponents/EmptyStateMessages';
import { useMaterialTableHandlers } from '../../hooks/useMaterialTableHandlers';

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
  const { getCurrentAvailableQty, handleAddButtonClick } = useMaterialTableHandlers({
    currentMaterialSelection,
    currentLotSelection,
    currentLPSelection,
    handleAddItem
  });

  return (
    <TableContainer sx={{ mb: 3 }}>
      <Table size="small">
        <TableHeader />
        <TableBody>
          {/* Filas de elementos seleccionados */}
          <SelectedItemsRows 
            selectedItems={selectedItems}
            materials={materials}
            handleQuantityChange={handleQuantityChange}
            handleUomChange={handleUomChange}
            handleRemoveItem={handleRemoveItem}
            materialUoms={materialUoms}
          />
          
          {/* Fila de búsqueda en cascada */}
          <CascadeSearchRow 
            materialOptions={materialOptions}
            lotOptions={lotOptions}
            lpOptions={lpOptions}
            currentMaterialSelection={currentMaterialSelection}
            currentLotSelection={currentLotSelection}
            currentLPSelection={currentLPSelection}
            setCurrentMaterialSelection={setCurrentMaterialSelection}
            setCurrentLotSelection={setCurrentLotSelection}
            setCurrentLPSelection={setCurrentLPSelection}
            inputValue={inputValue}
            setInputValue={setInputValue}
            getCurrentAvailableQty={getCurrentAvailableQty}
            materialUoms={materialUoms}
            handleAddButtonClick={handleAddButtonClick}
          />
          
          {/* Mensajes de estado vacío */}
          <EmptyStateMessages 
            selectedItems={selectedItems} 
            materialOptions={materialOptions} 
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable;