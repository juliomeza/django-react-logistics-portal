import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, FormControlProps } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

// Definimos un tipo genérico T para las opciones
interface SelectFieldProps<T> extends Omit<FormControlProps, 'onChange'> {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (event: SelectChangeEvent<string | number>, child: React.ReactNode) => void;
  options: T[];
  required?: boolean;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number;
  id?: string;
  error?: boolean;
  helperText?: string;
}

// Usamos un componente genérico para trabajar con cualquier tipo de opciones
const SelectField = <T,>({
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
}: SelectFieldProps<T>): React.ReactElement => {
  const labelId = `${id}-label`;

  return (
    <FormControl fullWidth required={required} error={error} {...props}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        id={id}
        name={name}
        value={value ?? ''}
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