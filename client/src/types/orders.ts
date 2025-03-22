import { TimeStamped } from './common';
import { Project } from './enterprise';
import { Warehouse, Contact, Address, Carrier, CarrierService } from './logistics';
import { Material } from './materials';
import { Inventory, InventorySerialNumber } from './inventory';

/** Códigos de estado predefinidos para órdenes basados en la base de datos */
export enum OrderStatusCode {
  CREATED = '01_created',
  SUBMITTED = '02_submitted',
  RECEIVED = '03_received',
  PROCESSING = '04_processing',
  SHIPPED = '05_shipped',
  IN_TRANSIT = '06_in_transit',
  DELIVERED = '07_delivered'
}

/** 
 * Estado de una orden que define su situación actual en el flujo de trabajo
 * @property status_name - Nombre descriptivo del estado
 * @property lookup_code - Código único que identifica el estado (ej: "01_created")
 * @property description - Descripción detallada del significado del estado
 */
export interface OrderStatus extends TimeStamped {
  id: number;
  status_name: string;
  lookup_code: OrderStatusCode;
  description: string;
}

/**
 * Tipo de orden que categoriza su propósito principal
 * @property type_name - Nombre descriptivo del tipo de orden
 * @property lookup_code - Código único que identifica el tipo
 */
export interface OrderType extends TimeStamped {
  id: number;
  type_name: string;
  lookup_code: string;
  description: string;
}

/**
 * Clase específica de orden que extiende el tipo de orden
 * @property order_type - Referencia al tipo de orden padre
 * @property class_name - Nombre descriptivo de la clase
 */
export interface OrderClass extends TimeStamped {
  id: number;
  order_type_id: number;
  order_type?: OrderType;
  class_name: string;
  lookup_code: string;
  description: string;
}

/**
 * Contador de órdenes que lleva el registro del último número de orden generado
 * @property project - Proyecto asociado al contador
 * @property last_number - Último número de orden generado
 */
export interface OrderCounter extends TimeStamped {
  id: number;
  project_id: number;
  project?: Project;
  last_number: number;
}

/**
 * Orden principal que representa una transacción o movimiento en el sistema
 * @property lookup_code_order - Código único de la orden (requerido)
 * @property lookup_code_shipment - Código único del envío asociado (requerido)
 * @property reference_number - Número de referencia externo opcional
 */
export interface Order extends TimeStamped {
  id: number;
  lookup_code_order: string;
  lookup_code_shipment: string;
  reference_number?: string;
  order_type_id: number;
  order_type?: OrderType;
  order_class_id: number;
  order_class?: OrderClass;
  order_status_id: number;
  order_status?: OrderStatus;
  project_id: number;
  project?: Project;
  warehouse_id: number;
  warehouse?: Warehouse;
  contact_id: number;
  contact?: Contact;
  shipping_address_id: number;
  shipping_address?: Address;
  billing_address_id: number;
  billing_address?: Address;
  carrier_id?: number;
  carrier?: Carrier;
  service_type_id?: number;
  service_type?: CarrierService;
  expected_delivery_date?: string;
  delivery_date?: string;
  file_generated: boolean;
  file_generated_at?: string;
  notes: string;
  lines?: OrderLine[];
}

/**
 * Línea de orden que representa un ítem específico dentro de una orden
 * @property material - Material asociado a la línea
 * @property quantity - Cantidad del material (debe ser positiva)
 */
export interface OrderLine extends TimeStamped {
  id: number;
  order_id: number;
  order?: Order;
  material_id: number;
  material?: Material;
  quantity: number;
  license_plate_id?: number;
  license_plate?: Inventory;
  serial_number_id?: number;
  serial_number?: InventorySerialNumber;
  lot: string;
  vendor_lot: string;
  notes: string;
}

/**
 * DTO para creación/actualización de órdenes
 * @property lines - Líneas de la orden que se están creando/actualizando
 */
export type CreateOrder = Omit<Order, 'id' | 'created_date' | 'modified_date' | 'lines'> & {
  lines: Omit<OrderLine, 'id' | 'created_date' | 'modified_date' | 'order' | 'order_id'>[];
};

/**
 * Datos del formulario para crear o actualizar órdenes
 */
export interface OrderFormData {
  id?: number | string;
  order_type?: number | string | OrderType;
  order_class?: number | string | OrderClass;
  order_status?: number | string | OrderStatus;
  project?: number | string;
  warehouse?: number | string;
  contact?: number | string;
  shipping_address?: number | string;
  billing_address?: number | string;
  carrier?: number | string;
  service_type?: number | string;
  reference_number?: string;
  lookup_code_order?: string;
  lookup_code_shipment?: string;
  expected_delivery_date?: string;
  delivery_date?: string;
  notes?: string;
  selectedInventories?: Array<{
    id: number;
    material: number;
    orderQuantity?: number;
    licensePlate?: string | null; // Add licensePlate
    license_plate?: string | null; // Add license_plate
    lot?: string | null; // Add lot
  }>;
}

/**
 * Datos de orden para visualización en el componente OrderSummary
 */
export interface OrderData {
  order_type: number | string;
  order_class: number | string;
  lookup_code_order: string;
  reference_number?: string;
  warehouse: number | string;
  project: number | string;
  carrier?: number | string;
  service_type?: number | string;
  contact: number | string;
  expected_delivery_date?: string;
  shipping_address: number | string;
  billing_address: number | string;
  notes?: string;
}

/**
 * Errores de validación para el formulario de órdenes
 */
export interface OrderValidationErrors {
  order_type?: boolean;
  order_class?: boolean;
  project?: boolean;
  warehouse?: boolean;
  contact?: boolean;
  shipping_address?: boolean;
  billing_address?: boolean;
  [field: string]: boolean | undefined;
}