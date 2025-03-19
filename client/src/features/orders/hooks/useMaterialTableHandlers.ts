import { DEFAULT_QUANTITY } from '../utils/materialSelectionUtils';

// Interfaces para las selecciones de material
interface MaterialSelection {
  material: number;
  materialCode?: string;
  materialName?: string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: Array<any>;
  [key: string]: any;
}

interface LotSelection extends MaterialSelection {
  lot: string;
}

interface LPSelection {
  id: string | number;
  material: number;
  lot?: string;
  license_plate?: string;
  licensePlate?: string;
  quantity: number;
  availableQty?: number;
  [key: string]: any;
}

interface UseMaterialTableHandlersProps {
  currentMaterialSelection: MaterialSelection | null;
  currentLotSelection: LotSelection | null;
  currentLPSelection: LPSelection | null;
  handleAddItem: (material: MaterialSelection, lot: LotSelection | null, lp: LPSelection | null, quantity: number) => void;
}

/**
 * Hook para manejar interacciones con la tabla de materiales
 */
export const useMaterialTableHandlers = ({
  currentMaterialSelection,
  currentLotSelection,
  currentLPSelection,
  handleAddItem,
}: UseMaterialTableHandlersProps) => {
  /**
   * Obtiene la cantidad disponible actual basada en la selección
   */
  const getCurrentAvailableQty = (): number => {
    if (currentLPSelection) {
      const lpQuantity = currentLPSelection.quantity ? parseFloat(currentLPSelection.quantity.toString()) : 0;
      return lpQuantity;
    } else if (currentLotSelection) {
      return currentLotSelection.availableQty || 0;
    } else if (currentMaterialSelection) {
      return currentMaterialSelection.availableQty || 0;
    } else {
      return 0;
    }
  };

  /**
   * Maneja el clic en el botón de agregar
   */
  const handleAddButtonClick = (): void => {
    if (!currentMaterialSelection) return;
    
    const quantityInput = document.getElementById('order-quantity-input') as HTMLInputElement | null;
    const rawQuantity = quantityInput ? parseInt(quantityInput.value, 10) || DEFAULT_QUANTITY : DEFAULT_QUANTITY;
    const availableQty = getCurrentAvailableQty();
    const validQuantity = Math.min(Math.max(1, rawQuantity), availableQty);

    handleAddItem(currentMaterialSelection, currentLotSelection, currentLPSelection, validQuantity);

    if (quantityInput) {
      quantityInput.value = DEFAULT_QUANTITY.toString();
    }
  };

  return {
    getCurrentAvailableQty,
    handleAddButtonClick,
  };
};

export default useMaterialTableHandlers;