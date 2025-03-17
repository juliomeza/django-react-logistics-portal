import React from 'react';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import SelectField from '../common/SelectField';

interface LogisticsInfoStepProps {
  formData: any;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  warehouses?: any[];
  projects?: any[];
  carriers?: any[];
  carrierServices?: any[];
  formErrors?: { [key: string]: any };
  isOrderLocked?: boolean;
}

const LogisticsInfoStep: React.FC<LogisticsInfoStepProps> = ({
  formData,
  handleChange,
  warehouses = [],
  projects = [],
  carriers = [],
  carrierServices = [],
  formErrors = {},
  isOrderLocked = false,
}) => {
  // Adaptación de handleChange para SelectField:
  const handleSelectChange = (event: any, child: React.ReactNode) => {
    handleChange(event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Logistics Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="project"
            label="Project"
            name="project"
            value={formData.project || ''}
            onChange={handleSelectChange}
            required
            options={projects || []}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id}
            error={formErrors.project}
            helperText={formErrors.project && "This field is required"}
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="warehouse"
            label="Warehouse"
            name="warehouse"
            value={formData.warehouse || ''}
            onChange={handleSelectChange}
            required
            options={warehouses || []}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id}
            error={formErrors.warehouse}
            helperText={formErrors.warehouse && "This field is required"}
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="carrier"
            label="Carrier"
            name="carrier"
            value={formData.carrier || ''}
            onChange={handleSelectChange}
            options={carriers || []}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id}
            disabled={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="service_type"
            label="Service Type"
            name="service_type"
            value={formData.service_type || ''}
            onChange={handleSelectChange}
            options={carrierServices || []}
            getOptionLabel={(option: any) => option.name}
            getOptionValue={(option: any) => option.id}
            disabled={false}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LogisticsInfoStep;
