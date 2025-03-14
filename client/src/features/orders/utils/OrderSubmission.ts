import apiProtected from '../../../services/api/secureApi';
import { saveOrderLines, getSubmittedOrderStatus, handleApiError } from './apiUtils';
import { prepareOrderData } from './OrderValidation';

interface DispatchAction {
  type: string;
  [key: string]: any;
}

// Guarda los detalles de la orden (paso 1)
export const saveOrderDetails = async (
  formData: any,
  orderId: any,
  orderIdFromParams: any,
  setOrderId: (id: any) => void,
  dispatch: (action: DispatchAction) => void,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  try {
    const orderData = await prepareOrderData(formData);
    let response: any;
    const effectiveOrderId = orderId || orderIdFromParams;

    if (effectiveOrderId) {
      response = await apiProtected.patch(`orders/${effectiveOrderId}/`, orderData);
      console.log('Order updated:', response.data);
    } else {
      response = await apiProtected.post('orders/', orderData);
      setOrderId(response.data.id);
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
  } catch (error: any) {
    const errorMessage = handleApiError(error, 'Failed to save order. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

// Envía la orden final
export const submitOrder = async (
  formData: any,
  orderId: any,
  navigate: (path: string) => void,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  try {
    const success = await saveOrderLines(formData, orderId || formData.id, setError, setOpenSnackbar);
    if (!success) throw new Error('Failed to save lines');

    const submittedStatusId = await getSubmittedOrderStatus();
    await apiProtected.patch(`orders/${orderId || formData.id}/`, { order_status: submittedStatusId });

    setError('Order submitted successfully.');
    setOpenSnackbar(true);

    // Navega a '/dashboard' después de un breve retardo
    setTimeout(() => navigate('/dashboard'), 2000);
    return true;
  } catch (error: any) {
    const errorMessage = handleApiError(error, 'Failed to submit order. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false;
  }
};

// Carga los datos de una orden existente
export const loadOrderData = async (
  orderIdFromParams: any,
  user: any,
  dispatch: (action: DispatchAction) => void,
  setOrderId: (id: any) => void,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  try {
    const orderResponse = await apiProtected.get(`orders/${orderIdFromParams}/`);
    const order = orderResponse.data;
    console.log('Loaded order data:', order);

    const linesResponse = await apiProtected.get(`order-lines/order/${orderIdFromParams}/`);
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
        selectedInventories: linesResponse.data.map((line: any) => ({
          id: line.id,
          material: line.material,
          license_plate: line.license_plate,
          orderQuantity: line.quantity,
        })),
      },
    });

    setOrderId(orderIdFromParams);
    return true;
  } catch (err: any) {
    setError('Failed to load order details or lines.');
    setOpenSnackbar(true);
    console.error('Error:', err);
    return false;
  }
};
