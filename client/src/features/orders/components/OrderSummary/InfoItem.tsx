import React from 'react';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  colSize?: any;
  className?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  colSize = { xs: 12, sm: 6, md: 3 },
  className = '',
}) => {
  return (
    <Grid size={colSize}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" className={className}>
        {value}
      </Typography>
    </Grid>
  );
};

export default InfoItem;
