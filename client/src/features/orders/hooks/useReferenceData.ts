import { useState, useEffect, useCallback } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { AuthUserData } from '../../../types/auth';
import { OrderType, OrderClass } from '../../../types/orders';
import { Project } from '../../../types/enterprise';
import { Warehouse, Contact, Address, Carrier, CarrierService } from '../../../types/logistics';

// Interface que describe la estructura real de los proyectos como vienen de la API
interface ApiProject extends Omit<Project, 'users'> {
  users: number[]; // En la API, los users vienen como un array de IDs (números)
}

interface ReferenceData {
  orderTypes: OrderType[];
  orderClasses: OrderClass[];
  projects: ApiProject[];
  warehouses: Warehouse[];
  contacts: Contact[];
  addresses: Address[];
  carriers: Carrier[];
  carrierServices: CarrierService[];
}

interface UseReferenceDataReturn {
  data: ReferenceData;
  loading: boolean;
  error: string;
  refetchReferenceData: () => Promise<void>;
}

/**
 * Hook para cargar datos de referencia necesarios para formularios de órdenes
 * @param user Usuario autenticado actual
 */
const useReferenceData = (user: AuthUserData | null): UseReferenceDataReturn => {
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

  // Función segura para convertir ID de usuario a número
  const getUserId = (user: AuthUserData | null): number => {
    if (!user || !user.id) return 0;
    
    const parsed = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    
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
        apiProtected.get<OrderType[]>('order-types/'),
        apiProtected.get<OrderClass[]>('order-classes/'),
        apiProtected.get<ApiProject[]>('projects/'),
        apiProtected.get<Warehouse[]>('warehouses/'),
        apiProtected.get<Contact[]>('contacts/'),
        apiProtected.get<Address[]>('addresses/'),
        apiProtected.get<Carrier[]>('carriers/'),
        apiProtected.get<CarrierService[]>('carrier-services/'),
      ]);
      
      const userId = getUserId(user);
      
      setData({
        orderTypes: orderTypesRes.data,
        orderClasses: orderClassesRes.data,
        projects: projectsRes.data.filter(
          (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
        warehouses: warehousesRes.data,
        contacts: contactsRes.data,
        addresses: addressesRes.data,
        carriers: carriersRes.data,
        carrierServices: carrierServicesRes.data,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reference data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetchReferenceData = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const [contactsRes, addressesRes, projectsRes] = await Promise.all([
        apiProtected.get<Contact[]>('contacts/'),
        apiProtected.get<Address[]>('addresses/'),
        apiProtected.get<ApiProject[]>('projects/'),
      ]);
      
      const userId = getUserId(user);
      
      setData((prev) => ({
        ...prev,
        contacts: contactsRes.data,
        addresses: addressesRes.data,
        projects: projectsRes.data.filter(
          (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
      }));
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Failed to refresh reference data: ${err.message}`
        : 'Failed to refresh reference data';
      setError(errorMessage);
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