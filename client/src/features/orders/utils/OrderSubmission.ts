import apiProtected from '../../../services/api/secureApi';
import { saveOrderLines, getSubmittedOrderStatus, handleApiError } from './apiUtils';
import { prepareOrderData, PreparedOrderData } from './OrderValidation';
import { Order, OrderFormData } from '../../../types/orders';
import { AxiosResponse } from 'axios';
import React from 'react';
import { AuthUserData, ApiError } from '../../../types/auth';

/**
 * Interfaz para acciones de dispatch en reducers de formularios
 */
export interface DispatchAction {
  type: string;
  field?: string;
  value?: unknown;
  data?: Record<string, unknown>;
}

/**
 * Tipo para las funciones de navegación
 */
export type NavigateFunction = (path: string) => void;

/**
 * Tipo para funciones de establecer estado
 */
export type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Guarda los detalles de la orden (paso 1)
 * @param formData Datos del formulario de la orden
 * @param orderId ID de la orden existente (si es una actualización)
 * @param orderIdFromParams ID de la orden desde parámetros de URL
 * @param setOrderId Función para establecer el ID de la orden en el estado
 * @param dispatch Función para dispatchar acciones al reducer
 * @param setError Función para establecer mensajes de error
 * @param setOpenSnackbar Función para mostrar/ocultar snackbar
 * @returns Promise con resultado booleano de éxito/fallo
 */
export const saveOrderDetails = async (
  formData: OrderFormData,
  orderId: number | string | null,
  orderIdFromParams: number | string | null,
  setOrderId: SetStateFunction<string | null>,
  dispatch: (action: DispatchAction) => void,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  try {
    // Usar la interfaz específica en lugar de any
    const orderData: PreparedOrderData = await prepareOrderData(formData);
    
    let response: AxiosResponse<Order>;
    const effectiveOrderId = orderId || orderIdFromParams;

    if (effectiveOrderId) {
      response = await apiProtected.patch<Order>(`orders/${effectiveOrderId}/`, orderData);
      console.log('Order updated:', response.data);
    } else {
      response = await apiProtected.post<Order>('orders/', orderData);
      setOrderId(String(response.data.id));
      dispatch({
        type: 'UPDATE_FIELD',
        field: 'lookup_code_order',
        value: response.data.lookup_code_order,
      });
      console.log('Order created:', response.data);
    }

    setError(effectiveOrderId ? 'Order updated successfully' : 'Order created successfully');
    setOpenSnackbar(true);
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error as ApiError, 'Failed to save order. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

/**
 * Envía la orden final para procesamiento
 * @param formData Datos del formulario de la orden
 * @param orderId ID de la orden
 * @param navigate Función para navegar a otra página
 * @param setError Función para establecer mensajes de error
 * @param setOpenSnackbar Función para mostrar/ocultar snackbar
 * @returns Promise con resultado booleano de éxito/fallo
 */
export const submitOrder = async (
  formData: OrderFormData,
  orderId: number | string | null,
  navigate: NavigateFunction,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  try {
    // Asegurar que el ID existe
    const effectiveOrderId = orderId || formData.id;
    if (!effectiveOrderId) {
      throw new Error('Order ID is missing');
    }
    
    const success = await saveOrderLines(
      formData, 
      effectiveOrderId, 
      setError, 
      setOpenSnackbar
    );
    
    if (!success) throw new Error('Failed to save lines');

    const submittedStatusId = await getSubmittedOrderStatus();
    await apiProtected.patch(`orders/${effectiveOrderId}/`, { order_status: submittedStatusId });

    setError('Order submitted successfully.');
    setOpenSnackbar(true);

    // Navega a '/dashboard' después de un breve retardo
    setTimeout(() => navigate('/dashboard'), 2000);
    return true;
  } catch (error: unknown) {
    const errorMessage = handleApiError(error as ApiError, 'Failed to submit order. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

/**
 * Interfaz para material en respuesta de línea de orden
 */
export interface MaterialResponse {
  id: number;
  name: string;
  lookup_code: string;
  [key: string]: unknown;
}

/**
 * Interfaz para líneas de orden recuperadas de la API
 */
export interface OrderLineResponse {
  id: number;
  material: number | MaterialResponse;
  license_plate: number | null;
  quantity: number;
  [key: string]: unknown;
}

/**
 * Carga los datos de una orden existente
 * @param orderIdFromParams ID de la orden desde parámetros de URL
 * @param user Usuario autenticado actual
 * @param dispatch Función para dispatchar acciones al reducer
 * @param setOrderId Función para establecer el ID de la orden en el estado
 * @param setError Función para establecer mensajes de error
 * @param setOpenSnackbar Función para mostrar/ocultar snackbar
 * @returns Promise con resultado booleano de éxito/fallo
 */
export const loadOrderData = async (
  orderIdFromParams: number | string | undefined,
  user: AuthUserData | null,
  dispatch: (action: DispatchAction) => void,
  setOrderId: SetStateFunction<string | null>,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  if (orderIdFromParams === undefined) {
    setError('Order ID is missing.');
    setOpenSnackbar(true);
    return false;
  }
  try {
    const orderResponse = await apiProtected.get<Order>(`orders/${orderIdFromParams}/`);
    const order = orderResponse.data;
    console.log('Loaded order data:', order);

    const linesResponse = await apiProtected.get<OrderLineResponse[]>(`order-lines/order/${orderIdFromParams}/`);
    console.log('Loaded order lines:', linesResponse.data);

    dispatch({
      type: 'SET_FORM_DATA',
      data: {
        ...order,
        reference_number: order.reference_number ?? '',
        notes: order.notes ?? '',
        order_type: order.order_type ?? '',
        order_class: order.order_class ?? '',
        warehouse: order.warehouse ?? '',
        project: order.project ?? '',
        carrier: order.carrier ?? '',
        service_type: order.service_type ?? '',
        contact: order.contact ?? '',
        expected_delivery_date: order.expected_delivery_date ?? '',
        shipping_address: order.shipping_address ?? '',
        billing_address: order.billing_address ?? '',
        lookup_code_order: order.lookup_code_order ?? '',
        selectedInventories: linesResponse.data.map((line: OrderLineResponse) => ({
          id: line.id,
          material: typeof line.material === 'object' && line.material !== null 
            ? line.material.id 
            : line.material,
          license_plate: line.license_plate,
          orderQuantity: line.quantity,
        })),
      },
    });

    setOrderId(String(orderIdFromParams));
    return true;
  } catch (err) {
    setError('Failed to load order details or lines.');
    setOpenSnackbar(true);
    console.error('Error:', err);
    return false;
  }
};