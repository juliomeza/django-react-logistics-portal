import React from 'react';
import { Box, Container, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Define un enum para los tipos de pestaña
export enum OrderTabType {
  OUTBOUND = 0,
  INBOUND = 1
}

interface DashboardFiltersProps {
  // Usar el enum en lugar de number para mayor especificidad
  selectedTab: OrderTabType;
  handleTabChange: (event: React.SyntheticEvent, newValue: OrderTabType) => void;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  selectedTab,
  handleTabChange,
  searchText,
  setSearchText,
}) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px', // Altura predeterminada del AppBar/Toolbar
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: 'background.paper',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
        borderBottom: 1,
        borderColor: 'divider',
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs value={selectedTab} onChange={handleTabChange} aria-label="order type tabs">
            <Tab label="Outbound" />
            <Tab label="Inbound" />
          </Tabs>
          <TextField
            id="search-box"
            label="Search by Order, Reference, Customer or Destination"
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardFilters;