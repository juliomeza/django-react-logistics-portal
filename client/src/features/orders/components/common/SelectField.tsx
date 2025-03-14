import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, FormControlProps } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

interface SelectFieldProps extends Omit<FormControlProps, 'onChange'> {
  label: string;
  name: string;
  value: any;
  onChange: (event: SelectChangeEvent<any>, child: React.ReactNode) => void;
  options: any[];
  required?: boolean;
  getOptionLabel: (option: any) => string;
  getOptionValue: (option: any) => string | number;
  id?: string;
  error?: boolean;
  helperText?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  getOptionLabel,
  getOptionValue,
  id = name,
  error = false,
  helperText = '',
  ...props
}) => {
  const labelId = `${id}-label`;

  return (
    <FormControl fullWidth required={required} error={error} {...props}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        MenuProps={{
          disableScrollLock: true,
        }}
      >
        {options.map((option) => (
          <MenuItem key={getOptionValue(option)} value={getOptionValue(option)}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default SelectField;
