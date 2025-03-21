import React from 'react';
import { Typography, SxProps, Theme } from '@mui/material';
import Grid from '@mui/material/Grid2';

// Interfaz para InfoItemProps con mejor tipado
interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  colSize?: any; // Mantenemos 'any' para colSize ya que se pasa directamente a Grid
  className?: string;
  sx?: SxProps<Theme>;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  colSize = { xs: 12, sm: 6, md: 3 },
  className = '',
  sx,
}) => {
  return (
    <Grid size={colSize}>
      <Typography variant="body2" color="text.secondary" sx={sx}>
        {label}
      </Typography>
      <Typography variant="body1" className={className}>
        {value}
      </Typography>
    </Grid>
  );
};

export default InfoItem;