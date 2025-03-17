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