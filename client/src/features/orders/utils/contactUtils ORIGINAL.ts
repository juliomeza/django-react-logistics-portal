import apiProtected from '../../../services/api/secureApi';

/**
 * Prepara los datos de una dirección para la API.
 */
export const prepareAddressData = (address: any, type: string): any => ({
  address_line_1: address.address_line_1 || '',
  address_line_2: address.address_line_2 || '',
  city: address.city || '',
  state: address.state || '',
  postal_code: address.postal_code || '',
  country: address.country || '',
  entity_type: 'recipient',
  address_type: type,
  notes: '',
});

/**
 * Prepara los datos de un contacto para la API.
 */
export const prepareContactData = (contact: any, addressIds: any[]): any => ({
  company_name: contact.company_name || '',
  contact_name: contact.contact_name || '',
  attention: contact.attention || '',
  phone: contact.phone || '',
  email: contact.email || '',
  mobile: contact.mobile || '',
  title: contact.title || '',
  notes: contact.notes || '',
  addresses: addressIds,
});

/**
 * Crea un nuevo contacto con sus direcciones asociadas.
 */
export const createContact = async (
  contactData: any,
  sameBillingAddress: boolean
): Promise<{ shippingId: any; billingId: any; newContactId: any }> => {
  console.log('Creating contact with data:', contactData);

  // 1. Crear shipping address
  const shippingAddressData = prepareAddressData(contactData.shipping_address, 'shipping');
  console.log('Sending shipping address:', shippingAddressData);
  const shippingResponse = await apiProtected.post('addresses/', shippingAddressData);
  const shippingId = shippingResponse.data.id;
  console.log('Created shipping address with ID:', shippingId);

  // 2. Crear billing address (o usar la misma si sameBillingAddress es true)
  let billingId: any;
  if (sameBillingAddress) {
    const billingData = { ...shippingAddressData, address_type: 'billing' };
    console.log('Using same address for billing with modifications:', billingData);
    const billingResponse = await apiProtected.post('addresses/', billingData);
    billingId = billingResponse.data.id;
  } else {
    const billingAddressData = prepareAddressData(contactData.billing_address, 'billing');
    console.log('Sending billing address:', billingAddressData);
    const billingResponse = await apiProtected.post('addresses/', billingAddressData);
    billingId = billingResponse.data.id;
  }
  console.log('Created billing address with ID:', billingId);

  // 3. Crear el contacto con las direcciones asociadas
  const formattedContactData = prepareContactData(contactData, [shippingId, billingId]);
  console.log('Sending contact data:', formattedContactData);
  const contactResponse = await apiProtected.post('contacts/', formattedContactData);
  const newContactId = contactResponse.data.id;
  console.log('Created contact with ID:', newContactId);

  return { shippingId, billingId, newContactId };
};

/**
 * Asigna un contacto a un proyecto.
 */
export const assignContactToProject = async (
  contactId: string,
  projectId: string,
  projects: any[]
): Promise<void> => {
  if (!projectId) {
    throw new Error('No project selected');
  }

  const selectedProject = projects.find((p: any) => p.id === projectId);
  if (!selectedProject) {
    throw new Error('Selected project not found');
  }

  console.log('Assigning contact', contactId, 'to project', projectId);
  
  // Añadir el nuevo contacto a la lista de contactos existentes
  const updatedContacts = [...(selectedProject.contacts || []), contactId];
  
  console.log('Updating project with contacts:', updatedContacts);
  await apiProtected.patch(`projects/${selectedProject.id}/`, { contacts: updatedContacts });
  
  console.log('Contact successfully assigned to project');
};
