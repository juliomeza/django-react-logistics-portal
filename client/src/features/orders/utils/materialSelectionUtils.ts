// Constante para valor predeterminado
export const DEFAULT_QUANTITY = 1;

/**
 * Interfaz para material
 */
export interface Material {
  materialName?: string;
  materialCode?: string;
  availableQty?: number;
  [key: string]: unknown;
}

/**
 * Interfaz para lote
 */
export interface Lot {
  lot?: string;
  availableQty?: number;
  [key: string]: unknown;
}

/**
 * Interfaz para placa de licencia (license plate)
 */
export interface LicensePlate {
  license_plate?: string;
  licensePlate?: string;
  quantity?: number | string;
  [key: string]: unknown;
}

/**
 * Tipo para los valores a mostrar en la UI
 */
export interface DisplayValues {
  name: string;
  code: string;
  lot: string;
  licensePlate: string;
}

/**
 * Obtiene los valores a mostrar en la UI para un conjunto selección.
 */
export const getDisplayValues = (
  material: Material,
  lot: Lot | null,
  lp: LicensePlate | null
): DisplayValues => ({
  name: material.materialName || '',
  code: material.materialCode || '',
  lot: lot ? (lot.lot || '') : '',
  licensePlate: lp ? (lp.license_plate || lp.licensePlate || '') : '',
});

/**
 * Obtiene la cantidad disponible basada en la selección actual.
 */
export const getAvailableQuantity = (
  material: Material,
  lot: Lot | null,
  lp: LicensePlate | null
): number => {
  if (lp) {
    return typeof lp.quantity === 'string' ? parseFloat(lp.quantity) || 0 : (lp.quantity || 0);
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