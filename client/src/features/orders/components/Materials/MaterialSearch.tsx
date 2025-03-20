import React from 'react';
import { TableCell, TableRow, TextField, IconButton, Autocomplete } from '@mui/material';
import { Add } from '@mui/icons-material';
import { MaterialOption } from '../../../../types/materials';

interface MaterialSearchProps {
  availableOptions: MaterialOption[];
  currentSelection: MaterialOption | null;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleAddItem: (item: MaterialOption | null) => void;
  setCurrentSelection: (value: MaterialOption | null) => void;
}

const MaterialSearch: React.FC<MaterialSearchProps> = ({
  availableOptions,
  currentSelection,
  inputValue,
  setInputValue,
  handleAddItem,
  setCurrentSelection
}) => {
  return (
    <TableRow>
      <TableCell colSpan={2}>
        <Autocomplete
          id="material-select"
          options={availableOptions}
          value={currentSelection}
          onChange={(event, newValue) => {
            handleAddItem(newValue);
          }}
          inputValue={inputValue}
          onInputChange={(event, newValue) => {
            setInputValue(newValue);
          }}
          renderInput={(params) => (
            <TextField 
              {...params} 
              placeholder="Search by code or name"
              size="small"
            />
          )}
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          noOptionsText="No materials available"
          fullWidth
        />
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell align="right">
        <IconButton 
          color="primary"
          disabled={!currentSelection}
          onClick={() => handleAddItem(currentSelection)}
        >
          <Add />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default MaterialSearch;