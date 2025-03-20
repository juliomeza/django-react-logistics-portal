import React from 'react';
import { Box, Typography } from '@mui/material';
import { formatAddress } from '../../utils/DeliveryInfoUtils';

interface AddressDisplayProps {
  title: string;
  address: any;
  error: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ title, address, error }) => (
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
