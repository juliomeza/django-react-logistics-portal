// client/src/features/orders/hooks/useInventoriesAndMaterials.ts

import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { AuthUserData } from '../../../types/auth';

// Define interfaces to match your original expected types
interface ApiInventory {
  id: number;
  warehouse: number;
  material: number;
  quantity: number;
  location: string;
  license_plate: string;
  lot: string;
  vendor_lot: string;
  created_date?: string;
  modified_date?: string;
  date_received?: string;
  expiration_date?: string;
  status?: number;
  notes?: string;
}

interface ApiMaterial {
  id: number;
  name: string;
  lookup_code: string;
  description: string;
  project: number;
  status: number;
  type: number;
  uom: number;
  is_serialized: boolean;
  current_price?: number;
  created_date?: string;
  modified_date?: string;
  vendor?: number;
  category?: number;
  revision?: string;
  notes?: string;
}

interface UseInventoriesAndMaterialsReturn {
  inventories: ApiInventory[];
  materials: ApiMaterial[];
  loading: boolean;
  error: string | null;
  refreshMaterials: () => Promise<void>; // Nueva función para actualizar materiales
}

/**
 * Hook to get inventories and materials filtered by warehouse
 * @param user Authenticated user
 * @param warehouse ID of the warehouse to filter inventories
 * @returns Inventory and material objects, loading state, possible error, and refresh function
 */
const useInventoriesAndMaterials = (
  user: AuthUserData | null, 
  warehouse: string | number | null
): UseInventoriesAndMaterialsReturn => {
  const [inventories, setInventories] = useState<ApiInventory[]>([]);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar materiales de PostgreSQL
  const fetchMaterials = async () => {
    try {
      console.log('Fetching materials from PostgreSQL');
      const matRes = await apiProtected.get('materials/');
      
      if (matRes.data) {
        console.log(`Retrieved ${matRes.data.length || 0} materials from PostgreSQL`);
        setMaterials(matRes.data);
        return matRes.data;
      } else {
        console.error('Invalid materials response format:', matRes);
        return [];
      }
    } catch (err) {
      console.error('Error fetching materials from PostgreSQL:', err);
      // No establecemos error aquí para no interrumpir el flujo principal
      return [];
    }
  };

  // Función expuesta para actualizar manualmente los materiales desde PostgreSQL
  const refreshMaterials = async () => {
    console.log('Manually refreshing materials from PostgreSQL');
    await fetchMaterials();
  };

  useEffect(() => {
    // Si no hay usuario o almacén, terminamos temprano
    if (!user || !warehouse) {
      console.log('No user or warehouse provided, ending early');
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching SQL inventory data for warehouse:', warehouse);
        
        // Use SQL Server endpoint
        const sqlResponse = await apiProtected.get('reports/inventory/?order_type=outbound');
        console.log('SQL Server response received, number of results:', 
          sqlResponse.data?.results?.length || 'unknown');
        
        // Fetch materials from PostgreSQL in parallel
        const materialsData = await fetchMaterials();
        
        if (sqlResponse.data && sqlResponse.data.results && Array.isArray(sqlResponse.data.results)) {
          // Create a unique ID for each material to maintain relationships
          const materialMap = new Map<string, number>();
          const materialsArray: ApiMaterial[] = [];
          const inventoryItems: ApiInventory[] = [];
          
          // First pass: identify unique materials
          sqlResponse.data.results.forEach((item: any, index: number) => {
            const materialCode = item['Material Code'];
            if (!materialCode) {
              console.warn(`Item at index ${index} has no Material Code:`, item);
              return;
            }
            
            if (!materialMap.has(materialCode)) {
              const materialId = materialsArray.length + 1; // Start IDs from 1
              const material: ApiMaterial = {
                id: materialId,
                name: item['Material Name'] || materialCode,
                lookup_code: materialCode,
                description: item['Material Name'] || materialCode,
                project: 1, // Default project ID
                status: 1,  // Active status
                type: 1,    // Default type
                uom: 1,     // Default UOM
                is_serialized: false
              };
              materialMap.set(materialCode, materialId);
              materialsArray.push(material);
            }
          });
          
          console.log(`Identified ${materialsArray.length} unique materials from SQL Server`);
          
          // Second pass: create inventory items linked to materials
          sqlResponse.data.results.forEach((item: any, index: number) => {
            const materialCode = item['Material Code'];
            if (!materialCode) return;
            
            const materialId = materialMap.get(materialCode) || 0;
            if (materialId === 0) {
              console.warn(`Failed to find material ID for code: ${materialCode}`);
              return;
            }
            
            // Check for missing required fields
            if (item['Available Quantity'] === undefined || item['Available Quantity'] === null) {
              console.warn(`Item has no Available Quantity:`, item);
            }
            
            const inventory: ApiInventory = {
              id: index + 1,
              material: materialId,
              quantity: item['Available Quantity'] || 0,
              location: item.warehouse || '',
              license_plate: item['License Plate'] || '',
              lot: item.Lot || '',
              vendor_lot: '',
              warehouse: typeof warehouse === 'string' ? parseInt(warehouse, 10) : (warehouse || 0)
            };
            
            // Add extra properties needed by the UI
            (inventory as any).materialCode = materialCode;
            (inventory as any).materialName = item['Material Name'] || '';
            (inventory as any).availableQty = item['Available Quantity'] || 0;
            
            inventoryItems.push(inventory);
          });
          
          console.log(`Created ${inventoryItems.length} inventory items from SQL Server data`);
          console.log('Material to PostgreSQL mapping analysis:');
          
          // Check which materials from SQL exist in PostgreSQL for debugging
          const postgresqlMaterialCodes = new Set(materialsData.map((m: any) => m.lookup_code));
          const sqlMaterialCodes = new Set(materialsArray.map(m => m.lookup_code));
          
          let missingInPostgresql = 0;
          sqlMaterialCodes.forEach(code => {
            if (!postgresqlMaterialCodes.has(code)) {
              missingInPostgresql++;
              console.log(`Material code ${code} exists in SQL Server but not in PostgreSQL`);
            }
          });
          
          console.log(`${missingInPostgresql} materials from SQL Server not found in PostgreSQL`);
          
          setMaterials(materialsData);
          setInventories(inventoryItems);
        } else {
          console.error('Invalid response format:', sqlResponse.data);
          setError('Invalid data format from SQL Server');
        }
      } catch (err) {
        console.error('Error in useInventoriesAndMaterials:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load inventories and materials');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, warehouse]);

  return { inventories, materials, loading, error, refreshMaterials };
};

export default useInventoriesAndMaterials;