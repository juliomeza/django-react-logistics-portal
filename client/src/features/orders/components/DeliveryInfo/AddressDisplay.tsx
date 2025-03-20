import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatAddress, AddressDisplay as AddressDisplayType } from '../../utils/DeliveryInfoUtils';
import { Address as ModelAddress } from '../../../../types/logistics';

// Tipo unión que acepta tanto AddressDisplay como ModelAddress
type AddressType = AddressDisplayType | ModelAddress | null | undefined;

interface AddressDisplayProps {
  title: string;
  address: AddressType;
  error: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ title, address, error }) => {
  // Función para convertir cualquier tipo de dirección a AddressDisplayType
  const adaptAddress = (addr: AddressType): AddressDisplayType | null | undefined => {
    if (!addr) return addr;
    
    // Simplemente tratamos el objeto como AddressDisplayType
    // La interfaz AddressDisplayType ya tiene [key: string]: unknown que permite propiedades adicionales
    return addr as unknown as AddressDisplayType;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        p: 1,
        backgroundColor: '#f5f5f5',
        opacity: 0.9,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ flexGrow: 1, color: error ? 'error.main' : 'text.secondary' }}
      >
        {address ? formatAddress(adaptAddress(address)) : 'No address selected'}
      </Typography>
      {error && (
        <Typography variant="caption" color="error">
          This field is required
        </Typography>
      )}
    </Box>
  );
};

export default AddressDisplay;