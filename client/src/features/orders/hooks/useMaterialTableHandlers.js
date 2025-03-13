import { DEFAULT_QUANTITY } from '../utils/materialSelectionUtils';

/**
 * Hook que proporciona funciones de utilidad para la tabla de materiales
 */
export const useMaterialTableHandlers = ({
  currentMaterialSelection,
  currentLotSelection,
  currentLPSelection,
  handleAddItem
}) => {
  /**
   * Obtiene la cantidad disponible actual basada en la selección en cascada
   */
  const getCurrentAvailableQty = () => {
    if (currentLPSelection) {
      // Convertir string a número si es necesario
      const lpQuantity = currentLPSelection.quantity ? 
        parseFloat(currentLPSelection.quantity) : 0;
      
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
  const handleAddButtonClick = () => {
    // Obtener el valor de cantidad del campo de entrada
    const quantityInput = document.getElementById('order-quantity-input');
    const rawQuantity = quantityInput ? parseInt(quantityInput.value, 10) || DEFAULT_QUANTITY : DEFAULT_QUANTITY;
    
    // Validar que la cantidad no exceda lo disponible
    const availableQty = getCurrentAvailableQty();
    const validQuantity = Math.min(Math.max(1, rawQuantity), availableQty);
    
    // Llamar a handleAddItem con los materiales y la cantidad
    handleAddItem(
      currentMaterialSelection, 
      currentLotSelection, 
      currentLPSelection, 
      validQuantity
    );

    // Resetear el input de cantidad manualmente
    if (quantityInput) {
      quantityInput.value = DEFAULT_QUANTITY.toString();
    }
  };

  return {
    getCurrentAvailableQty,
    handleAddButtonClick
  };
};

export default useMaterialTableHandlers;