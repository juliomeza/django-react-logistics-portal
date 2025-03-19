import { useState, useEffect, useMemo } from 'react';
import { enrichSelectedItems, createInventoryOptions } from '../utils/MaterialUtils';
import { getDisplayValues, getAvailableQuantity, validateOrderQuantity } from '../utils/materialSelectionUtils';

const DEFAULT_QUANTITY = 1;

interface DisplayValues {
  code: string;
  name: string;
  lot: string;
  licensePlate: string;
}

interface UseMaterialSelectionProps {
  formData: any;
  setFormData: (data: any) => void;
  inventories?: any[];
  materials?: any[];
}

export const useMaterialSelection = ({
  formData,
  setFormData,
  inventories = [],
  materials = [],
}: UseMaterialSelectionProps) => {
  const [selectedItems, setSelectedItems] = useState<any[]>(formData.selectedInventories || []);
  const [currentMaterialSelection, setCurrentMaterialSelection] = useState<any>(null);
  const [currentLotSelection, setCurrentLotSelection] = useState<any>(null);
  const [currentLPSelection, setCurrentLPSelection] = useState<any>(null);
  const [materialInputValue, setMaterialInputValue] = useState<string>('');

  useEffect(() => {
    if (!selectedItems.length || selectedItems.length !== (formData.selectedInventories || []).length) {
      const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, materials);
      if (enrichedItems) {
        console.log("Enriched items:", enrichedItems);
        setSelectedItems(enrichedItems);
      }
    }
  }, [formData.selectedInventories, inventories, materials, selectedItems.length]);

  const inventoryOptions = createInventoryOptions(inventories, materials);

  const projectFilteredOptions = useMemo(() => (
    formData.project 
      ? inventoryOptions.filter((option: any) => option.project === formData.project)
      : inventoryOptions
  ), [formData.project, inventoryOptions]);

  const materialOptions = useMemo(() => {
    const materialMap = new Map();
    projectFilteredOptions.forEach((option: any) => {
      if (!materialMap.has(option.material)) {
        materialMap.set(option.material, {
          id: `material-${option.material}`,
          material: option.material,
          materialCode: option.materialCode || '',
          materialName: option.materialName || '',
          availableQty: 0,
          uom: option.uom,
          project: option.project,
          inventoryItems: []
        });
      }
      const materialGroup = materialMap.get(option.material);
      materialGroup.availableQty += option.availableQty || 0;
      materialGroup.inventoryItems.push(option);
    });
    return Array.from(materialMap.values()).filter((material: any) =>
      !selectedItems.some((item: any) => item.material === material.material)
    );
  }, [projectFilteredOptions, selectedItems]);

  const lotOptions = useMemo(() => {
    if (!currentMaterialSelection) return [];
    const lotMap = new Map();
    currentMaterialSelection.inventoryItems.forEach((item: any) => {
      if (!lotMap.has(item.lot)) {
        lotMap.set(item.lot, {
          id: `lot-${currentMaterialSelection.material}-${item.lot}`,
          lot: item.lot || '',
          material: item.material,
          materialCode: item.materialCode || '',
          materialName: item.materialName || '',
          availableQty: 0,
          uom: item.uom,
          project: item.project,
          inventoryItems: []
        });
      }
      const lotGroup = lotMap.get(item.lot);
      lotGroup.availableQty += item.availableQty || 0;
      lotGroup.inventoryItems.push(item);
    });
    return Array.from(lotMap.values());
  }, [currentMaterialSelection]);

  const lpOptions = useMemo(() => {
    if (!currentLotSelection) return [];
    return currentLotSelection.inventoryItems
      .filter((item: any) => item.lot === currentLotSelection.lot)
      .map((item: any) => ({
        ...item,
        id: item.id || `lp-${item.material}-${item.lot}-${item.license_plate || item.licensePlate}`,
        licensePlate: item.license_plate || item.licensePlate,
        quantity: item.quantity || 0
      }));
  }, [currentLotSelection]);

  const resetSelections = () => {
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

  const handleAddItem = (material: any, lot: any, lp: any, quantity: number = DEFAULT_QUANTITY) => {
    if (!material) return;
    const displayValues = getDisplayValues(material, lot, lp) as DisplayValues;
    const displayedAvailableQty = getAvailableQuantity(material, lot, lp);
    const validatedOrderQty = validateOrderQuantity(quantity, displayedAvailableQty);
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
      uom: material.uom || materials.find((m: any) => m.id === material.material)?.uom || DEFAULT_QUANTITY,
      project: material.project
    };
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
    resetSelections();
  };

  const handleQuantityChange = (itemId: any, newQuantity: number) => {
    const item = selectedItems.find((item: any) => item.id === itemId);
    const validatedOrderQty = validateOrderQuantity(newQuantity, item.availableQty);
    const newSelectedItems = selectedItems.map((selectedItem: any) => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: validatedOrderQty }
        : selectedItem
    );
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems);
  };

  const handleUomChange = (itemId: any, newUomId: any) => {
    const newSelectedItems = selectedItems.map((selectedItem: any) => 
      selectedItem.id === itemId 
        ? { ...selectedItem, uom: newUomId }
        : selectedItem
    );
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems);
  };

  const handleRemoveItem = (itemId: any) => {
    const updatedItems = selectedItems.filter((item: any) => item.id !== itemId);
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
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
