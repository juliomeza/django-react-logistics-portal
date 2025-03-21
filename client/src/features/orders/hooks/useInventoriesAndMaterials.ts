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
}

/**
 * Hook to get inventories and materials filtered by warehouse
 * @param user Authenticated user
 * @param warehouse ID of the warehouse to filter inventories
 * @returns Inventory and material objects, loading state and possible error
 */
const useInventoriesAndMaterials = (
  user: AuthUserData | null, 
  warehouse: string | number | null
): UseInventoriesAndMaterialsReturn => {
  const [inventories, setInventories] = useState<ApiInventory[]>([]);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no user or warehouse, end early
    if (!user || !warehouse) {
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
        console.log('SQL Server response data:', sqlResponse.data);
        
        if (sqlResponse.data && sqlResponse.data.results && Array.isArray(sqlResponse.data.results)) {
          // Create a unique ID for each material to maintain relationships
          const materialMap = new Map<string, number>();
          const materialsArray: ApiMaterial[] = [];
          const inventoryItems: ApiInventory[] = [];
          
          // First pass: identify unique materials
          sqlResponse.data.results.forEach((item: any) => {
            const materialCode = item['Material Code'];
            if (!materialMap.has(materialCode)) {
              const materialId = materialsArray.length + 1; // Start IDs from 1
              const material: ApiMaterial = {
                id: materialId,
                name: item['Material Name'],
                lookup_code: materialCode,
                description: item['Material Name'],
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
          
          // Second pass: create inventory items linked to materials
          sqlResponse.data.results.forEach((item: any, index: number) => {
            const materialCode = item['Material Code'];
            const materialId = materialMap.get(materialCode) || 0;
            
            const inventory: ApiInventory = {
              id: index + 1,
              material: materialId,
              quantity: item['Available Quantity'],
              location: item.warehouse || '',
              license_plate: item['License Plate'],
              lot: item.Lot || '',
              vendor_lot: '',
              warehouse: typeof warehouse === 'string' ? parseInt(warehouse, 10) : (warehouse || 0)
            };
            
            // Add extra properties needed by the UI
            (inventory as any).materialCode = item['Material Code'];
            (inventory as any).materialName = item['Material Name'];
            (inventory as any).availableQty = item['Available Quantity'];
            
            inventoryItems.push(inventory);
          });
          
          console.log('Processed materials:', materialsArray);
          console.log('Processed inventories:', inventoryItems);
          
          setMaterials(materialsArray);
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

  return { inventories, materials, loading, error };
};

export default useInventoriesAndMaterials;