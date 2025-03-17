import { TimeStamped, Status } from './common';
import { Project } from './enterprise';
import { Warehouse } from './logistics';
import { Material } from './materials';

// Inventory (Inventario)
export interface Inventory extends TimeStamped {
  id: number;
  project_id: number;
  project?: Project;
  warehouse_id: number;
  warehouse?: Warehouse;
  material_id: number;
  material?: Material;
  quantity: number;
  location: string;
  license_plate_id: string;
  license_plate: string;
  lot: string;
  vendor_lot: string;
  serial_numbers?: InventorySerialNumber[];
}

// InventorySerialNumber (Número de serie)
export interface InventorySerialNumber extends TimeStamped {
  id: number;
  lookup_code: string;
  status_id: number;
  status?: Status;
  license_plate_id: number;
  license_plate?: Inventory;
  notes: string;
}