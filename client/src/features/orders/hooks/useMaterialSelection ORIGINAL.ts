import { useState, useEffect, useMemo } from 'react';
import { 
  enrichSelectedItems, 
  createInventoryOptions, 
  EnrichedInventoryOption,
  Material as UtilMaterial 
} from '../utils/MaterialUtils';
import { 
  getDisplayValues, 
  getAvailableQuantity, 
  validateOrderQuantity,
  Material as SelectionMaterial,
  Lot as SelectionLot,
  LicensePlate as SelectionLP,
  DEFAULT_QUANTITY
} from '../utils/materialSelectionUtils';

// Eliminamos la interfaz SelectedItem ya que no la estamos utilizando
// y estamos usando any[] para selectedItems para mantener compatibilidad

// Interfaces para los datos - Mantener compatibilidad con la versión original
interface FormData {
  selectedInventories?: any[];
  project?: number;
  [key: string]: unknown; // Para otras propiedades del formulario
}

// Interfaces para los datos
interface UseMaterialSelectionProps {
  formData: FormData;
  setFormData: (data: FormData | any[]) => void;
  inventories?: EnrichedInventoryOption[];
  materials?: UtilMaterial[];
}

// Interfaz extendida para uso interno en el hook
interface MaterialGroupItem extends SelectionMaterial {
  id: string;
  material: number | string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: EnrichedInventoryOption[];
}

// Interfaz extendida para uso interno en el hook
interface LotGroupItem extends SelectionLot {
  id: string;
  material: number | string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: EnrichedInventoryOption[];
}

export const useMaterialSelection = ({
  formData,
  setFormData,
  inventories = [],
  materials = [],
}: UseMaterialSelectionProps) => {
  // Inicializar selectedItems directamente desde formData para mantener consistencia
  const [selectedItems, setSelectedItems] = useState<any[]>(formData.selectedInventories || []);
  const [currentMaterialSelection, setCurrentMaterialSelection] = useState<MaterialGroupItem | null>(null);
  const [currentLotSelection, setCurrentLotSelection] = useState<LotGroupItem | null>(null);
  const [currentLPSelection, setCurrentLPSelection] = useState<SelectionLP | null>(null);
  const [materialInputValue, setMaterialInputValue] = useState<string>('');

  // UseEffect similar al original pero con tipado mejorado
  useEffect(() => {
    if (!selectedItems.length || selectedItems.length !== (formData.selectedInventories || []).length) {
      const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, materials);
      if (enrichedItems) {
        // Mantener el console.log como en el original para debugging
        console.log("Enriched items:", enrichedItems);
        setSelectedItems(enrichedItems);
      }
    }
  }, [formData.selectedInventories, inventories, materials, selectedItems.length]);

  const inventoryOptions = useMemo(() => 
    createInventoryOptions(inventories as any, materials as any),
    [inventories, materials]
  );

  // ... resto del código sin cambios ...
  const projectFilteredOptions = useMemo(() => (
    formData.project 
      ? inventoryOptions.filter((option) => option.project === formData.project)
      : inventoryOptions
  ), [formData.project, inventoryOptions]);

  const materialOptions = useMemo(() => {
    // ... código existente ...
    const materialMap = new Map<string | number, MaterialGroupItem>();
    
    projectFilteredOptions.forEach((option) => {
      const materialKey = option.material;
      
      if (!materialMap.has(materialKey)) {
        materialMap.set(materialKey, {
          id: `material-${materialKey}`,
          material: materialKey,
          materialCode: option.materialCode || '',
          materialName: option.materialName || '',
          availableQty: 0,
          uom: option.uom as number | undefined,
          project: option.project as number | undefined,
          inventoryItems: []
        });
      }
      
      const materialGroup = materialMap.get(materialKey)!;
      materialGroup.availableQty += option.availableQty || 0;
      materialGroup.inventoryItems.push(option);
    });
    
    return Array.from(materialMap.values()).filter((material) =>
      !selectedItems.some((item) => String(item.material) === String(material.material))
    );
  }, [projectFilteredOptions, selectedItems]);

  const lotOptions = useMemo(() => {
    if (!currentMaterialSelection) return [];
    
    const lotMap = new Map<string, LotGroupItem>();
    
    currentMaterialSelection.inventoryItems.forEach((item) => {
      const lotKey = String(item.lot || '');
      
      if (!lotMap.has(lotKey)) {
        lotMap.set(lotKey, {
          id: `lot-${currentMaterialSelection.material}-${lotKey}`,
          lot: lotKey,
          material: item.material,
          materialCode: item.materialCode || '',
          materialName: item.materialName || '',
          availableQty: 0,
          uom: item.uom as number | undefined,
          project: item.project as number | undefined,
          inventoryItems: []
        });
      }
      
      const lotGroup = lotMap.get(lotKey)!;
      lotGroup.availableQty += item.availableQty || 0;
      lotGroup.inventoryItems.push(item);
    });
    
    return Array.from(lotMap.values());
  }, [currentMaterialSelection]);

  const lpOptions = useMemo(() => {
    if (!currentLotSelection) return [];
    
    return currentLotSelection.inventoryItems
      .filter((item) => String(item.lot) === currentLotSelection.lot)
      .map((item) => ({
        ...item,
        id: item.id || `lp-${item.material}-${item.lot}-${item.license_plate || item.licensePlate}`,
        licensePlate: item.license_plate || item.licensePlate,
        quantity: item.quantity || 0
      }));
  }, [currentLotSelection]);

  const resetSelections = (): void => {
    setTimeout(() => {
      setCurrentMaterialSelection(null);
      setCurrentLotSelection(null);
      setCurrentLPSelection(null);
      setMaterialInputValue('');
      const quantityInput = document.getElementById('order-quantity-input') as HTMLInputElement | null;
      if (quantityInput) {
        quantityInput.value = DEFAULT_QUANTITY.toString();
      }
    }, 0);
  };

  // Versión corregida de handleAddItem basada en el original pero con tipado mejorado
  const handleAddItem = (
    material: MaterialGroupItem, 
    lot: LotGroupItem | null, 
    lp: SelectionLP | null, 
    quantity: number = DEFAULT_QUANTITY
  ): void => {
    if (!material) return;
    
    const displayValues = getDisplayValues(material, lot, lp);
    const displayedAvailableQty = getAvailableQuantity(material, lot, lp);
    const validatedOrderQty = validateOrderQuantity(quantity, displayedAvailableQty);
    
    // Construimos el nuevo item como en la versión original pero con tipado seguro
    const newItem = {
      id: lp ? lp.id : (lot ? lot.id : material.id),
      material: material.material,
      materialCode: displayValues.code,
      materialName: displayValues.name,
      lot: displayValues.lot,
      license_plate: displayValues.licensePlate,
      licensePlate: displayValues.licensePlate,
      availableQty: displayedAvailableQty,
      orderQuantity: validatedOrderQty,
      uom: material.uom || materials.find((m) => m.id === material.material)?.uom || DEFAULT_QUANTITY,
      project: material.project
    };
    
    // Actualizamos el estado local
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    
    // Usamos la lógica original para detectar cómo actualizar formData
    const isDirectUpdate = typeof setFormData === 'function' && 
                          (!formData.hasOwnProperty('selectedInventories') || 
                           Array.isArray(formData.selectedInventories));

    if (isDirectUpdate) {
      // Pasamos directamente el array (como en la versión original)
      setFormData(updatedItems);
    } else {
      // Pasamos el objeto con la propiedad actualizando el formData completo
      setFormData({
        ...formData,
        selectedInventories: updatedItems
      });
    }
    
    // Añadimos un pequeño retraso para asegurar que la actualización se procese antes de resetear
    setTimeout(() => {
      resetSelections();
    }, 50);
  };
  
  // Versión restaurada de handleQuantityChange con la lógica original
  const handleQuantityChange = (itemId: string | number, newQuantity: number): void => {
    const item = selectedItems.find((item) => item.id === itemId);
    if (!item) return;
    
    const validatedOrderQty = validateOrderQuantity(newQuantity, item.availableQty || 0);
    
    const newSelectedItems = selectedItems.map((selectedItem) => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: validatedOrderQty }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    
    // Usamos la lógica original
    const isDirectUpdate = typeof setFormData === 'function' && 
                          (!formData.hasOwnProperty('selectedInventories') || 
                           Array.isArray(formData.selectedInventories));

    if (isDirectUpdate) {
      setFormData(newSelectedItems);
    } else {
      setFormData({
        ...formData,
        selectedInventories: newSelectedItems
      });
    }
  };

  // Versión restaurada de handleUomChange con la lógica original
  const handleUomChange = (itemId: string | number, newUomId: number | string): void => {
    const newSelectedItems = selectedItems.map((selectedItem) => 
      selectedItem.id === itemId 
        ? { ...selectedItem, uom: newUomId }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    
    // Usamos la lógica original
    const isDirectUpdate = typeof setFormData === 'function' && 
                          (!formData.hasOwnProperty('selectedInventories') || 
                           Array.isArray(formData.selectedInventories));

    if (isDirectUpdate) {
      setFormData(newSelectedItems);
    } else {
      setFormData({
        ...formData,
        selectedInventories: newSelectedItems
      });
    }
  };

  // Versión restaurada de handleRemoveItem con la lógica original
  const handleRemoveItem = (itemId: string | number): void => {
    const updatedItems = selectedItems.filter((item) => item.id !== itemId);
    
    setSelectedItems(updatedItems);
    
    // Usamos la lógica original
    const isDirectUpdate = typeof setFormData === 'function' && 
                          (!formData.hasOwnProperty('selectedInventories') || 
                           Array.isArray(formData.selectedInventories));

    if (isDirectUpdate) {
      setFormData(updatedItems);
    } else {
      setFormData({
        ...formData,
        selectedInventories: updatedItems
      });
    }
  };

  const isProjectSelected = Boolean(formData.project);

  return {
    selectedItems,
    materialOptions,
    lotOptions,
    lpOptions,
    currentMaterialSelection,
    currentLotSelection,
    currentLPSelection,
    materialInputValue,
    isProjectSelected,
    setCurrentMaterialSelection,
    setCurrentLotSelection,
    setCurrentLPSelection,
    setMaterialInputValue,
    handleAddItem,
    handleQuantityChange,
    handleUomChange,
    handleRemoveItem,
  };
};

export default useMaterialSelection;