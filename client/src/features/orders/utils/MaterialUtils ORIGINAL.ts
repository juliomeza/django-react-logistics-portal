// Utility functions for material selection and manipulation

export const enrichSelectedItems = (
  selectedInventories: any[],
  inventories: any[],
  materials: any[]
): any[] => {
  if (!selectedInventories || inventories.length === 0 || materials.length === 0) {
    return selectedInventories || [];
  }
  
  return selectedInventories.map((item: any) => {
    const material = materials.find((m: any) => m.id === item.material);
    
    // Buscar primero en el inventario por coincidencia exacta en material y license_plate
    let inventoryItem: any = null;
    if (item.license_plate) {
      inventoryItem = inventories.find(
        (inv: any) =>
          inv.material === item.material && 
          inv.license_plate === item.license_plate
      );
    }
    
    // Si no hay match con license_plate, buscar todos los items con el mismo material
    if (!inventoryItem) {
      const matchingInventories = inventories.filter(
        (inv: any) => inv.material === item.material
      );
      
      if (matchingInventories.length > 0) {
        // Ordena por cantidad para obtener el item con mayor cantidad disponible
        matchingInventories.sort((a: any, b: any) => 
          parseFloat(b.quantity) - parseFloat(a.quantity)
        );
        inventoryItem = matchingInventories[0];
      }
    }
    
    return {
      ...item,
      materialName: material ? material.name : 'Unknown Material',
      materialCode: material ? material.lookup_code : '',
      availableQty: inventoryItem ? parseFloat(inventoryItem.quantity) : 0
    };
  });
};

export const createInventoryOptions = (
  inventories: any[],
  materials: any[]
): any[] => {
  return inventories.map((item: any) => {
    const material = materials.find((m: any) => m.id === item.material);
    const materialName = material ? material.name : 'Unknown Material';
    const materialCode = material ? material.lookup_code : '';
    
    return {
      ...item,
      materialName,
      materialCode,
      label: `${materialCode} - ${materialName}`,
      availableQty: parseFloat(item.quantity)
    };
  });
};

export const validateQuantity = (item: any, newQuantity: number): number => {
  // Solo se aplica la validación máxima si availableQty es un número positivo válido
  if (typeof item.availableQty === 'number' && !isNaN(item.availableQty) && item.availableQty > 0) {
    return Math.min(Math.max(1, newQuantity), item.availableQty);
  } else {
    // Si no hay un máximo válido, asegurar que el mínimo sea 1
    return Math.max(1, newQuantity);
  }
};

export const formatQuantity = (value: any): string => {
  return (typeof value === 'number' && !isNaN(value))
    ? value.toFixed(2)
    : '0.00';
};
