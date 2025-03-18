export interface OrderFormData {
  order_type?: string;
  order_class?: string;
  order_status?: number;
  // agrega aquí otros campos según corresponda...
  [key: string]: any;
}

export interface OrderValidationErrors {
  [field: string]: boolean;
}
