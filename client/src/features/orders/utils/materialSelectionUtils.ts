// Constante para valor predeterminado
export const DEFAULT_QUANTITY = 1;

/**
 * Obtiene los valores a mostrar en la UI para un conjunto selección.
 */
export const getDisplayValues = (
  material: any,
  lot: any,
  lp: any
): { name: string; code: string; lot: string; licensePlate: string } => ({
  name: material.materialName || '',
  code: material.materialCode || '',
  lot: lot ? (lot.lot || '') : '',
  licensePlate: lp ? (lp.license_plate || lp.licensePlate || '') : '',
});

/**
 * Obtiene la cantidad disponible basada en la selección actual.
 */
export const getAvailableQuantity = (
  material: any,
  lot: any,
  lp: any
): number => {
  if (lp) {
    return lp.quantity ? parseFloat(lp.quantity) : 0;
  } else if (lot) {
    return lot.availableQty || 0;
  } else {
    return material.availableQty || 0;
  }
};

/**
 * Valida y ajusta la cantidad de orden para que esté dentro de los límites permitidos.
 */
export const validateOrderQuantity = (quantity: number, availableQty: number): number => {
  return Math.min(Math.max(DEFAULT_QUANTITY, quantity), availableQty);
};
