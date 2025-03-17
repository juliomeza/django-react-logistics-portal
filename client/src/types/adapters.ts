// types/adapters.ts
import { Order as ApiOrder, OrderStatus as ApiOrderStatus, OrderType as ApiOrderType } from './orders';
import { Contact as ApiContact } from './logistics';
import { Address as ApiAddress } from './logistics';

// Interfaces UI simplificadas para componentes
export interface UIOrder {
  id: number;
  order_status: number;  // ID del estado de la orden
  order_type: number;    // ID del tipo de orden
  contact: number;       // ID del contacto
  shipping_address: number;  // ID de la dirección de envío
  lookup_code_order: string;
  reference_number?: string;
  created_date: string;
  modified_date?: string;
  delivery_date?: string;
  order_class?: number;
  project?: number;
  warehouse?: number;
  billing_address?: number;
  carrier?: number;
  service_type?: number;
}

export interface UIOrderStatus {
  id: number;
  status_name: string;
}

export interface UIOrderType {
  id: number;
  type_name?: string;
  is_outbound?: boolean;
  is_inbound?: boolean;
}

export interface UIContact {
  id: number;
  company_name?: string;
  contact_name?: string;
}

export interface UIAddress {
  id: number;
  city?: string;
  state?: string;
}

// Funciones adaptadoras para transformar tipos API a tipos UI
export function adaptOrder(apiOrder: ApiOrder): UIOrder {
  return {
    id: apiOrder.id,
    order_status: apiOrder.order_status_id ?? apiOrder.order_status?.id ?? apiOrder.order_status,
    order_type: apiOrder.order_type_id ?? apiOrder.order_type?.id ?? apiOrder.order_type,
    order_class: apiOrder.order_class_id ?? apiOrder.order_class?.id ?? apiOrder.order_class,
    contact: apiOrder.contact_id ?? apiOrder.contact?.id ?? apiOrder.contact,
    shipping_address: apiOrder.shipping_address_id ?? apiOrder.shipping_address?.id ?? apiOrder.shipping_address,
    billing_address: apiOrder.billing_address_id ?? apiOrder.billing_address?.id ?? apiOrder.billing_address,
    project: apiOrder.project_id ?? apiOrder.project?.id ?? apiOrder.project,
    warehouse: apiOrder.warehouse_id ?? apiOrder.warehouse?.id ?? apiOrder.warehouse,
    lookup_code_order: apiOrder.lookup_code_order,
    reference_number: apiOrder.reference_number,
    carrier: apiOrder.carrier_id ?? apiOrder.carrier?.id,
    service_type: apiOrder.service_type_id ?? apiOrder.service_type?.id,
    created_date: apiOrder.created_date,
    modified_date: apiOrder.modified_date,
    delivery_date: apiOrder.delivery_date
  };
}

export function adaptOrderStatus(apiStatus: ApiOrderStatus): UIOrderStatus {
  return {
    id: apiStatus.id,
    status_name: apiStatus.status_name
  };
}

export function adaptOrderType(apiType: ApiOrderType): UIOrderType {
  // Por defecto, si el tipo tiene "id" 1, es outbound
  const isOutbound = apiType.id === 1 || (
    (apiType.type_name?.toLowerCase() || '').includes('outbound') || 
    (apiType.lookup_code?.toLowerCase() || '').includes('out') ||
    (apiType.lookup_code?.toLowerCase() || '').startsWith('so') ||  // Sales Order
    (apiType.lookup_code?.toLowerCase() || '').startsWith('do')     // Delivery Order
  );

  // Por defecto, si el tipo tiene "id" 2, es inbound
  const isInbound = apiType.id === 2 || (
    (apiType.type_name?.toLowerCase() || '').includes('inbound') || 
    (apiType.lookup_code?.toLowerCase() || '').includes('in') ||
    (apiType.lookup_code?.toLowerCase() || '').startsWith('po') ||  // Purchase Order
    (apiType.lookup_code?.toLowerCase() || '').startsWith('ro')     // Receipt Order
  );

  return {
    id: apiType.id,
    type_name: apiType.type_name,
    is_outbound: isOutbound,
    is_inbound: isInbound
  };
}

export function adaptContact(apiContact: ApiContact): UIContact {
  return {
    id: apiContact.id,
    company_name: apiContact.company_name,
    contact_name: apiContact.contact_name
  };
}

export function adaptAddress(apiAddress: ApiAddress): UIAddress {
  return {
    id: apiAddress.id,
    city: apiAddress.city,
    state: apiAddress.state
  };
}

// Funciones adaptadoras para colecciones
export function adaptOrders(apiOrders: ApiOrder[]): UIOrder[] {
  return apiOrders.map(adaptOrder);
}

export function adaptOrderStatuses(apiStatuses: ApiOrderStatus[]): UIOrderStatus[] {
  return apiStatuses.map(adaptOrderStatus);
}

export function adaptOrderTypes(apiTypes: ApiOrderType[]): UIOrderType[] {
  return apiTypes.map(adaptOrderType);
}

export function adaptContacts(apiContacts: ApiContact[]): UIContact[] {
  return apiContacts.map(adaptContact);
}

export function adaptAddresses(apiAddresses: ApiAddress[]): UIAddress[] {
  return apiAddresses.map(adaptAddress);
}