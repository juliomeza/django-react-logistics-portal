// types/adapters.ts
import { Order as ApiOrder, OrderStatus as ApiOrderStatus, OrderType as ApiOrderType } from './orders';
import { Contact as ApiContact } from './logistics';
import { Address as ApiAddress } from './logistics';

// Interfaces UI simplificadas para componentes
export interface UIOrder {
  id: number;
  order_status: number;  // Diferente de ApiOrder que usa order_status_id
  lookup_code_order: string;
  reference_number?: string;
  contact: number;       // Diferente de ApiOrder que usa contact_id
  shipping_address: number;  // Diferente de ApiOrder que usa shipping_address_id
  order_type: number;    // Diferente de ApiOrder que usa order_type_id
  created_date: string;
  modified_date?: string;
  delivery_date?: string;
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
    order_status: apiOrder.order_status_id,
    lookup_code_order: apiOrder.lookup_code_order,
    reference_number: apiOrder.reference_number,
    contact: apiOrder.contact_id,
    shipping_address: apiOrder.shipping_address_id,
    order_type: apiOrder.order_type_id,
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
  return {
    id: apiType.id,
    type_name: apiType.type_name,
    // Inferimos estos valores del nombre si es posible
    is_outbound: apiType.type_name?.toLowerCase().includes('outbound'),
    is_inbound: apiType.type_name?.toLowerCase().includes('inbound')
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