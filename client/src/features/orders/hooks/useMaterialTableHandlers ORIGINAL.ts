import { DEFAULT_QUANTITY } from '../utils/materialSelectionUtils';

interface UseMaterialTableHandlersProps {
  currentMaterialSelection: any;
  currentLotSelection: any;
  currentLPSelection: any;
  handleAddItem: (material: any, lot: any, lp: any, quantity: number) => void;
}

export const useMaterialTableHandlers = ({
  currentMaterialSelection,
  currentLotSelection,
  currentLPSelection,
  handleAddItem,
}: UseMaterialTableHandlersProps) => {
  const getCurrentAvailableQty = (): number => {
    if (currentLPSelection) {
      const lpQuantity = currentLPSelection.quantity ? parseFloat(currentLPSelection.quantity) : 0;
      return lpQuantity;
    } else if (currentLotSelection) {
      return currentLotSelection.availableQty || 0;
    } else if (currentMaterialSelection) {
      return currentMaterialSelection.availableQty || 0;
    } else {
      return 0;
    }
  };

  const handleAddButtonClick = () => {
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
