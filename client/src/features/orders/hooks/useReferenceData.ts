import { useState, useEffect, useCallback } from 'react';
import apiProtected from '../../../services/api/secureApi';

interface ReferenceData {
  orderTypes: any[];
  orderClasses: any[];
  projects: any[];
  warehouses: any[];
  contacts: any[];
  addresses: any[];
  carriers: any[];
  carrierServices: any[];
}

interface UseReferenceDataReturn {
  data: ReferenceData;
  loading: boolean;
  error: string;
  refetchReferenceData: () => Promise<void>;
}

interface User {
  id: string | number;
  [key: string]: any;
}

const useReferenceData = (user: User | null): UseReferenceDataReturn => {
  const [data, setData] = useState<ReferenceData>({
    orderTypes: [],
    orderClasses: [],
    projects: [],
    warehouses: [],
    contacts: [],
    addresses: [],
    carriers: [],
    carrierServices: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        orderTypesRes,
        orderClassesRes,
        projectsRes,
        warehousesRes,
        contactsRes,
        addressesRes,
        carriersRes,
        carrierServicesRes,
      ] = await Promise.all([
        apiProtected.get('order-types/'),
        apiProtected.get('order-classes/'),
        apiProtected.get('projects/'),
        apiProtected.get('warehouses/'),
        apiProtected.get('contacts/'),
        apiProtected.get('addresses/'),
        apiProtected.get('carriers/'),
        apiProtected.get('carrier-services/'),
      ]);
      const userId = parseInt(String(user?.id || 0), 10);
      setData({
        orderTypes: orderTypesRes.data,
        orderClasses: orderClassesRes.data,
        projects: projectsRes.data.filter(
          (proj: any) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
        warehouses: warehousesRes.data,
        contacts: contactsRes.data,
        addresses: addressesRes.data,
        carriers: carriersRes.data,
        carrierServices: carrierServicesRes.data,
      });
    } catch (err) {
      setError('Failed to load reference data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetchReferenceData = async () => {
    try {
      const [contactsRes, addressesRes, projectsRes] = await Promise.all([
        apiProtected.get('contacts/'),
        apiProtected.get('addresses/'),
        apiProtected.get('projects/'),
      ]);
      const userId = parseInt(String(user?.id || 0), 10);
      setData((prev) => ({
        ...prev,
        contacts: contactsRes.data,
        addresses: addressesRes.data,
        projects: projectsRes.data.filter(
          (proj: any) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
      }));
    } catch (err) {
      setError('Failed to refresh reference data');
      console.error('Error refetching reference data:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]);

  return { data, loading, error, refetchReferenceData };
};

export default useReferenceData;
