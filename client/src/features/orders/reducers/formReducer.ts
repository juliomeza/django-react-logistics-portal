// formReducer.ts
import { OrderFormData } from '../../../types/orders';

/**
 * Estado del formulario de orden
 * Representa los campos editables de una orden y sus inventarios seleccionados
 */
export interface FormState {
  // Campos básicos de la orden
  lookup_code_order: string;
  reference_number: string;
  notes: string;
  
  // Relaciones (IDs como strings para compatibilidad con inputs)
  order_type: string;
  order_class: string;
  warehouse: string;
  project: string;
  carrier: string;
  service_type: string;
  contact: string;
  
  // Fechas
  expected_delivery_date: string;
  
  // Direcciones
  shipping_address: string;
  billing_address: string;
  
  // Inventarios seleccionados para esta orden
  selectedInventories: Array<{
    id: number;
    material: number;
    orderQuantity?: number;
  }>;
}

/**
 * Estado inicial del formulario con valores vacíos
 */
export const initialFormState: FormState = {
  lookup_code_order: '',
  reference_number: '',
  notes: '',
  order_type: '',
  order_class: '',
  warehouse: '',
  project: '',
  carrier: '',
  service_type: '',
  contact: '',
  expected_delivery_date: '',
  shipping_address: '',
  billing_address: '',
  selectedInventories: [],
};

/**
 * Tipo para las acciones de UPDATE_FIELD que asegura que el campo sea una clave
 * válida de FormState y el valor tenga el tipo correcto
 */
type UpdateFieldAction<K extends keyof FormState> = {
  type: 'UPDATE_FIELD';
  field: K;
  value: FormState[K];
};

/**
 * Acciones posibles para el reducer del formulario
 */
export type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: FormState[keyof FormState] }
  | { type: 'SET_INVENTORIES'; inventories: FormState['selectedInventories'] }
  | { type: 'SET_FORM_DATA'; data: Partial<FormState> };

/**
 * Reducer para manejar el estado del formulario de órdenes
 * @param state Estado actual del formulario
 * @param action Acción a ejecutar
 * @returns Nuevo estado del formulario
 */
export const formReducer = (
  state: FormState,
  action: FormAction
): FormState => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_INVENTORIES':
      return { ...state, selectedInventories: action.inventories };
    case 'SET_FORM_DATA':
      return { ...state, ...action.data };
    default:
      return state;
  }
};

/**
 * Para compatibilidad con código existente, mantenemos OrderFormState
 * Ahora extiende la interfaz de OrderFormData para mejor compatibilidad
 */
export interface OrderFormState extends Pick<OrderFormData, 'lookup_code_order' | 'order_type' | 'order_class'> {
  // Campos adicionales específicos para este componente pueden agregarse aquí
}

/**
 * Estado inicial para compatibilidad
 */
export const initialState: OrderFormState = {
  lookup_code_order: '',
  order_type: '',
  order_class: '',
};

/**
 * Creadores de acciones tipadas (action creators)
 * Facilitan la creación de acciones con tipado seguro
 */
export const updateField = <K extends keyof FormState>(field: K, value: FormState[K]): UpdateFieldAction<K> => ({
  type: 'UPDATE_FIELD',
  field,
  value,
});

export const setInventories = (inventories: FormState['selectedInventories']): FormAction => ({
  type: 'SET_INVENTORIES',
  inventories,
});

export const setFormData = (data: Partial<FormState>): FormAction => ({
  type: 'SET_FORM_DATA',
  data,
});