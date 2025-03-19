// formReducer.ts

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
    // Otros campos que pueda necesitar tu aplicación
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
 * Acciones posibles para el reducer del formulario
 */
export type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: any }
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
 */
export interface OrderFormState {
  lookup_code_order: string;
  order_type: string;
  order_class: string;
  // Puede contener otros campos según sea necesario
}

export const initialState: OrderFormState = {
  lookup_code_order: '',
  order_type: '',
  order_class: '',
  // Otros campos con sus valores iniciales
};