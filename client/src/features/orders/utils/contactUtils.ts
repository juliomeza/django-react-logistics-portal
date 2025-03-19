import apiProtected from '../../../services/api/secureApi';
import { Address, Contact } from '../../../types/logistics';

/**
 * Tipos para datos parciales usados en formularios
 */
export interface AddressFormData {
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
}

export interface ContactFormData {
  company_name?: string;
  contact_name?: string;
  attention?: string;
  phone?: string;
  email?: string;
  mobile?: string;
  title?: string;
  notes?: string;
  shipping_address?: AddressFormData;
  billing_address?: AddressFormData;
}

export type AddressType = 'shipping' | 'billing';
export type EntityType = 'recipient' | 'enterprise' | 'warehouse';

/**
 * Tipo para los datos de dirección preparados para la API
 */
export interface PreparedAddressData {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  entity_type: EntityType;
  address_type: AddressType;
  notes: string;
}

/**
 * Tipo para los datos de contacto preparados para la API
 */
export interface PreparedContactData {
  company_name: string;
  contact_name: string;
  attention: string;
  phone: string;
  email: string;
  mobile: string;
  title: string;
  notes: string;
  addresses: number[];
}

/**
 * Respuesta de la creación de contacto
 */
export interface ContactCreationResult {
  shippingId: number;
  billingId: number;
  newContactId: number;
}

/**
 * Prepara los datos de una dirección para la API.
 */
export const prepareAddressData = (
  address: AddressFormData, 
  type: AddressType,
  entityType: EntityType = 'recipient'
): PreparedAddressData => ({
  address_line_1: address.address_line_1 || '',
  address_line_2: address.address_line_2 || '',
  city: address.city || '',
  state: address.state || '',
  postal_code: address.postal_code || '',
  country: address.country || '',
  entity_type: entityType,
  address_type: type,
  notes: address.notes || '',
});

/**
 * Prepara los datos de un contacto para la API.
 */
export const prepareContactData = (
  contact: ContactFormData, 
  addressIds: number[]
): PreparedContactData => ({
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
  contactData: ContactFormData,
  sameBillingAddress: boolean
): Promise<ContactCreationResult> => {
  console.log('Creating contact with data:', contactData);

  // 1. Crear shipping address
  const shippingAddressData = prepareAddressData(
    contactData.shipping_address || {}, 
    'shipping'
  );
  console.log('Sending shipping address:', shippingAddressData);
  const shippingResponse = await apiProtected.post<Address>('addresses/', shippingAddressData);
  const shippingId = shippingResponse.data.id;
  console.log('Created shipping address with ID:', shippingId);

  // 2. Crear billing address (o usar la misma si sameBillingAddress es true)
  let billingId: number;
  if (sameBillingAddress) {
    const billingData = { ...shippingAddressData, address_type: 'billing' as const };
    console.log('Using same address for billing with modifications:', billingData);
    const billingResponse = await apiProtected.post<Address>('addresses/', billingData);
    billingId = billingResponse.data.id;
  } else {
    const billingAddressData = prepareAddressData(
      contactData.billing_address || {}, 
      'billing'
    );
    console.log('Sending billing address:', billingAddressData);
    const billingResponse = await apiProtected.post<Address>('addresses/', billingAddressData);
    billingId = billingResponse.data.id;
  }
  console.log('Created billing address with ID:', billingId);

  // 3. Crear el contacto con las direcciones asociadas
  const formattedContactData = prepareContactData(contactData, [shippingId, billingId]);
  console.log('Sending contact data:', formattedContactData);
  const contactResponse = await apiProtected.post<Contact>('contacts/', formattedContactData);
  const newContactId = contactResponse.data.id;
  console.log('Created contact with ID:', newContactId);

  return { shippingId, billingId, newContactId };
};

/**
 * Tipo para un proyecto con contactos
 */
export interface ProjectWithContacts {
  id: string | number;
  contacts?: (string | number)[];
  [key: string]: any;
}

/**
 * Asigna un contacto a un proyecto.
 */
export const assignContactToProject = async (
  contactId: string | number,
  projectId: string | number,
  projects: ProjectWithContacts[]
): Promise<void> => {
  if (!projectId) {
    throw new Error('No project selected');
  }

  const selectedProject = projects.find((p) => String(p.id) === String(projectId));
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