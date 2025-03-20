import { useState, useEffect, useCallback } from 'react';
import apiProtected from '../../../services/api/secureApi';
import { AuthUserData } from '../../../types/auth';
import { OrderType, OrderClass } from '../../../types/orders';
import { Project } from '../../../types/enterprise';
import { Warehouse, Contact, Address, Carrier, CarrierService } from '../../../types/logistics';
import { AxiosResponse } from 'axios';

// Interface que describe la estructura real de los proyectos como vienen de la API
interface ApiProject extends Omit<Project, 'users'> {
  users: number[]; // En la API, los users vienen como un array de IDs (números)
}

// Interfaz genérica para respuestas de API
interface ApiResponseWrapper<T> {
  data: T;
  success?: boolean;
  message?: string;
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
  error: string | null;
  refetchReferenceData: () => Promise<void>;
}

// Tipo para manejar las respuestas de manera segura
type ApiResponseType<T> = T | ApiResponseWrapper<T>;

/**
 * Extrae los datos de una respuesta de API, manejando diferentes formatos
 * @param response La respuesta de la API que podría tener diferentes estructuras
 * @returns Los datos extraídos
 */
function extractApiData<T>(response: AxiosResponse<ApiResponseType<T>>): T {
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as ApiResponseWrapper<T>).data;
  }
  return response.data as T;
}

/**
 * Hook para cargar datos de referencia necesarios para formularios de órdenes
 * @param user Usuario autenticado actual
 * @returns Datos de referencia, estado de carga, error y función para recargar datos
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
  const [error, setError] = useState<string | null>(null);

  // Función segura para convertir ID de usuario a número
  const getUserId = (user: AuthUserData | null): number => {
    if (!user || typeof user.id === 'undefined') return 0;
    
    const parsed = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    return isNaN(parsed) ? 0 : parsed;
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const responses = await Promise.all([
        apiProtected.get<ApiResponseType<OrderType[]>>('order-types/'),
        apiProtected.get<ApiResponseType<OrderClass[]>>('order-classes/'),
        apiProtected.get<ApiResponseType<ApiProject[]>>('projects/'),
        apiProtected.get<ApiResponseType<Warehouse[]>>('warehouses/'),
        apiProtected.get<ApiResponseType<Contact[]>>('contacts/'),
        apiProtected.get<ApiResponseType<Address[]>>('addresses/'),
        apiProtected.get<ApiResponseType<Carrier[]>>('carriers/'),
        apiProtected.get<ApiResponseType<CarrierService[]>>('carrier-services/'),
      ]);
      
      const [
        orderTypesRes,
        orderClassesRes,
        projectsRes,
        warehousesRes,
        contactsRes,
        addressesRes,
        carriersRes,
        carrierServicesRes,
      ] = responses;
      
      const userId = getUserId(user);
      
      // Extraer datos de manera segura
      const orderTypes = extractApiData(orderTypesRes);
      const orderClasses = extractApiData(orderClassesRes);
      const projects = extractApiData(projectsRes);
      const warehouses = extractApiData(warehousesRes);
      const contacts = extractApiData(contactsRes);
      const addresses = extractApiData(addressesRes);
      const carriers = extractApiData(carriersRes);
      const carrierServices = extractApiData(carrierServicesRes);
      
      setData({
        orderTypes,
        orderClasses,
        projects: projects.filter(
          (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
        warehouses,
        contacts,
        addresses,
        carriers,
        carrierServices,
      });
    } catch (err) {
      let errorMessage: string;
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string, detail?: string }, status?: number } };
        errorMessage = 
          apiError.response?.data?.message || 
          apiError.response?.data?.detail || 
          `API error: ${apiError.response?.status || 'unknown'}`;
      } else {
        errorMessage = 'Failed to load reference data';
      }
      
      setError(errorMessage);
      console.error('Error loading reference data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refetchReferenceData = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const [contactsRes, addressesRes, projectsRes] = await Promise.all([
        apiProtected.get<ApiResponseType<Contact[]>>('contacts/'),
        apiProtected.get<ApiResponseType<Address[]>>('addresses/'),
        apiProtected.get<ApiResponseType<ApiProject[]>>('projects/'),
      ]);
      
      const userId = getUserId(user);
      
      // Extraer datos de manera segura
      const contacts = extractApiData(contactsRes);
      const addresses = extractApiData(addressesRes);
      const projects = extractApiData(projectsRes);
      
      setData((prev) => ({
        ...prev,
        contacts,
        addresses,
        projects: projects.filter(
          (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
      }));
    } catch (err) {
      let errorMessage: string;
      
      if (err instanceof Error) {
        errorMessage = `Failed to refresh reference data: ${err.message}`;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const apiError = err as { response?: { data?: { message?: string, detail?: string } } };
        errorMessage = 
          `Failed to refresh reference data: ${apiError.response?.data?.message || 
           apiError.response?.data?.detail || 'API error'}`;
      } else {
        errorMessage = 'Failed to refresh reference data';
      }
      
      setError(errorMessage);
      console.error('Error refetching reference data:', err);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user, fetchData]);

  return { data, loading, error, refetchReferenceData };
};

export default useReferenceData;