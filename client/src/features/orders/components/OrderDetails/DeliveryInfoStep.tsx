import React from 'react';
import { Paper, Typography, TextField, Autocomplete, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { formatDateForInput } from '../../utils/DeliveryInfoUtils';
import { useContactForm } from '../../hooks/useContactForm';
import AddressDisplay from '../DeliveryInfo/AddressDisplay';
import ProjectWarningDialog from '../DeliveryInfo/ProjectWarningDialog';
import ContactFormModal from '../Contacts/ContactFormModal';
import { OrderFormData } from '../../../../types/orders';
import { Project } from '../../../../types/enterprise';
import { Contact, Address } from '../../../../types/logistics';

// No definimos nuestra propia interfaz ContactOption
// para evitar conflictos con la que está en DeliveryInfoUtils

interface DeliveryInfoStepProps {
  formData: Pick<OrderFormData, 'expected_delivery_date' | 'contact' | 'shipping_address' | 'billing_address'>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  contacts?: Contact[];
  addresses?: Address[];
  formErrors?: Record<string, boolean>;
  projects?: Project[];
  user: {
    id: number;
    username: string;
    [key: string]: any;
  };
  isOrderLocked: boolean;
  refetchReferenceData: () => void;
}

const DeliveryInfoStep: React.FC<DeliveryInfoStepProps> = ({
  formData,
  handleChange,
  contacts = [],
  addresses = [],
  formErrors = {},
  projects = [],
  user,
  isOrderLocked,
  refetchReferenceData,
}) => {
  const {
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
    handleSaveNewContact,
    setOpenModal,
    setOpenWarningDialog,
  } = useContactForm({
    formData,
    // Adaptamos handleChange para que tenga la firma esperada por el hook:
    handleChange: (event) => handleChange(event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>),
    contacts,
    addresses,
    projects,
    // Convertimos refetchReferenceData a una función que retorne Promise<any> sin cambiar su lógica:
    refetchReferenceData: async () => {
      refetchReferenceData();
      return Promise.resolve();
    },
  });

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Delivery Information
      </Typography>
      
      <Grid container spacing={2}>
        {/* Campo de fecha de entrega */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="expected_delivery_date"
            label="Expected Delivery Date"
            name="expected_delivery_date"
            type="date"
            value={formatDateForInput(formData.expected_delivery_date)}
            onChange={handleChange}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
            disabled={isOrderLocked}
          />
        </Grid>
        
        {/* Selección de contacto */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Autocomplete
            id="contact"
            options={contactOptions}
            value={selectedContact}
            onChange={handleContactChange}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option?.label || '';
            }}
            renderOption={(props, option) => {
              // Extraemos key y nos quedamos con el resto de props
              const { key, ...otherProps } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };
              if (option.isAddOption) {
                return (
                  <li key={typeof option.id === 'number' ? option.id.toString() : option.id} {...otherProps} style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      + {option.label}
                    </Box>
                  </li>
                );
              }
              return <li key={typeof option.id === 'number' ? option.id.toString() : option.id} {...otherProps}>{option.label}</li>;
            }}
            filterOptions={customFilterOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Company or Contact *"
                error={!!formErrors.contact}
                helperText={formErrors.contact ? 'This field is required' : undefined}
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            disabled={isOrderLocked}
          />
        </Grid>

        {/* Dirección de envío */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AddressDisplay
            title="Shipping Address *"
            address={selectedShippingAddress}
            error={!!formErrors.shipping_address}
          />
        </Grid>

        {/* Dirección de facturación */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AddressDisplay
            title="Billing Address *"
            address={selectedBillingAddress}
            error={!!formErrors.billing_address}
          />
        </Grid>
      </Grid>

      {/* Modal para añadir contacto */}
      <ContactFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        newContact={newContact}
        modalErrors={modalErrors}
        sameBillingAddress={sameBillingAddress}
        handleNewContactChange={handleNewContactChange as any}
        handleSameAddressChange={handleSameAddressChange}
        handleSaveNewContact={handleSaveNewContact}
      />

      {/* Diálogo de advertencia de proyecto */}
      <ProjectWarningDialog
        open={openWarningDialog}
        onClose={() => setOpenWarningDialog(false)}
      />
    </Paper>
  );
};

export default DeliveryInfoStep;