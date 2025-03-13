import { useState, useEffect, useMemo } from 'react';
import { enrichSelectedItems, createInventoryOptions } from '../utils/MaterialUtils';
import { 
  getDisplayValues, 
  getAvailableQuantity, 
  validateOrderQuantity 
} from '../utils/materialSelectionUtils';

// Constante para valor predeterminado
const DEFAULT_QUANTITY = 1;

export const useMaterialSelection = ({
  formData,
  setFormData,
  inventories = [],
  materials = []
}) => {
  // Estado para los elementos seleccionados
  const [selectedItems, setSelectedItems] = useState(formData.selectedInventories || []);
  
  // Estado para selección en cascada (material > lote > license plate)
  const [currentMaterialSelection, setCurrentMaterialSelection] = useState(null);
  const [currentLotSelection, setCurrentLotSelection] = useState(null);
  const [currentLPSelection, setCurrentLPSelection] = useState(null);
  const [materialInputValue, setMaterialInputValue] = useState('');

  // Sincronizar datos del formulario con estado local cuando cambian
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
  }, [formData.selectedInventories, inventories, materials, selectedItems.length]);

  // Crear opciones de inventario para autocomplete
  const inventoryOptions = createInventoryOptions(inventories, materials);

  // Filtrar opciones por el proyecto seleccionado
  const projectFilteredOptions = useMemo(() => (
    formData.project 
      ? inventoryOptions.filter(option => option.project === formData.project) 
      : inventoryOptions
  ), [formData.project, inventoryOptions]);

  // Agrupar materiales y agregar cantidades para el primer nivel de cascada
  const materialOptions = useMemo(() => {
    // Crear un mapa para agrupar por ID de material
    const materialMap = new Map();
    
    // Agregar cada opción al grupo correspondiente
    projectFilteredOptions.forEach(option => {
      if (!materialMap.has(option.material)) {
        // Inicializar un nuevo grupo de material
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
      
      // Sumar a la cantidad disponible total para este material
      const materialGroup = materialMap.get(option.material);
      materialGroup.availableQty += option.availableQty || 0;
      materialGroup.inventoryItems.push(option);
    });
    
    // Convertir mapa a array y filtrar materiales ya seleccionados
    return Array.from(materialMap.values()).filter(material => 
      !selectedItems.some(item => item.material === material.material)
    );
  }, [projectFilteredOptions, selectedItems]);

  // Obtener opciones de lote basadas en el material seleccionado
  const lotOptions = useMemo(() => {
    if (!currentMaterialSelection) return [];
    
    // Crear un mapa para agrupar por lote
    const lotMap = new Map();
    
    currentMaterialSelection.inventoryItems.forEach(item => {
      if (!lotMap.has(item.lot)) {
        // Inicializar un nuevo grupo de lote
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
      
      // Sumar a la cantidad disponible total para este lote
      const lotGroup = lotMap.get(item.lot);
      lotGroup.availableQty += item.availableQty || 0;
      lotGroup.inventoryItems.push(item);
    });
    
    return Array.from(lotMap.values());
  }, [currentMaterialSelection]);

  // Obtener opciones de LP basadas en el material y lote seleccionados
  const lpOptions = useMemo(() => {
    if (!currentLotSelection) return [];
    
    // Filtrar elementos de inventario para el lote seleccionado
    return currentLotSelection.inventoryItems
      .filter(item => item.lot === currentLotSelection.lot)
      .map(item => ({
        ...item,
        id: item.id || `lp-${item.material}-${item.lot}-${item.license_plate || item.licensePlate}`,
        // Usar license_plate si está disponible, de lo contrario usar licensePlate
        licensePlate: item.license_plate || item.licensePlate,
        // Asegurar que la cantidad esté disponible
        quantity: item.quantity || 0
      }));
  }, [currentLotSelection]);

  // Función para resetear selecciones
  const resetSelections = () => {
    setTimeout(() => {
      setCurrentMaterialSelection(null);
      setCurrentLotSelection(null);
      setCurrentLPSelection(null);
      setMaterialInputValue('');
      
      // Resetear input de cantidad
      const quantityInput = document.getElementById('order-quantity-input');
      if (quantityInput) {
        quantityInput.value = DEFAULT_QUANTITY.toString();
      }
    }, 0);
  };

  // Manejar la adición de un nuevo elemento basado en la selección en cascada
  const handleAddItem = (material, lot, lp, quantity = DEFAULT_QUANTITY) => {
    if (!material) return;
    
    // Obtener valores para mostrar en UI
    const displayValues = getDisplayValues(material, lot, lp);
    
    // Obtener cantidad disponible actual
    const displayedAvailableQty = getAvailableQuantity(material, lot, lp);
    
    // Validar la cantidad de orden
    const validatedOrderQty = validateOrderQuantity(quantity, displayedAvailableQty);
    
    // Crear nuevo item
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
      uom: material.uom || materials.find(m => m.id === material.material)?.uom || DEFAULT_QUANTITY,
      project: material.project
    };
    
    // Actualizar lista de items seleccionados y el formulario
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
    
    // Resetear selecciones después de agregar
    resetSelections();
  };

  // Manejar cambio de cantidad para items seleccionados
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = selectedItems.find(item => item.id === itemId);
    
    // Validar cantidad de orden
    const validatedOrderQty = validateOrderQuantity(newQuantity, item.availableQty);

    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: validatedOrderQty }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems);
  };

  // Manejar cambio de UOM para items seleccionados
  const handleUomChange = (itemId, newUomId) => {
    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, uom: newUomId }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems);
  };

  // Manejar eliminación de un item
  const handleRemoveItem = (itemId) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
  };

  // Determinar si hay proyecto seleccionado
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
    handleRemoveItem
  };
};

export default useMaterialSelection;