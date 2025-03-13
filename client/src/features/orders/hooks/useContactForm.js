import { useState } from 'react';
import { buildContactOptions, createCustomFilterOptions } from '../utils/DeliveryInfoUtils';
import { createContact, assignContactToProject } from '../utils/contactUtils';

/**
 * Estado inicial para un nuevo contacto
 */
const initialContactState = {
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

/**
 * Hook personalizado para manejar la lógica del formulario de contactos
 */
export const useContactForm = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  projects = [],
  refetchReferenceData
}) => {
  // Estado local
  const [openModal, setOpenModal] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [newContact, setNewContact] = useState(initialContactState);
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  const [modalErrors, setModalErrors] = useState({});

  // Opciones y filtros para la selección de contactos
  const contactOptions = buildContactOptions(contacts, addresses);
  const customFilterOptions = createCustomFilterOptions();

  // Datos seleccionados del formulario
  const selectedContact = formData.contact
    ? contactOptions.find((c) => c.id === formData.contact) || null
    : null;

  const selectedShippingAddress = formData.shipping_address
    ? addresses.find((a) => a.id === formData.shipping_address)
    : null;

  const selectedBillingAddress = formData.billing_address
    ? addresses.find((a) => a.id === formData.billing_address)
    : null;

  /**
   * Actualiza el estado del formulario con nuevos valores de contacto y direcciones
   */
  const updateFormData = (contactId, shippingId, billingId) => {
    handleChange({ target: { name: 'contact', value: contactId } });
    handleChange({ target: { name: 'shipping_address', value: shippingId } });
    handleChange({ target: { name: 'billing_address', value: billingId } });
  };

  /**
   * Maneja el cambio de contacto en el Autocomplete
   */
  const handleContactChange = (event, selectedOption) => {
    // Si se selecciona la opción "Add New Contact"
    if (selectedOption?.isAddOption) {
      handleOpenModal();
      return;
    }
    
    // Limpiar selección si no hay opción
    if (!selectedOption) {
      updateFormData('', '', '');
      return;
    }

    // Actualizar contacto seleccionado
    updateFormData(selectedOption.id, '', '');

    // Buscar y actualizar direcciones si existen
    if (selectedOption.addresses?.length > 0) {
      updateContactAddresses(selectedOption.addresses);
    }
  };

  /**
   * Actualiza las direcciones basadas en la lista de direcciones del contacto
   */
  const updateContactAddresses = (addressIds) => {
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

  /**
   * Maneja los cambios en el formulario de nuevo contacto
   */
  const handleNewContactChange = (e, addressType = null) => {
    const { name, value } = e.target;
    
    if (addressType) {
      setNewContact((prev) => ({
        ...prev,
        [addressType]: { ...prev[addressType], [name]: value },
      }));

      // Si se cambió shipping_address y el checkbox de misma dirección está marcado,
      // actualizar también billing_address
      if (addressType === 'shipping_address' && sameBillingAddress) {
        setNewContact((prev) => ({
          ...prev,
          billing_address: { ...prev.billing_address, [name]: value },
        }));
      }
    } else {
      setNewContact((prev) => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error si existe
    setModalErrors((prev) => ({ ...prev, [name]: false }));
  };

  /**
   * Maneja el cambio en la opción "Same as shipping address"
   */
  const handleSameAddressChange = (e) => {
    const checked = e.target.checked;
    setSameBillingAddress(checked);
    
    if (checked) {
      // Copiar campos de shipping a billing
      setNewContact((prev) => ({
        ...prev,
        billing_address: {
          ...prev.shipping_address,
          address_type: 'billing',
        },
      }));
    } else {
      // Resetear campos de billing
      setNewContact((prev) => ({
        ...prev,
        billing_address: {
          ...initialContactState.billing_address,
        },
      }));
    }
  };

  /**
   * Validación del formulario de nuevo contacto
   */
  const validateForm = () => {
    const errors = {};
    
    // Validación de campos básicos
    if (!newContact.company_name) errors.company_name = true;
    if (!newContact.contact_name) errors.contact_name = true;
    if (!newContact.phone) errors.phone = true;
    
    // Validar shipping_address
    validateAddress(newContact.shipping_address, 'shipping_address', errors);
    
    // Validar billing_address solo si no es la misma que shipping
    if (!sameBillingAddress) {
      validateAddress(newContact.billing_address, 'billing_address', errors);
    }
    
    setModalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Función auxiliar para validar direcciones
   */
  const validateAddress = (address, prefix, errors) => {
    if (!address.address_line_1) errors[`${prefix}_address_line_1`] = true;
    if (!address.city) errors[`${prefix}_city`] = true;
    if (!address.state) errors[`${prefix}_state`] = true;
    if (!address.postal_code) errors[`${prefix}_postal_code`] = true;
    if (!address.country) errors[`${prefix}_country`] = true;
  };

  /**
   * Abre el modal para añadir un nuevo contacto
   */
  const handleOpenModal = () => {
    if (!formData.project) {
      setOpenWarningDialog(true);
      return;
    }
    setOpenModal(true);
  };

  /**
   * Guarda un nuevo contacto
   */
  const handleSaveNewContact = async () => {
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }

    try {
      // Crear contacto con direcciones
      const { shippingId, billingId, newContactId } = await createContact(newContact, sameBillingAddress);

      // Asignar al proyecto
      try {
        await assignContactToProject(newContactId, formData.project, projects);
      } catch (error) {
        console.warn('Error al asignar contacto al proyecto:', error);
        setModalErrors({ general: 'Contact created, but could not be assigned to project' });
      }

      // Actualizar formData
      updateFormData(newContactId, shippingId, billingId);

      // Refrescar datos
      await refetchReferenceData();

      // Reiniciar y cerrar
      setOpenModal(false);
      setNewContact(initialContactState);

    } catch (error) {
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
