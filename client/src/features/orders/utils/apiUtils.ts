import apiProtected from '../../../services/api/secureApi';

// Manejar errores de API (ajustado para mantener el comportamiento original)
export const handleApiError = (error: any, defaultMessage: string): string => {
  const message: string = error.response?.data
    ? Object.entries(error.response.data)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join('\n')
    : defaultMessage;
  return message; // Retorna el mensaje en lugar de modificar el estado directamente
};

// Guardar líneas de orden
export const saveOrderLines = async (
  formData: any,
  orderId: any,
  setError: (msg: string) => void,
  setOpenSnackbar: (open: boolean) => void
): Promise<boolean> => {
  if (!Array.isArray(formData.selectedInventories) || formData.selectedInventories.length === 0) {
    setError('Please select at least one material before saving.');
    setOpenSnackbar(true);
    return false;
  }
  try {
    if (!orderId) {
      throw new Error('Order ID is not set. Cannot save materials.');
    }
    console.log('Saving lines with orderId:', orderId);
    console.log('Selected inventories:', formData.selectedInventories);

    await apiProtected.delete(`order-lines/order/${orderId}/clear/`);
    const orderLinePromises = formData.selectedInventories.map((item: any) => {
      const orderLineData = {
        order: orderId,
        material: item.material,
        quantity: item.orderQuantity || 1,
        license_plate: item.id,
      };
      return apiProtected.post('order-lines/', orderLineData);
    });
    await Promise.all(orderLinePromises);
    setError('Materials saved successfully');
    setOpenSnackbar(true);
    return true; // Éxito
  } catch (error: any) {
    console.error('Error saving lines:', error);
    const errorMessage = handleApiError(error, 'Failed to save materials. Please try again.');
    setError(errorMessage);
    setOpenSnackbar(true);
    return false; // Fallo
  }
};

// Obtener el primer estado de la orden
export const getFirstOrderStatus = async (): Promise<number> => {
  try {
    const response = await apiProtected.get('order-statuses/');
    const createdStatus = response.data.find((status: any) => status.status_name === 'Created');
    return createdStatus ? createdStatus.id : 1;
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return 1; // Valor por defecto
  }
};

// Obtener el estado "Submitted" de la orden
export const getSubmittedOrderStatus = async (): Promise<number> => {
  try {
    const response = await apiProtected.get('order-statuses/');
    const submittedStatus = response.data.find((status: any) => status.status_name === 'Submitted');
    return submittedStatus ? submittedStatus.id : 2;
  } catch (error) {
    console.error('Error fetching submitted status:', error);
    return 2; // Valor por defecto
  }
};
