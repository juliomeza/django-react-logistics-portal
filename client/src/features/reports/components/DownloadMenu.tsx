import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { FileSpreadsheet, FileText, Table2 } from 'lucide-react';

interface DownloadMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
  onDownloadExcel: () => void;
}

const DownloadMenu: React.FC<DownloadMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onDownloadPDF,
  onDownloadCSV,
  onDownloadExcel,
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
          mt: 1,
        },
      }}
    >
      <MenuItem onClick={onDownloadExcel} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: '36px', color: '#1e7e34' }}>
          <FileSpreadsheet size={20} />
        </ListItemIcon>
        <ListItemText
          primary="Excel (.xlsx)"
          primaryTypographyProps={{ variant: 'body2', sx: { fontSize: '0.875rem' } }}
        />
      </MenuItem>
      <MenuItem onClick={onDownloadPDF} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: '36px', color: '#dc3545' }}>
          <FileText size={20} />
        </ListItemIcon>
        <ListItemText
          primary="PDF (.pdf)"
          primaryTypographyProps={{ variant: 'body2', sx: { fontSize: '0.875rem' } }}
        />
      </MenuItem>
      <MenuItem onClick={onDownloadCSV} sx={{ py: 1 }}>
        <ListItemIcon sx={{ minWidth: '36px', color: '#0d6efd' }}>
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