import { useState, ChangeEvent } from 'react';
import { buildContactOptions, createCustomFilterOptions, ContactOption, FilteredOption, AddressDisplay } from '../utils/DeliveryInfoUtils';
import { createContact, assignContactToProject, ProjectWithContacts as ApiProjectWithContacts } from '../utils/contactUtils';
import { Contact, Address } from '../../../types/logistics';
import { Project } from '../../../types/enterprise';
import { OrderFormData } from '../../../types/orders';

// Heredamos de las interfaces existentes para garantizar consistencia
export interface ContactFormAddress extends Omit<Address, 'id' | 'created_date' | 'modified_date' | 'notes'> {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  entity_type: 'enterprise' | 'warehouse' | 'recipient';
  address_type: 'shipping' | 'billing';
}

export interface ContactState extends Omit<Contact, 'id' | 'created_date' | 'modified_date' | 'addresses'> {
  company_name: string;
  contact_name: string;
  attention: string;
  phone: string;
  email: string;
  mobile: string;
  title: string;
  notes: string;
  shipping_address: ContactFormAddress;
  billing_address: ContactFormAddress;
}

// Tipo específico para los errores del formulario con valores posibles
export interface FormErrors {
  company_name?: boolean | string;
  contact_name?: boolean | string;
  phone?: boolean | string;
  email?: boolean | string;
  shipping_address_address_line_1?: boolean | string;
  shipping_address_city?: boolean | string;
  shipping_address_state?: boolean | string;
  shipping_address_postal_code?: boolean | string;
  shipping_address_country?: boolean | string;
  billing_address_address_line_1?: boolean | string;
  billing_address_city?: boolean | string;
  billing_address_state?: boolean | string;
  billing_address_postal_code?: boolean | string;
  billing_address_country?: boolean | string;
  general?: string;
  [key: string]: boolean | string | undefined;
}

// Lista de claves conocidas en ContactState para validación segura
const contactStateKeys: Array<keyof ContactState> = [
  'company_name', 'contact_name', 'attention', 'phone', 
  'email', 'mobile', 'title', 'notes',
  'shipping_address', 'billing_address'
];

// Lista de claves conocidas en ContactFormAddress para validación segura
const addressKeys: Array<keyof ContactFormAddress> = [
  'address_line_1', 'address_line_2', 'city', 'state',
  'postal_code', 'country', 'entity_type', 'address_type'
];

const initialContactState: ContactState = {
  company_name: '',
  contact_name: '',
  attention: '',
  phone: '',
  email: '',
  mobile: '',
  title: '',
  notes: '',
  shipping_address: {
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    entity_type: 'recipient',
    address_type: 'shipping',
  },
  billing_address: {
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    entity_type: 'recipient',
    address_type: 'billing',
  },
};

// Tipado más específico para los props
interface UseContactFormProps {
  formData: OrderFormData;
  handleChange: (event: { target: { name: string; value: any } }) => void;
  contacts?: Contact[];
  addresses?: Address[];
  projects?: Project[];
  refetchReferenceData: () => Promise<void>;
}

// Interfaz específica para la respuesta de la API al crear un contacto
interface CreateContactResponse {
  shippingId: number;
  billingId: number;
  newContactId: number;
}

export const useContactForm = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  projects = [],
  refetchReferenceData,
}: UseContactFormProps) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openWarningDialog, setOpenWarningDialog] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<ContactState>(initialContactState);
  const [sameBillingAddress, setSameBillingAddress] = useState<boolean>(true);
  const [modalErrors, setModalErrors] = useState<FormErrors>({});

  // Preservamos la estructura original de los datos mientras aplicamos el typecast
  // Esto mantiene la funcionalidad visual mientras corrige los errores de tipo
  const contactOptions = buildContactOptions(
    contacts as unknown as ContactOption[],
    addresses as unknown as AddressDisplay[]
  );
  
  const customFilterOptions = createCustomFilterOptions();

  const selectedContact = formData.contact
    ? contactOptions.find((c) => c.id === formData.contact) || null
    : null;

  const selectedShippingAddress = formData.shipping_address
    ? addresses.find((a: Address) => a.id === Number(formData.shipping_address))
    : null;

  const selectedBillingAddress = formData.billing_address
    ? addresses.find((a: Address) => a.id === Number(formData.billing_address))
    : null;

  // Tipado más específico para los argumentos
  const updateFormData = (
    contactId: string | number | null, 
    shippingId: string | number | null, 
    billingId: string | number | null
  ): void => {
    handleChange({ target: { name: 'contact', value: contactId } });
    handleChange({ target: { name: 'shipping_address', value: shippingId } });
    handleChange({ target: { name: 'billing_address', value: billingId } });
  };

  const handleContactChange = (event: React.SyntheticEvent, selectedOption: FilteredOption | null): void => {
    if (selectedOption?.isAddOption) {
      handleOpenModal();
      return;
    }
    
    if (!selectedOption) {
      updateFormData(null, null, null);
      return;
    }

    updateFormData(selectedOption.id, null, null);

    if (selectedOption.addresses && selectedOption.addresses.length > 0) {
      updateContactAddresses(selectedOption.addresses as number[]);
    }
  };

  const updateContactAddresses = (addressIds: number[]): void => {
    const contactAddressList = addresses.filter((addr: Address) =>
      addressIds.includes(addr.id)
    );
    const shippingAddr = contactAddressList.find((addr: Address) => addr.address_type === 'shipping');
    const billingAddr = contactAddressList.find((addr: Address) => addr.address_type === 'billing');
    
    if (shippingAddr) {
      handleChange({ target: { name: 'shipping_address', value: shippingAddr.id } });
    }
    
    if (billingAddr) {
      handleChange({ target: { name: 'billing_address', value: billingAddr.id } });
    }
  };

  const handleNewContactChange = (
    e: ChangeEvent<HTMLInputElement>, 
    addressType: 'shipping_address' | 'billing_address' | null = null
  ): void => {
    const { name, value } = e.target;
    
    if (addressType) {
      // Verificar si el nombre es una clave válida para ContactFormAddress
      if (addressKeys.includes(name as keyof ContactFormAddress)) {
        setNewContact((prev) => ({
          ...prev,
          [addressType]: { ...prev[addressType], [name]: value },
        }));

        if (addressType === 'shipping_address' && sameBillingAddress) {
          setNewContact((prev) => ({
            ...prev,
            billing_address: { ...prev.billing_address, [name]: value },
          }));
        }
      }
    } else {
      // Verificar si el nombre es una clave válida para ContactState
      if (contactStateKeys.includes(name as keyof ContactState)) {
        setNewContact((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    
    // Limpiar el error correspondiente
    setModalErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSameAddressChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const checked = e.target.checked;
    setSameBillingAddress(checked);
    
    if (checked) {
      setNewContact((prev) => ({
        ...prev,
        billing_address: {
          ...prev.shipping_address,
          address_type: 'billing',
        },
      }));
    } else {
      setNewContact((prev) => ({
        ...prev,
        billing_address: {
          ...initialContactState.billing_address,
        },
      }));
    }
  };

  // Retorno tipado para la función de validación
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!newContact.company_name) errors.company_name = true;
    if (!newContact.contact_name) errors.contact_name = true;
    if (!newContact.phone) errors.phone = true;
    
    validateAddress(newContact.shipping_address, 'shipping_address', errors);
    
    if (!sameBillingAddress) {
      validateAddress(newContact.billing_address, 'billing_address', errors);
    }
    
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Tipado específico para los errores
  const validateAddress = (
    address: ContactFormAddress, 
    prefix: string, 
    errors: FormErrors
  ): void => {
    if (!address.address_line_1) errors[`${prefix}_address_line_1`] = true;
    if (!address.city) errors[`${prefix}_city`] = true;
    if (!address.state) errors[`${prefix}_state`] = true;
    if (!address.postal_code) errors[`${prefix}_postal_code`] = true;
    if (!address.country) errors[`${prefix}_country`] = true;
  };

  const handleOpenModal = (): void => {
    if (!formData.project) {
      setOpenWarningDialog(true);
      return;
    }
    setOpenModal(true);
  };

  const handleSaveNewContact = async (): Promise<void> => {
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    try {
      const result = await createContact(newContact, sameBillingAddress);
      const { shippingId, billingId, newContactId } = result as CreateContactResponse;

      try {
        if (formData.project) {
          // Tipado seguro para la conversión de proyectos
          const projectsWithContacts: ApiProjectWithContacts[] = projects.map(project => ({
            id: project.id,
            contacts: Array.isArray(project.contacts) 
              ? project.contacts.map(contact => 
                  typeof contact === 'object' && contact !== null ? contact.id : contact
                )
              : []
          }));

          await assignContactToProject(newContactId, Number(formData.project), projectsWithContacts);
        } else {
          throw new Error('No project selected');
        }
      } catch (error) {
        console.warn('Error al asignar contacto al proyecto:', error);
        setModalErrors({ general: 'Contact created, but could not be assigned to project' });
      }

      updateFormData(newContactId, shippingId, billingId);

      await refetchReferenceData();

      setOpenModal(false);
      setNewContact(initialContactState);

    } catch (error: unknown) {
      console.error('Error in save process:', error);
      
      // Manejo tipado de errores más específico
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: any, status?: number } };
        
        const errorMsg = apiError.response?.data?.detail || 
                        (apiError.response?.data ? JSON.stringify(apiError.response.data) : null) || 
                        'Unknown error';
                        
        console.error('API error details:', apiError.response);
        setModalErrors({ general: `Failed to save: ${errorMsg}` });
      } else {
        setModalErrors({ general: 'Failed to save: Network or server error' });
      }
    }
  };

  return {
    openModal,
    openWarningDialog,
    newContact,
    sameBillingAddress,
    modalErrors,
    contactOptions,
    customFilterOptions,
    selectedContact,
    selectedShippingAddress,
    selectedBillingAddress,
    handleContactChange,
    handleNewContactChange,
    handleSameAddressChange,
    handleOpenModal,
    handleSaveNewContact,
    setOpenModal,
    setOpenWarningDialog,
  };
};

export default useContactForm;