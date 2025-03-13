import React, { useState, useEffect, useMemo } from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';
import MaterialTable from './MaterialTable';
import { enrichSelectedItems, createInventoryOptions } from '../../utils/MaterialUtils';
// Eliminamos la importación de validateQuantity que no se usa

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

  // Modificado: Prevenir que enrichSelectedItems cambie la cantidad disponible
  useEffect(() => {
    // Solo actualizamos si no hay selecciones previas o si la longitud es diferente
    if (!selectedItems.length || 
        selectedItems.length !== (formData.selectedInventories || []).length) {
      const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, materials);
      
      if (enrichedItems) {
        console.log("Enriched items:", enrichedItems);
        setSelectedItems(enrichedItems);
      }
    }
  }, [formData.selectedInventories, inventories, materials, selectedItems.length]); // Añadimos selectedItems.length a las dependencias

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
    
    // Determinar qué valores mostrar en la UI
    const displayName = material.materialName || '';
    const displayCode = material.materialCode || '';
    const displayLot = lot ? (lot.lot || '') : '';
    const displayLP = lp ? (lp.license_plate || lp.licensePlate || '') : '';
    
    // Usar la misma lógica que getCurrentAvailableQty en MaterialTable.js
    let displayedAvailableQty;
    if (lp) {
      // Convertir explícitamente a número con parseFloat para LP
      displayedAvailableQty = lp.quantity ? parseFloat(lp.quantity) : 0;
    } else if (lot) {
      displayedAvailableQty = lot.availableQty || 0;
    } else {
      displayedAvailableQty = material.availableQty || 0;
    }
    
    // Validar la cantidad de orden (sin modificar la cantidad disponible)
    const validatedOrderQty = Math.min(Math.max(1, quantity), displayedAvailableQty);
    
    // Crear el nuevo item preservando exactamente la cantidad disponible mostrada
    const newItem = {
      id: lp ? lp.id : (lot ? lot.id : material.id),
      material: material.material,
      materialCode: displayCode,
      materialName: displayName,
      lot: displayLot,
      license_plate: displayLP,
      licensePlate: displayLP, 
      availableQty: displayedAvailableQty, // Cantidad disponible convertida a número
      orderQuantity: validatedOrderQty,
      uom: material.uom || materials.find(m => m.id === material.material)?.uom || 1,
      project: material.project
    };
    
    // Actualizar la lista de items seleccionados y el formulario
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
    
    // Reset selections after adding
    setTimeout(() => {
      setCurrentMaterialSelection(null);
      setCurrentLotSelection(null);
      setCurrentLPSelection(null);
      setMaterialInputValue('');
      
      // Reset quantity input
      const quantityInput = document.getElementById('order-quantity-input');
      if (quantityInput) {
        quantityInput.value = "1";
      }
    }, 0);
  };

  // Handle quantity change for selected items
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = selectedItems.find(item => item.id === itemId);
    
    // Validar la cantidad de orden (sin modificar la cantidad disponible)
    const validatedOrderQty = Math.min(Math.max(1, newQuantity), item.availableQty);

    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: validatedOrderQty }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
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
    setFormData(newSelectedItems);
  };

  // Handle removing an item
  const handleRemoveItem = (itemId) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
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