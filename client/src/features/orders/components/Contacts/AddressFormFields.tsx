import React from 'react';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';

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
 * Props para el componente de campos del formulario de dirección
 */
interface AddressFormFieldsProps {
  /**
   * Tipo de dirección (ej: 'shipping_address', 'billing_address')
   */
  addressType: string;
  
  /**
   * Datos de la dirección actual
   */
  addressData: AddressData;
  
  /**
   * Manejador de cambios para los campos
   */
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, addressType: string) => void;
  
  /**
   * Errores de validación por campo
   */
  errors: Record<string, boolean | string | undefined>;
}

const AddressFormFields: React.FC<AddressFormFieldsProps> = ({ 
  addressType, 
  addressData, 
  onChange, 
  errors 
}) => {
  const errorPrefix = `${addressType}_`;
  
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Address Line 1 *"
          name="address_line_1"
          value={addressData.address_line_1}
          onChange={(e) => onChange(e, addressType)}
          fullWidth
          error={!!errors[`${errorPrefix}address_line_1`]}
          helperText={errors[`${errorPrefix}address_line_1`] ? 'Required' : ''}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          label="Address Line 2"
          name="address_line_2"
          value={addressData.address_line_2}
          onChange={(e) => onChange(e, addressType)}
          fullWidth
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="City *"
          name="city"
          value={addressData.city}
          onChange={(e) => onChange(e, addressType)}
          fullWidth
          error={!!errors[`${errorPrefix}city`]}
          helperText={errors[`${errorPrefix}city`] ? 'Required' : ''}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="State *"
          name="state"
          value={addressData.state}
          onChange={(e) => onChange(e, addressType)}
          fullWidth
          error={!!errors[`${errorPrefix}state`]}
          helperText={errors[`${errorPrefix}state`] ? 'Required' : ''}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Postal Code *"
          name="postal_code"
          value={addressData.postal_code}
          onChange={(e) => onChange(e, addressType)}
          fullWidth
          error={!!errors[`${errorPrefix}postal_code`]}
          helperText={errors[`${errorPrefix}postal_code`] ? 'Required' : ''}
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          label="Country *"
          name="country"
          value={addressData.country}
          onChange={(e) => onChange(e, addressType)}
          fullWidth
          error={!!errors[`${errorPrefix}country`]}
          helperText={errors[`${errorPrefix}country`] ? 'Required' : ''}
        />
      </Grid>
    </Grid>
  );
};

export default AddressFormFields;