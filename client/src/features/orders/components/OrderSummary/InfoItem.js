import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

/**
 * A standard info item with a label and value, used in order summary
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label text
 * @param {React.ReactNode} props.value - Value to display
 * @param {Object} props.colSize - Grid size configuration
 * @param {string} props.className - Additional CSS class
 */
const InfoItem = ({ 
  label, 
  value, 
  colSize = { xs: 12, sm: 6, md: 3 },
  className = '' 
}) => {
  return (
    <Grid size={colSize}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body1" className={className}>{value}</Typography>
    </Grid>
  );
};

export default InfoItem;