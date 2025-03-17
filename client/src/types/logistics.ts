import { TimeStamped } from './common';

// Address (Dirección)
export interface Address extends TimeStamped {
  id: number;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  entity_type: 'enterprise' | 'warehouse' | 'recipient';
  address_type: 'shipping' | 'billing';
  notes: string;
}

// Contact (Contacto)
export interface Contact extends TimeStamped {
  id: number;
  company_name: string;
  contact_name: string;
  attention: string;
  phone: string;
  email: string;
  mobile: string;
  title: string;
  notes: string;
  addresses?: Address[]; // ManyToMany relationship
}

// Warehouse (Almacén)
export interface Warehouse extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
  address_id: number;
  address?: Address;
  is_active: boolean;
  notes: string;
}

// Carrier (Transportista)
export interface Carrier extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
}

// CarrierService (Servicio de transportista)
export interface CarrierService extends TimeStamped {
  id: number;
  carrier_id: number;
  carrier?: Carrier;
  name: string;
  lookup_code: string;
}