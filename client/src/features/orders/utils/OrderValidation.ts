import { getFirstOrderStatus } from '../utils/apiUtils';

// Valida los campos requeridos de los detalles de la orden
export const validateOrderDetails = (formData: any): Record<string, boolean> => {
  let newErrors: Record<string, boolean> = {};
  if (!formData.order_type) newErrors.order_type = true;
  if (!formData.order_class) newErrors.order_class = true;
  if (!formData.project) newErrors.project = true;
  if (!formData.warehouse) newErrors.warehouse = true;
  if (!formData.contact) newErrors.contact = true;
  if (!formData.shipping_address) newErrors.shipping_address = true;
  if (!formData.billing_address) newErrors.billing_address = true;

  return newErrors;
};

// Prepara los datos de la orden para enviarlos a la API
export const prepareOrderData = async (formData: any): Promise<any> => {
  return {
    reference_number: formData.reference_number || null,
    order_type: formData.order_type,
    order_class: formData.order_class,
    project: formData.project,
    warehouse: formData.warehouse,
    contact: formData.contact,
    shipping_address: formData.shipping_address,
    billing_address: formData.billing_address,
    carrier: formData.carrier || null,
    service_type: formData.service_type || null,
    expected_delivery_date: formData.expected_delivery_date || null,
    notes: formData.notes || '',
    order_status: formData.order_status || (await getFirstOrderStatus()),
  };
};
