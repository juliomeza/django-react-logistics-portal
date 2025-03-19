import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { AuthUserData } from '../../../types/auth';

// Definimos interfaces específicas para este hook basadas en la respuesta real de la API
interface ApiInventory {
  id: number;
  warehouse: number;
  material: number;
  quantity: number;
  location: string;
  license_plate: string;
  lot: string;
  vendor_lot: string;
  // Propiedades opcionales específicas en lugar de [key: string]: any
  created_at?: string;
  updated_at?: string;
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
  // Propiedades opcionales específicas en lugar de [key: string]: any
  created_at?: string;
  updated_at?: string;
  vendor?: number;
  category?: number;
  revision?: string;
  notes?: string;
}

interface UseInventoriesAndMaterialsReturn {
  inventories: ApiInventory[];
  materials: ApiMaterial[];
  loading: boolean;
  error: string;
}

/**
 * Hook para obtener inventarios y materiales filtrados por almacén
 * @param user Usuario autenticado
 * @param warehouse ID del almacén para filtrar inventarios
 */
const useInventoriesAndMaterials = (
  user: AuthUserData | null, 
  warehouse: string | number | null
): UseInventoriesAndMaterialsReturn => {
  const [inventories, setInventories] = useState<ApiInventory[]>([]);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!user || !warehouse) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, matRes] = await Promise.all([
          apiProtected.get<ApiInventory[]>('inventories/'),
          apiProtected.get<ApiMaterial[]>('materials/'),
        ]);
        
        // Convertir el warehouse a número de manera segura
        const warehouseId = typeof warehouse === 'string' 
          ? parseInt(warehouse, 10) 
          : warehouse;
        
        // Filtrar solo si warehouseId es un número válido
        if (!isNaN(warehouseId)) {
          setInventories(
            invRes.data.filter((inv) => inv.warehouse === warehouseId)
          );
          setMaterials(matRes.data);
        } else {
          setError('Invalid warehouse ID');
        }
      } catch (err) {
        // Manejo de errores más específico
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to load inventories and materials';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, warehouse]);

  return { inventories, materials, loading, error };
};

export default useInventoriesAndMaterials;