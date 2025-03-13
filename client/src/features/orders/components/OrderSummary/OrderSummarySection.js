import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

/**
 * A section in the order summary with a title and grid of children
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Child components (InfoItem components)
 */
const OrderSummarySection = ({ title, children }) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </>
  );
};

export default OrderSummarySection;