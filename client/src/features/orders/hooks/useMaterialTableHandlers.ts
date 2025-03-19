import { DEFAULT_QUANTITY } from '../utils/materialSelectionUtils';

// Definición de un inventario de item para reemplazar el Array<any>
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
interface MaterialSelection {
  material: number;
  materialCode?: string;
  materialName?: string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: InventoryItem[]; // Tipo específico en lugar de Array<any>
  // Propiedades opcionales específicas en lugar del genérico [key: string]: any
  description?: string;
  type?: number;
  status?: number;
  is_serialized?: boolean;
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
  // Propiedades opcionales específicas en lugar del genérico [key: string]: any
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
      // Manejo seguro de la conversión de quantity a número
      const rawQuantity = currentLPSelection.quantity;
      const lpQuantity = typeof rawQuantity === 'string' 
        ? parseFloat(rawQuantity) || 0 
        : typeof rawQuantity === 'number' ? rawQuantity : 0;
      
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