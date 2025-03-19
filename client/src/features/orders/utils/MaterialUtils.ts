// Utility functions for material selection and manipulation

/**
 * Interfaz para materiales
 */
export interface Material {
  id: number | string;
  name: string;
  lookup_code: string;
  [key: string]: unknown;
}

/**
 * Interfaz para elementos de inventario
 */
export interface InventoryItem {
  id: number | string;
  material: number | string;
  license_plate?: string | number;
  quantity: string | number;
  [key: string]: unknown;
}

/**
 * Interfaz para elementos de inventario seleccionados con información adicional
 */
export interface SelectedInventoryItem {
  id: number | string;
  material: number | string;
  license_plate?: string | number;
  orderQuantity?: number;
  materialName?: string;
  materialCode?: string;
  availableQty?: number;
  [key: string]: unknown;
}

/**
 * Interfaz para opciones de inventario enriquecidas
 */
export interface EnrichedInventoryOption extends InventoryItem {
  materialName: string;
  materialCode: string;
  label: string;
  availableQty: number;
}

/**
 * Enriquece los elementos seleccionados con información adicional de materiales e inventario
 * @param selectedInventories Elementos de inventario seleccionados
 * @param inventories Lista completa de inventario disponible
 * @param materials Lista de materiales
 * @returns Elementos seleccionados enriquecidos con información adicional
 */
export const enrichSelectedItems = (
  selectedInventories: SelectedInventoryItem[] | null | undefined,
  inventories: InventoryItem[] | null | undefined,
  materials: Material[] | null | undefined
): SelectedInventoryItem[] => {
  if (!selectedInventories || !inventories || !materials || inventories.length === 0 || materials.length === 0) {
    return selectedInventories || [];
  }
  
  return selectedInventories.map((item: SelectedInventoryItem) => {
    const material = materials.find((m) => m.id === item.material);
    
    // Buscar primero en el inventario por coincidencia exacta en material y license_plate
    let inventoryItem: InventoryItem | undefined = undefined;
    if (item.license_plate) {
      inventoryItem = inventories.find(
        (inv) => 
          inv.material === item.material && 
          inv.license_plate === item.license_plate
      );
    }
    
    // Si no hay match con license_plate, buscar todos los items con el mismo material
    if (!inventoryItem) {
      const matchingInventories = inventories.filter(
        (inv) => inv.material === item.material
      );
      
      if (matchingInventories.length > 0) {
        // Ordena por cantidad para obtener el item con mayor cantidad disponible
        matchingInventories.sort((a, b) => 
          parseFloat(String(b.quantity)) - parseFloat(String(a.quantity))
        );
        inventoryItem = matchingInventories[0];
      }
    }
    
    return {
      ...item,
      materialName: material ? material.name : 'Unknown Material',
      materialCode: material ? material.lookup_code : '',
      availableQty: inventoryItem ? parseFloat(String(inventoryItem.quantity)) : 0
    };
  });
};

/**
 * Crea opciones de inventario para su uso en componentes de selección
 * @param inventories Lista de elementos de inventario
 * @param materials Lista de materiales
 * @returns Opciones de inventario enriquecidas para componentes de selección
 */
export const createInventoryOptions = (
  inventories: InventoryItem[] | null | undefined,
  materials: Material[] | null | undefined
): EnrichedInventoryOption[] => {
  if (!inventories || !materials) {
    return [];
  }

  return inventories.map((item) => {
    const material = materials.find((m) => m.id === item.material);
    const materialName = material ? material.name : 'Unknown Material';
    const materialCode = material ? material.lookup_code : '';
    
    return {
      ...item,
      materialName,
      materialCode,
      label: `${materialCode} - ${materialName}`,
      availableQty: parseFloat(String(item.quantity))
    };
  });
};

/**
 * Valida una cantidad para asegurar que está dentro de los límites permitidos
 * @param item Elemento de inventario con cantidad disponible
 * @param newQuantity Cantidad deseada para validar
 * @returns Cantidad validada dentro de los límites permitidos
 */
export const validateQuantity = (
  item: SelectedInventoryItem | null | undefined, 
  newQuantity: number
): number => {
  if (!item) {
    return Math.max(1, newQuantity);
  }

  // Solo se aplica la validación máxima si availableQty es un número positivo válido
  if (typeof item.availableQty === 'number' && !isNaN(item.availableQty) && item.availableQty > 0) {
    return Math.min(Math.max(1, newQuantity), item.availableQty);
  } else {
    // Si no hay un máximo válido, asegurar que el mínimo sea 1
    return Math.max(1, newQuantity);
  }
};

/**
 * Formatea un valor como una cadena con dos decimales
 * @param value Valor a formatear
 * @returns Cadena formateada con dos decimales
 */
export const formatQuantity = (value: number | string | undefined | null): string => {
  if (value === null || value === undefined) return '0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return (typeof numValue === 'number' && !isNaN(numValue))
    ? numValue.toFixed(2)
    : '0.00';
};