import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatAddress } from '../../utils/DeliveryInfoUtils';

/**
 * Componente para mostrar una dirección en un cuadro formateado
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título para mostrar en la parte superior
 * @param {Object} props.address - Objeto con los datos de la dirección
 * @param {boolean} props.error - Indica si hay un error en este campo
 */
const AddressDisplay = ({ title, address, error }) => (
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
      {address ? formatAddress(address) : 'No address selected'}
    </Typography>
    {error && (
      <Typography variant="caption" color="error">
        This field is required
      </Typography>
    )}
  </Box>
);

export default AddressDisplay;