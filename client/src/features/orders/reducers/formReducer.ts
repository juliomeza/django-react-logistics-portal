export interface OrderFormState {
  lookup_code_order: string;
  order_type: string;
  order_class: string;
  // ...otros campos...
}

export const initialState: OrderFormState = {
  lookup_code_order: '',
  order_type: '',
  order_class: '',
  // ...otros campos con sus valores iniciales...
};

export interface FormState {
  lookup_code_order: string;
  reference_number: string;
  notes: string;
  order_type: string;
  order_class: string;
  warehouse: string;
  project: string;
  carrier: string;
  service_type: string;
  contact: string;
  expected_delivery_date: string;
  shipping_address: string;
  billing_address: string;
  selectedInventories: any[];
}

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

type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormState; value: any }
  | { type: 'SET_INVENTORIES'; inventories: any[] }
  | { type: 'SET_FORM_DATA'; data: Partial<FormState> };

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