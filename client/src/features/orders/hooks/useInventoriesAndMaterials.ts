import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';

interface UseInventoriesAndMaterialsReturn {
  inventories: any[];
  materials: any[];
  loading: boolean;
  error: string;
}

const useInventoriesAndMaterials = (user: any, warehouse: string | number): UseInventoriesAndMaterialsReturn => {
  const [inventories, setInventories] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
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
          invRes.data.filter((inv: any) => inv.warehouse === parseInt(String(warehouse), 10))
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
