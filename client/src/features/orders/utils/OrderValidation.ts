import { OrderFormData, OrderValidationErrors } from '../types';
import { getFirstOrderStatus } from '../utils/apiUtils';

/**
 * Interfaz genérica para objetos con ID
 */
interface WithId {
  id: number | string;
}

/**
 * Valida los campos requeridos de los detalles de la orden
 * @param formData Los datos del formulario de la orden a validar
 * @returns Un objeto con los errores de validación, donde las claves son los nombres de los campos con errores
 */
export const validateOrderDetails = (formData: OrderFormData): OrderValidationErrors => {
  const newErrors: OrderValidationErrors = {};
  
  if (!formData.order_type) newErrors.order_type = true;
  if (!formData.order_class) newErrors.order_class = true;
  if (!formData.project) newErrors.project = true;
  if (!formData.warehouse) newErrors.warehouse = true;
  if (!formData.contact) newErrors.contact = true;
  if (!formData.shipping_address) newErrors.shipping_address = true;
  if (!formData.billing_address) newErrors.billing_address = true;

  return newErrors;
};

/**
 * Extrae el ID de un valor que puede ser un objeto con ID o un ID directamente
 * @param value Un valor que puede ser un objeto con ID o un ID directamente
 * @returns El ID extraído o el valor original si no es un objeto
 */
function extractId(value: unknown): string | number | null {
  if (value && typeof value === 'object' && 'id' in value) {
    return (value as WithId).id;
  }
  return value as string | number | null;
}

/**
 * Prepara los datos de la orden para enviarlos a la API
 * @param formData Los datos del formulario de la orden
 * @returns Los datos de la orden formateados para la API
 */
export const prepareOrderData = async (formData: OrderFormData): Promise<Record<string, any>> => {
  const orderStatus = formData.order_status || await getFirstOrderStatus();
  
  return {
    reference_number: formData.reference_number || null,
    order_type: extractId(formData.order_type),
    order_class: extractId(formData.order_class),
    project: extractId(formData.project),
    warehouse: extractId(formData.warehouse),
    contact: extractId(formData.contact),
    shipping_address: extractId(formData.shipping_address),
    billing_address: extractId(formData.billing_address),
    carrier: formData.carrier ? extractId(formData.carrier) : null,
    service_type: formData.service_type ? extractId(formData.service_type) : null,
    expected_delivery_date: formData.expected_delivery_date || null,
    notes: formData.notes || '',
    order_status: extractId(orderStatus),
  };
};