import React from 'react';
import { Paper, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { SelectChangeEvent } from '@mui/material/Select';
import SelectField from '../common/SelectField';
import { OrderFormData, OrderValidationErrors, OrderType, OrderClass } from '../../../../types/orders';

interface BasicOrderInfoStepProps {
  formData: Pick<OrderFormData, 'order_type' | 'order_class' | 'reference_number' | 'lookup_code_order'>;
  handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  orderTypes?: OrderType[];
  orderClasses?: OrderClass[];
  formErrors?: OrderValidationErrors;
  isOrderLocked?: boolean;
}

const BasicOrderInfoStep: React.FC<BasicOrderInfoStepProps> = ({
  formData,
  handleChange,
  orderTypes = [],
  orderClasses = [],
  formErrors = {},
  isOrderLocked,
}) => {
  // Wrapper para adaptar el handleChange a la firma que espera SelectField:
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

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Basic Order Information
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="order_type"
            label="Order Type"
            name="order_type"
            value={typeof formData.order_type === 'object' ? 
                  (formData.order_type as OrderType).id : 
                  (formData.order_type || '')}
            onChange={handleSelectChange}
            required
            options={orderTypes}
            getOptionLabel={(option: OrderType) => option.type_name}
            getOptionValue={(option: OrderType) => option.id}
            error={!!formErrors.order_type}
            helperText={formErrors.order_type ? "This field is required" : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SelectField
            id="order_class"
            label="Order Class"
            name="order_class"
            value={typeof formData.order_class === 'object' ? 
                  (formData.order_class as OrderClass).id : 
                  (formData.order_class || '')}
            onChange={handleSelectChange}
            required
            options={orderClasses}
            getOptionLabel={(option: OrderClass) => option.class_name}
            getOptionValue={(option: OrderClass) => option.id}
            error={!!formErrors.order_class}
            helperText={formErrors.order_class ? "This field is required" : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="reference_number"
            label="Reference Number"
            name="reference_number"
            value={formData.reference_number || ''}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="lookup_code_order"
            label="Order Number"
            name="lookup_code_order"
            value={formData.lookup_code_order || 'Will be generated on Next'}
            disabled
            fullWidth
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BasicOrderInfoStep;