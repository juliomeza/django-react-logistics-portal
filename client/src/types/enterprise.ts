import { TimeStamped } from './common';
import { Address } from './logistics';
import { User } from './users';
import { Warehouse, Carrier, CarrierService, Contact } from './logistics';

// Enterprise (Empresa)
export interface Enterprise extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
  is_active: boolean;
  address_id?: number;
  address?: Address;
  notes: string;
}

// Client (Cliente)
export interface Client extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
  address_id?: number;
  address?: Address;
  enterprise_id: number;
  enterprise?: Enterprise;
  is_active: boolean;
  notes: string;
}

// Project (Proyecto)
export interface Project extends TimeStamped {
  id: number;
  is_active: boolean;
  name: string;
  lookup_code: string;
  orders_prefix: string;
  client_id: number;
  client?: Client;
  users?: User[]; // ManyToMany relationship
  warehouses?: Warehouse[]; // Optional ManyToMany relationship
  carriers?: Carrier[]; // Optional ManyToMany relationship
  services?: CarrierService[]; // Optional ManyToMany relationship
  contacts?: Contact[]; // Optional ManyToMany relationship
  export_format: 'JSON' | 'CSV';
  notes: string;
}