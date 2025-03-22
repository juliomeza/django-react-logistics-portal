import apiProtected from '../../../services/api/secureApi';
import { ApiError } from '../../../types/auth';
import { ApiResponse } from '../../../types/api';
import { OrderStatus, OrderFormData } from '../../../types/orders';

/**
 * Interfaz para la línea de orden a enviar a la API
 */
export interface OrderLinePayload {
  order: number | string;
  material: number;
  quantity: number;
  license_plate: string | null; // Permitir nulo si no hay placa
  lot: string | null; // Agregar el campo para el lote
}

/**
 * Maneja errores de API y extrae mensajes de error
 * @param error Error de la API
 * @param defaultMessage Mensaje predeterminado si no se puede extraer un mensaje del error
 * @returns Mensaje de error formateado
 */
export const handleApiError = (error: ApiError, defaultMessage: string): string => {
  if (error.response?.data && typeof error.response.data === 'object') {
    const errorData = error.response.data as Record<string, string>;
    return Object.entries(errorData)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join('\n');
  }
  return error.message || defaultMessage;
};

/**
 * Guarda las líneas de orden en la API
 * @param formData Datos del formulario con inventarios seleccionados
 * @param orderId ID de la orden
 * @param setError Función para establecer un mensaje de error
 * @param setOpenSnackbar Función para mostrar/ocultar el snackbar
 * @returns Promise<boolean> indicando éxito o fracaso
 */
export const saveOrderLines = async (
  formData: OrderFormData,
  orderId: number | string,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  if (!Array.isArray(formData.selectedInventories) || formData.selectedInventories.length === 0) {
    setError('Please select at least one material before saving.');
    setOpenSnackbar(true);
    return false;
  }
  try {
    if (!orderId) {
      throw new Error('Order ID is not set. Cannot save materials.');
    }
    console.log('Saving lines with orderId:', orderId);
    console.log('Selected inventories:', formData.selectedInventories);

    // Eliminar líneas existentes
    await apiProtected.delete(`order-lines/order/${orderId}/clear/`);
    
    // Crear nuevas líneas de orden
    const orderLinePromises = formData.selectedInventories.map((item) => {
      const orderLineData: OrderLinePayload = {
        order: orderId,
        material: typeof item.material === 'string' ? parseInt(item.material, 10) : item.material,
        quantity: item.orderQuantity || 1,
        license_plate: item.licensePlate || item.license_plate || null, // Incluir el license plate, usar null si no hay
        lot: item.lot || null, // Incluir el lote, usar null si no hay lote
      };
      return apiProtected.post<ApiResponse<unknown>>('order-lines/', orderLineData);
    });
    
    await Promise.all(orderLinePromises);
    setError('Materials saved successfully');
    setOpenSnackbar(true);
    return true;
  } catch (error) {
    console.error('Error saving lines:', error);
    const errorMessage = handleApiError(error as ApiError, 'Failed to save materials. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

/**
 * Obtiene el primer estado de la orden (generalmente "Created")
 * @returns Promise con el ID del estado "Created"
 */
export const getFirstOrderStatus = async (): Promise<number> => {
  try {
    const response = await apiProtected.get<OrderStatus[]>('order-statuses/');
    const createdStatus = response.data.find((status) => status.status_name === 'Created');
    return createdStatus ? createdStatus.id : 1; // Valor por defecto si no se encuentra
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return 1; // Valor por defecto en caso de error
  }
};

/**
 * Obtiene el estado "Submitted" de la orden
 * @returns Promise con el ID del estado "Submitted"
 */
export const getSubmittedOrderStatus = async (): Promise<number> => {
  try {
    const response = await apiProtected.get<OrderStatus[]>('order-statuses/');
    const submittedStatus = response.data.find((status) => status.status_name === 'Submitted');
    return submittedStatus ? submittedStatus.id : 2; // Valor por defecto si no se encuentra
  } catch (error) {
    console.error('Error fetching submitted status:', error);
    return 2; // Valor por defecto en caso de error
  }
};