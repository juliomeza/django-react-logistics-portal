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
  [key: string]: any; // Para otras propiedades que puedan existir
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
  [key: string]: any; // Para otras propiedades que puedan existir
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
  warehouse: string | number
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
        
        setInventories(
          invRes.data.filter((inv) => inv.warehouse === parseInt(String(warehouse), 10))
        );
        setMaterials(matRes.data);
      } catch (err) {
        setError('Failed to load inventories');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, warehouse]);

  return { inventories, materials, loading, error };
};

export default useInventoriesAndMaterials;