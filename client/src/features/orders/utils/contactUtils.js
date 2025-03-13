import apiProtected from '../../../services/api/secureApi';

/**
 * Prepara los datos de una dirección para la API
 * 
 * @param {Object} address - Datos de la dirección
 * @param {string} type - Tipo de dirección ('shipping' o 'billing')
 * @returns {Object} - Datos formateados para la API
 */
export const prepareAddressData = (address, type) => ({
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
 * Prepara los datos de un contacto para la API
 * 
 * @param {Object} contact - Datos del contacto
 * @param {Array} addressIds - IDs de las direcciones asociadas
 * @returns {Object} - Datos formateados para la API
 */
export const prepareContactData = (contact, addressIds) => ({
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
 * Crea un nuevo contacto con sus direcciones asociadas
 * 
 * @param {Object} contactData - Datos del contacto a crear
 * @param {boolean} sameBillingAddress - Indica si la dirección de facturación es la misma que la de envío
 * @returns {Promise<Object>} - Objeto con los IDs del contacto y direcciones creadas
 */
export const createContact = async (contactData, sameBillingAddress) => {
  console.log('Creating contact with data:', contactData);
  
  // 1. Crear shipping address
  const shippingAddressData = prepareAddressData(contactData.shipping_address, 'shipping');
  console.log('Sending shipping address:', shippingAddressData);
  const shippingResponse = await apiProtected.post('addresses/', shippingAddressData);
  const shippingId = shippingResponse.data.id;
  console.log('Created shipping address with ID:', shippingId);

  // 2. Crear billing address (o usar la misma si sameBillingAddress es true)
  let billingId;
  if (sameBillingAddress) {
    // Crear una copia de la dirección de envío pero marcada como facturación
    const billingData = {...shippingAddressData, address_type: 'billing'};
    console.log('Using same address for billing with modifications:', billingData);
    const billingResponse = await apiProtected.post('addresses/', billingData);
    billingId = billingResponse.data.id;
  } else {
    // Crear una dirección de facturación diferente
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
 * Asigna un contacto a un proyecto
 * 
 * @param {string} contactId - ID del contacto a asignar
 * @param {string} projectId - ID del proyecto al que asignar el contacto
 * @param {Array} projects - Lista de proyectos disponibles
 * @returns {Promise<void>}
 */
export const assignContactToProject = async (contactId, projectId, projects) => {
  if (!projectId) {
    throw new Error('No project selected');
  }

  const selectedProject = projects.find((p) => p.id === projectId);
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