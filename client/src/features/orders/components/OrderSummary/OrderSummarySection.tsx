import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

interface OrderSummarySectionProps {
  title: string;
  children: React.ReactNode;
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  title,
  children,
}) => {
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
