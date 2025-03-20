import { DEFAULT_QUANTITY } from '../utils/materialSelectionUtils';

// Interfaz base para selecciones con propiedades comunes
interface BaseSelection {
  id: string | number;
  material: number;
  availableQty?: number;
}

// Definición de un inventario de item
interface InventoryItem {
  id: number;
  material: number;
  warehouse: number;
  quantity: number;
  lot?: string;
  license_plate?: string;
  location?: string;
  vendor_lot?: string;
  [key: string]: unknown; // Usar unknown en lugar de any para una mayor seguridad de tipos
}

// Interfaces para las selecciones de material
interface MaterialSelection extends BaseSelection {
  materialCode?: string;
  materialName?: string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: InventoryItem[];
  // Propiedades opcionales específicas
  description?: string;
  type?: number;
  status?: number;
  is_serialized?: boolean;
}

interface LotSelection extends MaterialSelection {
  lot: string;
}

interface LPSelection extends BaseSelection {
  lot?: string;
  license_plate?: string;
  licensePlate?: string;
  quantity: number;
  // Propiedades opcionales específicas
  location?: string;
  warehouse?: number;
  vendor_lot?: string;
}

interface UseMaterialTableHandlersProps {
  currentMaterialSelection: MaterialSelection | null;
  currentLotSelection: LotSelection | null;
  currentLPSelection: LPSelection | null;
  handleAddItem: (material: MaterialSelection, lot: LotSelection | null, lp: LPSelection | null, quantity: number) => void;
}

interface UseMaterialTableHandlersReturn {
  getCurrentAvailableQty: () => number;
  handleAddButtonClick: () => void;
}

/**
 * Hook para manejar interacciones con la tabla de materiales
 */
export const useMaterialTableHandlers = ({
  currentMaterialSelection,
  currentLotSelection,
  currentLPSelection,
  handleAddItem,
}: UseMaterialTableHandlersProps): UseMaterialTableHandlersReturn => {
  /**
   * Obtiene la cantidad disponible actual basada en la selección
   */
  const getCurrentAvailableQty = (): number => {
    if (currentLPSelection) {
      // Manejo seguro de la conversión de quantity a número
      const rawQuantity = currentLPSelection.quantity;
      return typeof rawQuantity === 'string' 
        ? parseFloat(rawQuantity) || 0 
        : typeof rawQuantity === 'number' ? rawQuantity : 0;
    } 
    
    if (currentLotSelection) {
      return currentLotSelection.availableQty;
    } 
    
    if (currentMaterialSelection) {
      return currentMaterialSelection.availableQty;
    } 
    
    return 0;
  };

  /**
   * Maneja el clic en el botón de agregar
   */
  const handleAddButtonClick = (): void => {
    if (!currentMaterialSelection) return;
    
    const quantityInput = document.getElementById('order-quantity-input') as HTMLInputElement | null;
    
    // Manejo más seguro de la conversión a número
    const rawQuantityText = quantityInput?.value || '';
    const rawQuantity = /^\d+(\.\d+)?$/.test(rawQuantityText)
      ? parseFloat(rawQuantityText)
      : DEFAULT_QUANTITY;
    
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