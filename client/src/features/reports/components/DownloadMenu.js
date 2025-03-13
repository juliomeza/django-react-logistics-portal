import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
// Importamos los iconos de Lucide en lugar de MUI
import { FileSpreadsheet, FileText, Table2 } from 'lucide-react';

const DownloadMenu = ({
  anchorEl,
  open,
  onClose,
  onDownloadPDF,
  onDownloadCSV,
  onDownloadExcel
}) => {
  return (
    <Menu
      id="download-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 1,
        sx: {
          minWidth: '160px',
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
          mt: 1
        },
      }}
    >
      <MenuItem onClick={onDownloadExcel} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: '36px', color: '#1e7e34' }}>
          {/* Icono de Lucide para Excel */}
          <FileSpreadsheet size={20} />
        </ListItemIcon>
        <ListItemText 
          primary="Excel (.xlsx)" 
          primaryTypographyProps={{ variant: 'body2', sx: { fontSize: '0.875rem' } }}
        />
      </MenuItem>
      <MenuItem onClick={onDownloadPDF} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: '36px', color: '#dc3545' }}>
          {/* Icono de Lucide para PDF */}
          <FileText size={20} />
        </ListItemIcon>
        <ListItemText 
          primary="PDF (.pdf)" 
          primaryTypographyProps={{ variant: 'body2', sx: { fontSize: '0.875rem' } }}
        />
      </MenuItem>
      <MenuItem onClick={onDownloadCSV} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: '36px', color: '#0d6efd' }}>
          {/* Icono de Lucide para CSV */}
          <Table2 size={20} />
        </ListItemIcon>
        <ListItemText 
          primary="CSV (.csv)" 
          primaryTypographyProps={{ variant: 'body2', sx: { fontSize: '0.875rem' } }}
        />
      </MenuItem>
    </Menu>
  );
};

export default DownloadMenu;