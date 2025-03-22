// client/src/features/orders/hooks/useMaterialSelection.ts

import { useState, useEffect, useMemo } from 'react';
import apiProtected from '../../../services/api/secureApi';
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

// Function to find PostgreSQL material ID from material code
const findPostgresqlMaterialId = (
  materialCode: string | undefined,
  materials: any[]
): number | null => {
  if (!materialCode) {
    return null;
  }
  
  // Find the corresponding material in PostgreSQL database materials
  const material = materials.find(m => m.lookup_code === materialCode);
  
  if (material) {
    return material.id;
  } else {
    return null;
  }
};

// Interfaces for data
interface FormData {
  selectedInventories?: any[];
  project?: number;
  [key: string]: unknown; // For other form properties
}

// Interfaces for the hook
interface UseMaterialSelectionProps {
  formData: FormData;
  setFormData: (data: FormData | any[]) => void;
  inventories?: any[];
  materials?: any[];
}

// Extended interface for use in the hook
interface MaterialGroupItem extends SelectionMaterial {
  id: string;
  material: number | string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: any[];
}

// Extended interface for use in the hook
interface LotGroupItem extends SelectionLot {
  id: string;
  material: number | string;
  availableQty: number;
  uom?: number;
  project?: number;
  inventoryItems: any[];
}

export const useMaterialSelection = ({
  formData,
  setFormData,
  inventories = [],
  materials = [],
}: UseMaterialSelectionProps) => {
  // Initialize selectedItems directly from formData for consistency
  const [selectedItems, setSelectedItems] = useState<any[]>(formData.selectedInventories || []);
  const [currentMaterialSelection, setCurrentMaterialSelection] = useState<MaterialGroupItem | null>(null);
  const [currentLotSelection, setCurrentLotSelection] = useState<LotGroupItem | null>(null);
  const [currentLPSelection, setCurrentLPSelection] = useState<SelectionLP | null>(null);
  const [materialInputValue, setMaterialInputValue] = useState<string>('');

  // Function to create missing material in PostgreSQL
  const createMissingMaterial = async (
    materialCode: string,
    materialName: string
  ): Promise<number | null> => {
    try {
      // Get project ID from formData
      const projectId = formData.project;
      if (!projectId) {
        return null;
      }
      
      // Create new material in PostgreSQL
      const newMaterial = {
        name: materialName,
        lookup_code: materialCode,
        description: materialName,
        project: projectId,
        status: 1, // Active status
        type: 1,   // Default type
        uom: 1,    // Default UOM
        is_serialized: false
      };
      
      const response = await apiProtected.post('materials/', newMaterial);
      
      // Return the new material ID
      return response.data.id;
    } catch (error) {
      return null;
    }
  };

  // UseEffect to sync with formData
  useEffect(() => {
    if (!selectedItems.length || selectedItems.length !== (formData.selectedInventories || []).length) {
      const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, materials);
      if (enrichedItems) {
        setSelectedItems(enrichedItems);
      }
    }
  }, [formData.selectedInventories, inventories, materials, selectedItems.length]);

  // Create inventory options from SQL Server data
  const inventoryOptions = useMemo(() => {
    // If using SQL Server data directly, transform it to expected format
    const options = inventories.map(item => {
      return {
        id: item.id,
        material: item.material,
        materialCode: item.materialCode || '',
        materialName: item.materialName || '',
        lot: item.lot || '',
        license_plate: item.license_plate || '',
        licensePlate: item.license_plate || '', // Ensure both formats exist
        availableQty: item.quantity || item.availableQty || 0,
        quantity: item.quantity || item.availableQty || 0,
        uom: item.uom,
        project: item.project || 1,
        warehouse: item.warehouse,
        label: `${item.materialCode || ''} - ${item.materialName || ''}`
      };
    });
    
    return options;
  }, [inventories]);

  // Filter by project
  const projectFilteredOptions = useMemo(() => {
    return inventoryOptions;
    // We don't actually need to filter by project since the SQL endpoint already does this
    // return formData.project 
    //  ? inventoryOptions.filter((option) => option.project === formData.project)
    //  : inventoryOptions;
  }, [formData.project, inventoryOptions]);

  // Group by material
  const materialOptions = useMemo(() => {
    const materialMap = new Map<string | number, MaterialGroupItem>();
    
    projectFilteredOptions.forEach((option) => {
      const materialKey = option.materialCode || option.material;
      
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
    
    const result = Array.from(materialMap.values()).filter((material) =>
      !selectedItems.some((item) => String(item.materialCode) === String(material.materialCode))
    );
    
    return result;
  }, [projectFilteredOptions, selectedItems]);

  // Group by lot
  const lotOptions = useMemo(() => {
    if (!currentMaterialSelection) return [];
    
    const lotMap = new Map<string, LotGroupItem>();
    
    currentMaterialSelection.inventoryItems.forEach((item) => {
      const lotKey = String(item.lot || '');
      
      if (!lotMap.has(lotKey)) {
        lotMap.set(lotKey, {
          id: `lot-${currentMaterialSelection.materialCode}-${lotKey}`,
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
    
    const result = Array.from(lotMap.values());
    return result;
  }, [currentMaterialSelection]);

  // Filter by LP
  const lpOptions = useMemo(() => {
    if (!currentLotSelection) return [];
    
    const result = currentLotSelection.inventoryItems
      .filter((item) => String(item.lot) === currentLotSelection.lot)
      .map((item) => ({
        ...item,
        id: item.id || `lp-${item.materialCode}-${item.lot}-${item.license_plate || item.licensePlate}`,
        licensePlate: item.license_plate || item.licensePlate,
        quantity: item.quantity || item.availableQty || 0
      }));
    
    return result;
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

  // Modified handleAddItem to find the corresponding PostgreSQL material ID
  // and create it if it doesn't exist
  const handleAddItem = async (
    material: MaterialGroupItem, 
    lot: LotGroupItem | null, 
    lp: SelectionLP | null, 
    quantity: number = DEFAULT_QUANTITY
  ): Promise<void> => {
    if (!material) return;
    
    // Find the corresponding material ID in PostgreSQL
    let postgreSqlMaterialId = findPostgresqlMaterialId(material.materialCode, materials);
    
    // If material doesn't exist in PostgreSQL, create it
    if (!postgreSqlMaterialId && material.materialCode) {
      postgreSqlMaterialId = await createMissingMaterial(
        material.materialCode,
        material.materialName || material.materialCode
      );
      
      if (postgreSqlMaterialId) {
        // Add the new material to the materials array for future lookups
        materials.push({
          id: postgreSqlMaterialId,
          name: material.materialName,
          lookup_code: material.materialCode,
          description: material.materialName,
          project: formData.project,
          status: 1,
          type: 1,
          uom: 1,
          is_serialized: false
        });
      } else {
        alert(`Error: Could not add material "${material.materialName}" to your system database. Please contact support.`);
        return;
      }
    }
    
    if (!postgreSqlMaterialId) {
      alert(`Error: Material "${material.materialName}" cannot be added to order. Please contact support.`);
      return;
    }
    
    const displayValues = getDisplayValues(material, lot, lp);
    const displayedAvailableQty = getAvailableQuantity(material, lot, lp);
    const validatedOrderQty = validateOrderQuantity(quantity, displayedAvailableQty);
    
    // Create new item with the PostgreSQL material ID
    const newItem = {
      id: lp ? lp.id : (lot ? lot.id : material.id),
      material: postgreSqlMaterialId, // Use PostgreSQL material ID
      materialCode: displayValues.code,
      materialName: displayValues.name,
      lot: displayValues.lot,
      license_plate: displayValues.licensePlate,
      licensePlate: displayValues.licensePlate,
      availableQty: displayedAvailableQty,
      orderQuantity: validatedOrderQty,
      uom: material.uom || materials.find((m) => m.id === postgreSqlMaterialId)?.uom || DEFAULT_QUANTITY,
      project: material.project
    };
    
    // Update local state
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    
    // Update formData
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
    
    // Reset selections after adding
    setTimeout(() => {
      resetSelections();
    }, 50);
  };
  
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

  const handleUomChange = (itemId: string | number, newUomId: number | string): void => {
    const newSelectedItems = selectedItems.map((selectedItem) => 
      selectedItem.id === itemId 
        ? { ...selectedItem, uom: newUomId }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    
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

  const handleRemoveItem = (itemId: string | number): void => {
    const updatedItems = selectedItems.filter((item) => item.id !== itemId);
    
    setSelectedItems(updatedItems);
    
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