import React from 'react';
import { Table, TableBody, TableContainer } from '@mui/material';
import TableHeader from './TableComponents/TableHeader';
import SelectedItemsRows from './TableComponents/SelectedItemsRows';
import CascadeSearchRow from './TableComponents/CascadeSearchRow';
import EmptyStateMessages from './TableComponents/EmptyStateMessages';
import { useMaterialTableHandlers } from '../../hooks/useMaterialTableHandlers';

interface MaterialTableProps {
  selectedItems: any[];
  materials: any[];
  handleQuantityChange: (itemId: any, newQuantity: number) => void;
  handleUomChange: (itemId: any, newUom: any) => void;
  handleRemoveItem: (itemId: any) => void;
  availableOptions: any;
  materialOptions: any;
  lotOptions: any;
  lpOptions: any;
  currentMaterialSelection: any;
  currentLotSelection: any;
  currentLPSelection: any;
  setCurrentMaterialSelection: (value: any) => void;
  setCurrentLotSelection: (value: any) => void;
  setCurrentLPSelection: (value: any) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  // Actualizamos la firma para que acepte parámetros opcionales
  handleAddItem: (material: any, lot?: any, lp?: any, quantity?: number) => void;
  materialUoms?: { [key: string]: any };
}

const MaterialTable: React.FC<MaterialTableProps> = ({
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
          <SelectedItemsRows 
            selectedItems={selectedItems}
            materials={materials}
            handleQuantityChange={handleQuantityChange}
            handleUomChange={handleUomChange}
            handleRemoveItem={handleRemoveItem}
            materialUoms={materialUoms}
          />
          
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
