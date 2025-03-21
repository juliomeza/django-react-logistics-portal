import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { AuthUserData } from '../../../types/auth';
import { AxiosResponse } from 'axios';

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
  // Propiedades opcionales específicas en lugar de [key: string]: any
  created_date?: string;
  modified_date?: string;
  vendor?: number;
  category?: number;
  revision?: string;
  notes?: string;
}

// Definir posibles estructuras de respuesta API
interface ApiResponseContainer<T> {
  data: T;
  success?: boolean;
  message?: string;
}

interface UseInventoriesAndMaterialsReturn {
  inventories: ApiInventory[];
  materials: ApiMaterial[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener inventarios y materiales filtrados por almacén
 * @param user Usuario autenticado
 * @param warehouse ID del almacén para filtrar inventarios
 * @returns Objetos de inventarios y materiales, estado de carga y posible error
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
    // Si no hay usuario o almacén, terminamos temprano
    if (!user || !warehouse) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const invRes: AxiosResponse<ApiInventory[] | ApiResponseContainer<ApiInventory[]>> = 
          await apiProtected.get('inventories/');
        
        const matRes: AxiosResponse<ApiMaterial[] | ApiResponseContainer<ApiMaterial[]>> = 
          await apiProtected.get('materials/');
        
        // Convertir el warehouse a número de manera segura
        const warehouseId = typeof warehouse === 'string' 
          ? parseInt(warehouse, 10) 
          : warehouse;
        
        // Filtrar solo si warehouseId es un número válido
        if (!isNaN(warehouseId)) {
          // Extraer los datos correctamente según la estructura de respuesta
          let inventoryData: ApiInventory[];
          let materialData: ApiMaterial[];
          
          // Verificar si la respuesta tiene una estructura anidada o directa
          if (invRes.data && typeof invRes.data === 'object' && 'data' in invRes.data) {
            inventoryData = (invRes.data as ApiResponseContainer<ApiInventory[]>).data;
          } else {
            inventoryData = invRes.data as ApiInventory[];
          }
          
          if (matRes.data && typeof matRes.data === 'object' && 'data' in matRes.data) {
            materialData = (matRes.data as ApiResponseContainer<ApiMaterial[]>).data;
          } else {
            materialData = matRes.data as ApiMaterial[];
          }
          
          setInventories(
            inventoryData.filter((inv: ApiInventory) => inv.warehouse === warehouseId)
          );
          setMaterials(materialData);
        } else {
          setError('Invalid warehouse ID');
        }
      } catch (err) {
        // Manejo de errores más específico
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'object' && err !== null && 'response' in err) {
          const apiError = err as { response?: { data?: { message?: string, detail?: string }, status?: number } };
          setError(
            apiError.response?.data?.message || 
            apiError.response?.data?.detail || 
            `Error de API: ${apiError.response?.status || 'desconocido'}`
          );
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