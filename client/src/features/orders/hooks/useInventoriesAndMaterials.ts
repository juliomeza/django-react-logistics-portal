import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { Inventory } from '../../../types/inventory';
import { Material } from '../../../types/materials';

// Suponiendo que la API retorna inventarios con la propiedad "warehouse" en lugar de "warehouse_id"
type InventoryAPI = Omit<Inventory, 'warehouse_id'> & { warehouse: number };

interface UseInventoriesAndMaterialsReturn {
  inventories: InventoryAPI[];
  materials: Material[];
  loading: boolean;
  error: string;
}

const useInventoriesAndMaterials = (user: any, warehouse: string | number): UseInventoriesAndMaterialsReturn => {
  const [inventories, setInventories] = useState<InventoryAPI[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!user || !warehouse) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, matRes] = await Promise.all([
          apiProtected.get('inventories/'),
          apiProtected.get('materials/'),
        ]);
        setInventories(
          (invRes.data as InventoryAPI[]).filter(
            (inv: InventoryAPI) => inv.warehouse === parseInt(String(warehouse), 10)
          )
        );
        setMaterials(matRes.data as Material[]);
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
