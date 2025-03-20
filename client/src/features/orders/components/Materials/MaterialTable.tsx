import React from 'react';
import { Table, TableBody, TableContainer } from '@mui/material';
import TableHeader from './TableComponents/TableHeader';
import SelectedItemsRows from './TableComponents/SelectedItemsRows';
import CascadeSearchRow from './TableComponents/CascadeSearchRow';
import EmptyStateMessages from './TableComponents/EmptyStateMessages';
import { useMaterialTableHandlers } from '../../hooks/useMaterialTableHandlers';
import { UOM } from '../../../../types/materials';
import { 
  Material as UtilMaterial,
  SelectedInventoryItem
} from '../../utils/MaterialUtils';

// Interfaces para adaptar tipos entre los componentes
// Estas interfaces coinciden con las de los componentes hijos
interface SelectedItem {
  id: number | string;
  material: number;
  materialCode?: string;
  materialName?: string;
  lot?: string;
  license_plate?: string;
  licensePlate?: string;
  availableQty: number;
  orderQuantity?: number;
  uom?: number | string;
}

interface MaterialOption {
  id: number;
  material: number;
  materialCode?: string;
  materialName?: string;
}

interface MaterialTableProps {
  selectedItems: SelectedInventoryItem[];
  materials: UtilMaterial[];
  handleQuantityChange: (itemId: string | number, newQuantity: string | number) => void;
  handleUomChange: (itemId: string | number, newUom: string | number) => void;
  handleRemoveItem: (itemId: string | number) => void;
  availableOptions: any[];
  materialOptions: any[];
  lotOptions: any[];
  lpOptions: any[];
  currentMaterialSelection: any | null;
  currentLotSelection: any | null;
  currentLPSelection: any | null;
  setCurrentMaterialSelection: (value: any | null) => void;
  setCurrentLotSelection: (value: any | null) => void;
  setCurrentLPSelection: (value: any | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleAddItem: (material: any, lot?: any | null, lp?: any | null, quantity?: number) => void;
  materialUoms?: { [key: string]: UOM };
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
  // Usamos los parámetros directamente, sin adaptarlos
  const { getCurrentAvailableQty, handleAddButtonClick } = useMaterialTableHandlers({
    currentMaterialSelection,
    currentLotSelection,
    currentLPSelection,
    handleAddItem
  });

  // Adaptamos materialUoms para el componente SelectedItemsRows
  const adaptedMaterialUoms = materialUoms as unknown as { [key: string]: UOM[] };

  return (
    <TableContainer sx={{ mb: 3 }}>
      <Table size="small">
        <TableHeader />
        <TableBody>
          <SelectedItemsRows 
            selectedItems={selectedItems as unknown as SelectedItem[]}
            materials={materials as any[]}
            handleQuantityChange={handleQuantityChange}
            handleUomChange={handleUomChange}
            handleRemoveItem={handleRemoveItem}
            materialUoms={adaptedMaterialUoms}
          />
          
          <CascadeSearchRow 
            materialOptions={materialOptions as unknown as MaterialOption[]}
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
            materialUoms={adaptedMaterialUoms}
            handleAddButtonClick={handleAddButtonClick}
          />
          
          <EmptyStateMessages 
            selectedItems={selectedItems as unknown as SelectedItem[]}
            materialOptions={materialOptions as MaterialOption[]}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable;