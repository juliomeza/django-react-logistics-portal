import { TimeStamped, Status } from './common';
import { Project } from './enterprise';

// UOM (Unidad de Medida)
export interface UOM extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
  description: string;
}

// MaterialType (Tipo de Material)
export interface MaterialType extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
  description: string;
}

// Material
export interface Material extends TimeStamped {
  id: number;
  name: string;
  lookup_code: string;
  description: string;
  project_id: number;
  project?: Project;
  status_id: number;
  status?: Status;
  type_id: number;
  type?: MaterialType;
  uom_id: number;
  uom?: UOM;
  is_serialized: boolean;
  current_price?: number;
}

// MaterialPriceHistory (Historial de precios)
export interface MaterialPriceHistory extends TimeStamped {
  id: number;
  material_id: number;
  material?: Material;
  price: number;
  effective_date: string;
  end_date?: string;
}

// --- Interfaces específicas para componentes de Materials ---

/**
 * Versión simplificada de Material para mostrar en tablas y selecciones
 */
export interface MaterialDisplay {
  id: number;
  lookup_code?: string;
  name?: string;
  uom?: number | string;
}

/**
 * Interfaz para una opción de material en selecciones
 */
export interface MaterialOption {
  id: number;
  material: number;
  materialCode?: string;
  materialName?: string;
  availableQty?: number;
}

/**
 * Interfaz para una opción de lote en selecciones
 */
export interface LotOption {
  lot: string;
  id?: number;
}

/**
 * Interfaz para una opción de placa de licencia en selecciones
 * Unifica las propiedades license_plate y licensePlate para mayor consistencia
 */
export interface LicensePlateOption {
  license_plate?: string;
  licensePlate?: string;
  id?: number;
}

/**
 * Interfaz para los elementos de inventario seleccionados
 */
export interface SelectedItem {
  id: number | string;
  material: number;
  materialCode?: string;
  materialName?: string;
  lot?: string;
  license_plate?: string;
  licensePlate?: string;
  availableQty: number;
  orderQuantity?: number;
  uom?: number | string;
}

/**
 * Mapa de UOMs por material
 */
export interface MaterialUOMsMap {
  [materialId: string]: UOM[];
}