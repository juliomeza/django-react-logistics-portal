import { useState, ChangeEvent } from 'react';
import { 
  buildContactOptions, 
  createCustomFilterOptions, 
  type ContactOption as UtilsContactOption, 
  type AddressDisplay 
} from '../utils/DeliveryInfoUtils';
import { createContact, assignContactToProject } from '../utils/contactUtils';

export interface Address {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  entity_type: string;
  address_type: string;
}

export interface AddressData extends Address {
  id: string | number;
}

export interface ContactState {
  company_name: string;
  contact_name: string;
  attention: string;
  phone: string;
  email: string;
  mobile: string;
  title: string;
  notes: string;
  shipping_address: Address;
  billing_address: Address;
}

export const initialContactState: ContactState = {
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

// Extiende el tipo importado para incluir la propiedad opcional "label"
export interface ExtendedContactOption extends UtilsContactOption {
  label?: string;
}

export interface ContactFormData {
  contact?: string | number;
  shipping_address?: string | number;
  billing_address?: string | number;
  project?: string | number;
  [key: string]: any;
}

export interface ContactFormChangeEvent {
  target: {
    name: string;
    value: any;
  };
}

export interface Project {
  id: string | number;
  // Otros campos si son necesarios
}

// Extendemos Project para que se ajuste al tipo que espera assignContactToProject
export interface ProjectWithContacts extends Project {
  [key: string]: any;
}

export interface CreateContactResponse {
  shippingId: string | number;
  billingId: string | number;
  newContactId: string | number;
}

export interface UseContactFormProps {
  formData: ContactFormData;
  handleChange: (event: ContactFormChangeEvent) => void;
  contacts?: ExtendedContactOption[];
  addresses?: AddressData[];
  projects?: Project[];
  refetchReferenceData: () => Promise<any>;
}

export interface UseContactFormReturn {
  openModal: boolean;
  openWarningDialog: boolean;
  newContact: ContactState;
  sameBillingAddress: boolean;
  modalErrors: { [key: string]: boolean | string };
  contactOptions: ExtendedContactOption[];
  customFilterOptions: any; // Estructura interna desconocida
  selectedContact: ExtendedContactOption | null;
  selectedShippingAddress: AddressData | null;
  selectedBillingAddress: AddressData | null;
  handleContactChange: (event: unknown, selectedOption: ExtendedContactOption | null) => void;
  handleNewContactChange: (
    e: ChangeEvent<HTMLInputElement>,
    addressType?: 'shipping_address' | 'billing_address' | null
  ) => void;
  handleSameAddressChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleOpenModal: () => void;
  handleSaveNewContact: () => Promise<void>;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenWarningDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useContactForm = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  projects = [],
  refetchReferenceData,
}: UseContactFormProps): UseContactFormReturn => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openWarningDialog, setOpenWarningDialog] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<ContactState>(initialContactState);
  const [sameBillingAddress, setSameBillingAddress] = useState<boolean>(true);
  const [modalErrors, setModalErrors] = useState<{ [key: string]: boolean | string }>({});

  // Se fuerza que buildContactOptions retorne ExtendedContactOption[] y se castea addresses a AddressDisplay[]
  const contactOptions = buildContactOptions(contacts, addresses as unknown as AddressDisplay[]) as ExtendedContactOption[];
  const customFilterOptions = createCustomFilterOptions();

  const selectedContact: ExtendedContactOption | null = formData.contact
    ? contactOptions.find((c) => c.id === formData.contact) || null
    : null;

  const selectedShippingAddress: AddressData | null = formData.shipping_address
    ? addresses.find((a) => a.id === formData.shipping_address) || null
    : null;

  const selectedBillingAddress: AddressData | null = formData.billing_address
    ? addresses.find((a) => a.id === formData.billing_address) || null
    : null;

  const updateFormData = (contactId: string | number, shippingId: string | number, billingId: string | number): void => {
    handleChange({ target: { name: 'contact', value: contactId } });
    handleChange({ target: { name: 'shipping_address', value: shippingId } });
    handleChange({ target: { name: 'billing_address', value: billingId } });
  };

  const handleContactChange = (event: unknown, selectedOption: ExtendedContactOption | null): void => {
    if (selectedOption?.isAddOption) {
      handleOpenModal();
      return;
    }
    
    if (!selectedOption) {
      updateFormData('', '', '');
      return;
    }

    updateFormData(selectedOption.id, '', '');

    if (selectedOption.addresses && selectedOption.addresses.length > 0) {
      updateContactAddresses(
        selectedOption.addresses.map(addr =>
          typeof addr === 'object'
            ? (addr as { id: string | number; address_type: string }).id
            : addr
        )
      );
    }
  };

  const updateContactAddresses = (addressIds: Array<string | number>): void => {
    const contactAddressList = addresses.filter((addr) =>
      addressIds.includes(addr.id)
    );
    const shippingAddr = contactAddressList.find((addr) => addr.address_type === 'shipping');
    const billingAddr = contactAddressList.find((addr) => addr.address_type === 'billing');
    
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
    } else {
      setNewContact((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
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

  const validateForm = (): boolean => {
    const errors: { [key: string]: boolean | string } = {};
    
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

  const validateAddress = (address: Address, prefix: string, errors: { [key: string]: boolean | string }): void => {
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
      const { shippingId, billingId, newContactId } = (await createContact(newContact, sameBillingAddress)) as CreateContactResponse;

      try {
        await assignContactToProject(newContactId, formData.project!, projects as ProjectWithContacts[]);
      } catch (error) {
        console.warn('Error al asignar contacto al proyecto:', error);
        setModalErrors({ general: 'Contact created, but could not be assigned to project' });
      }

      updateFormData(newContactId, shippingId, billingId);

      await refetchReferenceData();

      setOpenModal(false);
      setNewContact(initialContactState);

    } catch (error: any) {
      console.error('Error in save process:', error);
      
      if (error.response) {
        const errorMsg =
          error.response.data?.detail ||
          JSON.stringify(error.response.data) ||
          'Unknown error';
        console.error('API error details:', error.response);
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
