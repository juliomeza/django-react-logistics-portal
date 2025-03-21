import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Paper, Typography, TextField, Box, FormControlLabel, Checkbox } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddressFormFields from './AddressFormFields';

/**
 * Estructura de datos de dirección
 */
interface AddressData {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Estructura de datos para un nuevo contacto
 */
interface NewContact {
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  shipping_address: AddressData;
  billing_address: AddressData;
}

/**
 * Estructura de errores del formulario modal
 */
interface ModalErrors {
  [key: string]: string | boolean | undefined;
  general?: string;
  company_name?: string | boolean;
  contact_name?: string | boolean;
  phone?: string | boolean;
  email?: string | boolean;
}

/**
 * Props para el componente de formulario modal de contacto
 */
interface ContactFormModalProps {
  /**
   * Estado de apertura del modal
   */
  open: boolean;
  
  /**
   * Manejador para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Datos del nuevo contacto
   */
  newContact: NewContact;
  
  /**
   * Errores de validación del formulario
   */
  modalErrors: ModalErrors;
  
  /**
   * Indica si la dirección de facturación es la misma que la de envío
   */
  sameBillingAddress: boolean;
  
  /**
   * Manejador de cambios en campos de texto
   */
  handleNewContactChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, addressType?: string) => void;
  
  /**
   * Manejador para cambiar el estado del checkbox de misma dirección
   */
  handleSameAddressChange: (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  
  /**
   * Manejador para guardar el nuevo contacto
   */
  handleSaveNewContact: () => void;
}

/**
 * Componente para el formulario modal de creación de contactos
 */
const ContactFormModal: React.FC<ContactFormModalProps> = ({
  open,
  onClose,
  newContact,
  modalErrors,
  sameBillingAddress,
  handleNewContactChange,
  handleSameAddressChange,
  handleSaveNewContact
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Contact</DialogTitle>
      <DialogContent>
        {/* Información de contacto */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Company Name *"
                name="company_name"
                value={newContact.company_name}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.company_name}
                helperText={modalErrors.company_name ? 'Required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Contact Name *"
                name="contact_name"
                value={newContact.contact_name}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.contact_name}
                helperText={modalErrors.contact_name ? 'Required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Phone *"
                name="phone"
                value={newContact.phone}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.phone}
                helperText={modalErrors.phone ? 'Required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email"
                name="email"
                value={newContact.email}
                onChange={handleNewContactChange}
                fullWidth
                error={!!modalErrors.email}
                helperText={modalErrors.email ? 'Required' : ''}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Dirección de envío */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Shipping Address
          </Typography>
          <AddressFormFields 
            addressType="shipping_address" 
            addressData={newContact.shipping_address}
            onChange={handleNewContactChange}
            errors={modalErrors}
          />
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameBillingAddress}
                  onChange={handleSameAddressChange}
                  name="sameAddress"
                  color="primary"
                />
              }
              label="Billing address is the same as shipping address"
            />
          </Box>
        </Paper>

        {/* Dirección de facturación (se muestra solo si no es la misma que shipping) */}
        {!sameBillingAddress && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Billing Address
            </Typography>
            <AddressFormFields 
              addressType="billing_address" 
              addressData={newContact.billing_address}
              onChange={handleNewContactChange}
              errors={modalErrors}
            />
          </Paper>
        )}
        
        {modalErrors.general && (
          <Typography color="error" sx={{ mt: 2 }}>
            {modalErrors.general}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveNewContact} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactFormModal;