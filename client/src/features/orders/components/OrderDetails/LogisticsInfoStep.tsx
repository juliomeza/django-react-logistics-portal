import React from 'react';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import SelectField from '../common/SelectField';
import { OrderFormData, OrderValidationErrors } from '../../../../types/orders';
import { Project } from '../../../../types/enterprise';
import { Warehouse, Carrier, CarrierService } from '../../../../types/logistics';

interface LogisticsInfoStepProps {
  formData: Pick<OrderFormData, 'project' | 'warehouse' | 'carrier' | 'service_type'>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  warehouses?: Warehouse[];
  projects?: Project[];
  carriers?: Carrier[];
  carrierServices?: CarrierService[];
  formErrors?: OrderValidationErrors;
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
  const handleSelectChange = (
    event: SelectChangeEvent<string | number>, 
    child: React.ReactNode
  ) => {
    const syntheticEvent = {
      target: {
        name: event.target.name,
        value: event.target.value
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(syntheticEvent);
  };

  // Helper para obtener el valor correcto para el SelectField
  const getSelectValue = <T extends { id: number }>(
    value: string | number | T | undefined
  ): string | number => {
    if (typeof value === 'object' && value !== null) {
      return value.id;
    }
    return value || '';
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
            value={getSelectValue(formData.project)}
            onChange={handleSelectChange}
            required
            options={projects}
            getOptionLabel={(option: Project) => option.name}
            getOptionValue={(option: Project) => option.id}
            error={!!formErrors.project}
            helperText={formErrors.project ? "This field is required" : undefined}
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="warehouse"
            label="Warehouse"
            name="warehouse"
            value={getSelectValue(formData.warehouse)}
            onChange={handleSelectChange}
            required
            options={warehouses}
            getOptionLabel={(option: Warehouse) => option.name}
            getOptionValue={(option: Warehouse) => option.id}
            error={!!formErrors.warehouse}
            helperText={formErrors.warehouse ? "This field is required" : undefined}
            disabled={isOrderLocked}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="carrier"
            label="Carrier"
            name="carrier"
            value={getSelectValue(formData.carrier)}
            onChange={handleSelectChange}
            options={carriers}
            getOptionLabel={(option: Carrier) => option.name}
            getOptionValue={(option: Carrier) => option.id}
            disabled={false}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="service_type"
            label="Service Type"
            name="service_type"
            value={getSelectValue(formData.service_type)}
            onChange={handleSelectChange}
            options={carrierServices}
            getOptionLabel={(option: CarrierService) => option.name}
            getOptionValue={(option: CarrierService) => option.id}
            disabled={false}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LogisticsInfoStep;