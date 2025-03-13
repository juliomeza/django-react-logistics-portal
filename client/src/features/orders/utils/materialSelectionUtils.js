// Constante para valor predeterminado
export const DEFAULT_QUANTITY = 1;

/**
 * Obtiene los valores a mostrar en la UI para un conjunto selección
 * 
 * @param {Object} material - Material seleccionado
 * @param {Object} lot - Lote seleccionado (opcional)
 * @param {Object} lp - License plate seleccionado (opcional)
 * @returns {Object} Valores para mostrar en la UI
 */
export const getDisplayValues = (material, lot, lp) => ({
  name: material.materialName || '',
  code: material.materialCode || '',
  lot: lot ? (lot.lot || '') : '',
  licensePlate: lp ? (lp.license_plate || lp.licensePlate || '') : ''
});

/**
 * Obtiene la cantidad disponible basada en la selección actual
 * 
 * @param {Object} material - Material seleccionado
 * @param {Object} lot - Lote seleccionado (opcional)
 * @param {Object} lp - License plate seleccionado (opcional)
 * @returns {number} Cantidad disponible
 */
export const getAvailableQuantity = (material, lot, lp) => {
  if (lp) {
    return lp.quantity ? parseFloat(lp.quantity) : 0;
  } else if (lot) {
    return lot.availableQty || 0;
  } else {
    return material.availableQty || 0;
  }
};

/**
 * Valida y ajusta la cantidad de orden para que esté dentro de los límites permitidos
 * 
 * @param {number} quantity - Cantidad solicitada
 * @param {number} availableQty - Cantidad disponible máxima
 * @returns {number} Cantidad validada
 */
export const validateOrderQuantity = (quantity, availableQty) => {
  return Math.min(Math.max(DEFAULT_QUANTITY, quantity), availableQty);
};