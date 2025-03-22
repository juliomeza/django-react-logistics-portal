// client/src/features/orders/hooks/useMaterialSelection.ts

import { useState, useEffect, useMemo } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { 
  enrichSelectedItems
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
    console.warn('Material code is undefined, cannot find PostgreSQL material');
    return null;
  }
  
  console.log(`Finding PostgreSQL material ID for code: ${materialCode}`);
  
  // Normalizar el código para la búsqueda
  const normalizedCode = materialCode.trim();
  
  // Find the corresponding material in PostgreSQL database materials
  const material = materials.find(m => {
    const lookupCode = m.lookup_code || '';
    return lookupCode.trim() === normalizedCode;
  });
  
  if (material) {
    console.log(`Found PostgreSQL material ID: ${material.id} for code: ${materialCode}`);
    return material.id;
  } else {
    console.warn(`PostgreSQL material not found for code: ${materialCode}`);
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
  refreshMaterials?: () => Promise<void>; // Nueva prop para actualizar materiales
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
  refreshMaterials // Nuevo parámetro
}: UseMaterialSelectionProps) => {
  // Initialize selectedItems directly from formData for consistency
  const [selectedItems, setSelectedItems] = useState<any[]>(formData.selectedInventories || []);
  const [currentMaterialSelection, setCurrentMaterialSelection] = useState<MaterialGroupItem | null>(null);
  const [currentLotSelection, setCurrentLotSelection] = useState<LotGroupItem | null>(null);
  const [currentLPSelection, setCurrentLPSelection] = useState<SelectionLP | null>(null);
  const [materialInputValue, setMaterialInputValue] = useState<string>('');
  const [localMaterials, setLocalMaterials] = useState<any[]>(materials);
  const [isCreatingMaterial, setIsCreatingMaterial] = useState<boolean>(false);

  // Actualizar materiales locales cuando cambien los materiales externos
  useEffect(() => {
    if (materials && materials.length > 0) {
      setLocalMaterials(materials);
    }
  }, [materials]);

  // Function to create missing material in PostgreSQL
  const createMissingMaterial = async (
    materialCode: string,
    materialName: string
  ): Promise<number | null> => {
    console.log(`Creating missing material in PostgreSQL: ${materialCode} - ${materialName}`);
    setIsCreatingMaterial(true);
    
    try {
      // Get project ID from formData
      const projectId = formData.project;
      if (!projectId) {
        console.error("Cannot create material: No project selected");
        return null;
      }
      
      // Check if material already exists first (to avoid duplicates)
      console.log(`Checking if material ${materialCode} already exists in PostgreSQL`);
      const existingQuery = await apiProtected.get(`materials/?lookup_code=${encodeURIComponent(materialCode)}`);
      console.log('Existing materials query response:', existingQuery.data);
      
      // Check if we got any results
      if (existingQuery.data && 
          (Array.isArray(existingQuery.data) ? existingQuery.data.length > 0 : 
          (existingQuery.data.results && existingQuery.data.results.length > 0))) {
        
        const existingMaterial = Array.isArray(existingQuery.data) ? 
          existingQuery.data[0] : existingQuery.data.results[0];
        
        console.log(`Material ${materialCode} already exists in PostgreSQL with ID: ${existingMaterial.id}`);
        return existingMaterial.id;
      }
      
      // Create new material in PostgreSQL
      const newMaterial = {
        name: materialName || materialCode,
        lookup_code: materialCode,
        description: materialName || materialCode,
        project: projectId,
        status: 1, // Active status
        type: 1,   // Default type
        uom: 1,    // Default UOM
        is_serialized: false
      };
      
      console.log("Creating new material in PostgreSQL with data:", newMaterial);
      const response = await apiProtected.post('materials/', newMaterial);
      console.log("Created new material in PostgreSQL, response:", response.data);
      
      // Return the new material ID
      return response.data.id;
    } catch (error) {
      console.error("Failed to create material in PostgreSQL:", error);
      
      // Log more detalles if available
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            status?: number, 
            statusText?: string, 
            data?: any 
          } 
        };
        
        if (axiosError.response) {
          console.error("API error details:", {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data
          });
        }
      }
      
      return null;
    } finally {
      setIsCreatingMaterial(false);
    }
  };

  // UseEffect to sync with formData
  useEffect(() => {
    console.log("useMaterialSelection effect running with inventories:", inventories.length);
    console.log("formData.selectedInventories:", formData.selectedInventories);
    
    if (!selectedItems.length || selectedItems.length !== (formData.selectedInventories || []).length) {
      const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, localMaterials);
      console.log("Enriched items:", enrichedItems);
      if (enrichedItems) {
        setSelectedItems(enrichedItems);
      }
    }
  }, [formData.selectedInventories, inventories, localMaterials, selectedItems.length]);

  // Create inventory options from SQL Server data
  const inventoryOptions = useMemo(() => {
    console.log("Creating inventory options from:", inventories.length, "items");
    
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
    
    console.log("Created inventory options:", options.length);
    return options;
  }, [inventories]);

  // Filter by project
  const projectFilteredOptions = useMemo(() => {
    console.log("Filtering by project:", formData.project);
    return inventoryOptions;
    // We don't actually need to filter by project since the SQL endpoint already does this
    // return formData.project 
    //  ? inventoryOptions.filter((option) => option.project === formData.project)
    //  : inventoryOptions;
  }, [formData.project, inventoryOptions]);

  // Group by material
  const materialOptions = useMemo(() => {
    console.log("Creating material groups from:", projectFilteredOptions.length, "items");
    
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
    
    console.log(`Generated ${result.length} material options after filtering out selected items`);
    return result;
  }, [projectFilteredOptions, selectedItems]);

  // Group by lot
  const lotOptions = useMemo(() => {
    if (!currentMaterialSelection) return [];
    
    console.log("Creating lot groups for material:", currentMaterialSelection.materialName);
    
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
    console.log(`Generated ${result.length} lot options for material: ${currentMaterialSelection.materialName}`);
    return result;
  }, [currentMaterialSelection]);

  // Filter by LP
  const lpOptions = useMemo(() => {
    if (!currentLotSelection) return [];
    
    console.log("Creating LP options for lot:", currentLotSelection.lot);
    
    const result = currentLotSelection.inventoryItems
      .filter((item) => String(item.lot) === currentLotSelection.lot)
      .map((item) => ({
        ...item,
        id: item.id || `lp-${item.materialCode}-${item.lot}-${item.license_plate || item.licensePlate}`,
        licensePlate: item.license_plate || item.licensePlate,
        quantity: item.quantity || item.availableQty || 0
      }));
    
    console.log(`Generated ${result.length} license plate options for lot: ${currentLotSelection.lot}`);
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
    if (!material) {
      console.error("Cannot add item: No material selected");
      return;
    }
    
    console.log("Adding item from SQL Server:", { 
      materialCode: material.materialCode,
      name: material.materialName,
      lot: lot?.lot,
      lp: lp?.licensePlate || lp?.license_plate,
      quantity
    });
    
    try {
      // Find the corresponding material ID in PostgreSQL
      let postgreSqlMaterialId = findPostgresqlMaterialId(material.materialCode, localMaterials);
      
      // Si los materiales pueden estar desactualizados, intentar recargarlos primero
      if (!postgreSqlMaterialId && refreshMaterials) {
        console.log("Material not found in local cache, refreshing materials first");
        await refreshMaterials();
        // Comprobar nuevamente después de actualizar
        postgreSqlMaterialId = findPostgresqlMaterialId(material.materialCode, localMaterials);
      }
      
      // If material doesn't exist in PostgreSQL, create it
      if (!postgreSqlMaterialId && material.materialCode) {
        console.log("Material not found in PostgreSQL, will create it");
        
        postgreSqlMaterialId = await createMissingMaterial(
          material.materialCode,
          material.materialName || material.materialCode
        );
        
        if (postgreSqlMaterialId) {
          console.log(`Successfully created missing material with ID: ${postgreSqlMaterialId}`);
          
          // Add the new material to the materials array for future lookups
          const newMaterial = {
            id: postgreSqlMaterialId,
            name: material.materialName || material.materialCode,
            lookup_code: material.materialCode,
            description: material.materialName || material.materialCode,
            project: formData.project,
            status: 1,
            type: 1,
            uom: 1,
            is_serialized: false
          };
          
          // Actualizar nuestro array local de materiales
          setLocalMaterials(prevMaterials => [...prevMaterials, newMaterial]);
          
          // Asegurarnos que la caché global también se actualiza
          if (refreshMaterials) {
            console.log("Refreshing global materials cache after creating new material");
            await refreshMaterials();
          }
        } else {
          console.error("Failed to create missing material");
          alert(`Error: No se pudo agregar el material "${material.materialName}" a su sistema. Por favor contacte con soporte.`);
          return;
        }
      }
      
      if (!postgreSqlMaterialId) {
        console.error("No PostgreSQL material ID available, cannot proceed");
        alert(`Error: El material "${material.materialName}" no puede ser agregado a la orden. Contacte con soporte técnico.`);
        return;
      }
      
      console.log(`Using PostgreSQL material ID: ${postgreSqlMaterialId} for material: ${material.materialName}`);
      
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
        uom: material.uom || localMaterials.find((m) => m.id === postgreSqlMaterialId)?.uom || 1,
        project: material.project || formData.project
      };
      
      console.log("Saving item with PostgreSQL material ID:", newItem);
      
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
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Ocurrió un error al agregar el artículo a la orden. Por favor, inténtelo de nuevo.");
    }
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
    isCreatingMaterial, // Nueva propiedad para mostrar estado de creación
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