import React from 'react';
import { Typography, SxProps, Theme } from '@mui/material';
import Grid from '@mui/material/Grid2';

interface OrderSummarySectionProps {
  title: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const OrderSummarySection: React.FC<OrderSummarySectionProps> = ({
  title,
  children,
  sx,
}) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ mb: 1, mt: 2, ...sx }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </>
  );
};

export default OrderSummarySection;