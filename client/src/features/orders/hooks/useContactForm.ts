import { useState, ChangeEvent } from 'react';
import { buildContactOptions, createCustomFilterOptions } from '../utils/DeliveryInfoUtils';
import { createContact, assignContactToProject } from '../utils/contactUtils';

interface Address {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  entity_type: string;
  address_type: string;
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

interface UseContactFormProps {
  formData: any;
  handleChange: (event: { target: { name: string; value: any } }) => void;
  contacts?: any[];
  addresses?: any[];
  projects?: any[];
  refetchReferenceData: () => Promise<any>;
}

interface CreateContactResponse {
  shippingId: any;
  billingId: any;
  newContactId: any;
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
  const [modalErrors, setModalErrors] = useState<{ [key: string]: boolean | string }>({});

  const contactOptions = buildContactOptions(contacts, addresses);
  const customFilterOptions = createCustomFilterOptions();

  const selectedContact = formData.contact
    ? contactOptions.find((c: any) => c.id === formData.contact) || null
    : null;

  const selectedShippingAddress = formData.shipping_address
    ? addresses.find((a: any) => a.id === formData.shipping_address)
    : null;

  const selectedBillingAddress = formData.billing_address
    ? addresses.find((a: any) => a.id === formData.billing_address)
    : null;

  const updateFormData = (contactId: any, shippingId: any, billingId: any) => {
    handleChange({ target: { name: 'contact', value: contactId } });
    handleChange({ target: { name: 'shipping_address', value: shippingId } });
    handleChange({ target: { name: 'billing_address', value: billingId } });
  };

  const handleContactChange = (event: any, selectedOption: any) => {
    if (selectedOption?.isAddOption) {
      handleOpenModal();
      return;
    }
    
    if (!selectedOption) {
      updateFormData('', '', '');
      return;
    }

    updateFormData(selectedOption.id, '', '');

    if (selectedOption.addresses?.length > 0) {
      updateContactAddresses(selectedOption.addresses);
    }
  };

  const updateContactAddresses = (addressIds: any[]) => {
    const contactAddressList = addresses.filter((addr: any) =>
      addressIds.includes(addr.id)
    );
    const shippingAddr = contactAddressList.find((addr: any) => addr.address_type === 'shipping');
    const billingAddr = contactAddressList.find((addr: any) => addr.address_type === 'billing');
    
    if (shippingAddr) {
      handleChange({ target: { name: 'shipping_address', value: shippingAddr.id } });
    }
    
    if (billingAddr) {
      handleChange({ target: { name: 'billing_address', value: billingAddr.id } });
    }
  };

  const handleNewContactChange = (e: ChangeEvent<HTMLInputElement>, addressType: 'shipping_address' | 'billing_address' | null = null) => {
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
        [name as keyof ContactState]: value,
      }));
    }
    
    setModalErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSameAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const validateForm = () => {
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

  const validateAddress = (address: Address, prefix: string, errors: { [key: string]: boolean | string }) => {
    if (!address.address_line_1) errors[`${prefix}_address_line_1`] = true;
    if (!address.city) errors[`${prefix}_city`] = true;
    if (!address.state) errors[`${prefix}_state`] = true;
    if (!address.postal_code) errors[`${prefix}_postal_code`] = true;
    if (!address.country) errors[`${prefix}_country`] = true;
  };

  const handleOpenModal = () => {
    if (!formData.project) {
      setOpenWarningDialog(true);
      return;
    }
    setOpenModal(true);
  };

  const handleSaveNewContact = async () => {
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    try {
      const { shippingId, billingId, newContactId } = (await createContact(newContact, sameBillingAddress)) as CreateContactResponse;

      try {
        await assignContactToProject(newContactId, formData.project, projects);
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
        const errorMsg = error.response.data?.detail || 
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
