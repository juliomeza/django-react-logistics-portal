import { TimeStamped } from './common';
import { Project } from './enterprise';
import { Warehouse, Contact, Address, Carrier, CarrierService } from './logistics';
import { Material } from './materials';
import { Inventory, InventorySerialNumber } from './inventory';

// OrderStatus (Estado de orden)
export interface OrderStatus extends TimeStamped {
  id: number;
  status_name: string;
  lookup_code: string;
  description: string;
}

// OrderType (Tipo de orden)
export interface OrderType extends TimeStamped {
  id: number;
  type_name: string;
  lookup_code: string;
  description: string;
}

// OrderClass (Clase de orden)
export interface OrderClass extends TimeStamped {
  id: number;
  order_type_id: number;
  order_type?: OrderType;
  class_name: string;
  lookup_code: string;
  description: string;
}

// OrderCounter (Contador de órdenes)
export interface OrderCounter extends TimeStamped {
  id: number;
  project_id: number;
  project?: Project;
  last_number: number;
}

// Order (Orden)
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

// OrderLine (Línea de orden)
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

// DTO para creación/actualización
export type CreateOrder = Omit<Order, 'id' | 'created_date' | 'modified_date' | 'lines'> & {
  lines: Omit<OrderLine, 'id' | 'created_date' | 'modified_date' | 'order' | 'order_id'>[];
};