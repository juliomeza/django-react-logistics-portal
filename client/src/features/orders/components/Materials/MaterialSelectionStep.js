import React, { useState, useEffect, useMemo } from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';
import MaterialTable from './MaterialTable';
import { enrichSelectedItems, createInventoryOptions, validateQuantity } from '../../utils/MaterialUtils';

const MaterialSelectionStep = ({ 
  formData, 
  setFormData, 
  inventories = [], 
  materials = [],
  loading = false,
  materialUoms = {}
}) => {
  const [selectedItems, setSelectedItems] = useState(formData.selectedInventories || []);
  
  // State for cascade selection (material > lot > license plate)
  const [currentMaterialSelection, setCurrentMaterialSelection] = useState(null);
  const [currentLotSelection, setCurrentLotSelection] = useState(null);
  const [currentLPSelection, setCurrentLPSelection] = useState(null);
  const [materialInputValue, setMaterialInputValue] = useState('');

  // Sync selectedItems with formData.selectedInventories and enrich with available quantities
  useEffect(() => {
    const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, materials);
    
    if (enrichedItems) {
      console.log("Enriched items:", enrichedItems);
      setSelectedItems(enrichedItems);
    }
  }, [formData.selectedInventories, inventories, materials]);

  // Create inventory options for autocomplete
  const inventoryOptions = createInventoryOptions(inventories, materials);

  // Filter inventory options by current selected project
  const projectFilteredOptions = formData.project 
    ? inventoryOptions.filter(option => option.project === formData.project) 
    : inventoryOptions;

  // Group materials and aggregate quantities for first level of cascade
  const materialOptions = useMemo(() => {
    // Create a map to group by material ID
    const materialMap = new Map();
    
    projectFilteredOptions.forEach(option => {
      if (!materialMap.has(option.material)) {
        // Initialize a new material group
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
      
      // Add to the total available quantity for this material
      const materialGroup = materialMap.get(option.material);
      materialGroup.availableQty += option.availableQty || 0;
      materialGroup.inventoryItems.push(option);
    });
    
    // Convert map to array and filter out materials that are already selected
    return Array.from(materialMap.values()).filter(material => 
      !selectedItems.some(item => item.material === material.material)
    );
  }, [projectFilteredOptions, selectedItems]);

  // Get lot options based on selected material for second level of cascade
  const lotOptions = useMemo(() => {
    if (!currentMaterialSelection) return [];
    
    // Create a map to group by lot
    const lotMap = new Map();
    
    currentMaterialSelection.inventoryItems.forEach(item => {
      if (!lotMap.has(item.lot)) {
        // Initialize a new lot group
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
      
      // Add to the total available quantity for this lot
      const lotGroup = lotMap.get(item.lot);
      lotGroup.availableQty += item.availableQty || 0;
      lotGroup.inventoryItems.push(item);
    });
    
    return Array.from(lotMap.values());
  }, [currentMaterialSelection]);

  // Get LP options based on selected material and lot for third level of cascade
  const lpOptions = useMemo(() => {
    if (!currentLotSelection) return [];
    
    // Filter inventory items for the selected lot
    // Make sure we're using the license_plate field correctly
    return currentLotSelection.inventoryItems
      .filter(item => item.lot === currentLotSelection.lot)
      .map(item => ({
        ...item,
        id: item.id || `lp-${item.material}-${item.lot}-${item.license_plate || item.licensePlate}`,
        // Use license_plate if available, otherwise use licensePlate
        licensePlate: item.license_plate || item.licensePlate,
        // Ensure quantity is available
        quantity: item.quantity || 0
      }));
  }, [currentLotSelection]);

  // Handle adding a new item based on cascade selection
  const handleAddItem = (material, lot, lp, quantity = 1) => {
    if (!material) return;
    
    let itemToAdd;
    
    if (lp) {
      // If LP is selected, use that specific inventory item
      itemToAdd = {
        id: lp.id,
        material: lp.material,
        materialCode: lp.materialCode,
        materialName: lp.materialName,
        lot: lp.lot,
        license_plate: lp.license_plate || lp.licensePlate,
        licensePlate: lp.license_plate || lp.licensePlate, // For compatibility
        availableQty: lp.quantity || 0, // Use quantity as the available qty for LP
        uom: lp.uom,
        project: lp.project
      };
    } else if (lot) {
      // If only lot is selected, create an aggregated item for that lot
      itemToAdd = {
        id: lot.id,
        material: lot.material,
        materialCode: lot.materialCode,
        materialName: lot.materialName,
        lot: lot.lot,
        availableQty: lot.availableQty,
        uom: lot.uom,
        project: lot.project
      };
    } else {
      // If only material is selected, create an aggregated item for that material
      itemToAdd = {
        id: material.id,
        material: material.material,
        materialCode: material.materialCode,
        materialName: material.materialName,
        availableQty: material.availableQty,
        uom: material.uom,
        project: material.project
      };
    }
    
    // Add new item with the specified quantity
    const newItem = { 
      ...itemToAdd, 
      orderQuantity: quantity,
      uom: itemToAdd.uom || materials.find(m => m.id === itemToAdd.material)?.uom || 1
    };
    
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    
    // CAMBIO: Volver a la forma original para ser compatible con el componente padre
    setFormData(updatedItems);
    
    // Reset selections after adding
    setCurrentMaterialSelection(null);
    setCurrentLotSelection(null);
    setCurrentLPSelection(null);
    setMaterialInputValue('');
  };

  // Handle removing an item
  const handleRemoveItem = (itemId) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    // CAMBIO: Volver a la forma original
    setFormData(updatedItems);
  };

  // Handle quantity change for selected items
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = selectedItems.find(item => item.id === itemId);
    const quantity = validateQuantity(item, newQuantity);

    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: quantity }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    // CAMBIO: Volver a la forma original
    setFormData(newSelectedItems);
  };

  // Handle UOM change for selected items
  const handleUomChange = (itemId, newUomId) => {
    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, uom: newUomId }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    // CAMBIO: Volver a la forma original
    setFormData(newSelectedItems);
  };

  // Determine if project is selected
  const isProjectSelected = !!formData.project;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Select Materials
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!isProjectSelected && (
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              Please select a project in the Logistics Information section first.
            </Typography>
          )}

          {/* MaterialTable with cascade selection */}
          <MaterialTable 
            selectedItems={selectedItems}
            materials={materials}
            handleQuantityChange={handleQuantityChange}
            handleUomChange={handleUomChange}
            handleRemoveItem={handleRemoveItem}
            availableOptions={materialOptions}
            materialOptions={materialOptions}
            lotOptions={lotOptions}
            lpOptions={lpOptions}
            currentMaterialSelection={currentMaterialSelection}
            currentLotSelection={currentLotSelection}
            currentLPSelection={currentLPSelection}
            setCurrentMaterialSelection={setCurrentMaterialSelection}
            setCurrentLotSelection={setCurrentLotSelection}
            setCurrentLPSelection={setCurrentLPSelection}
            inputValue={materialInputValue}
            setInputValue={setMaterialInputValue}
            handleAddItem={handleAddItem}
            materialUoms={materialUoms}
            isProjectSelected={isProjectSelected}
          />
          
          {/* Selected items count */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              {selectedItems.length} items selected
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MaterialSelectionStep;