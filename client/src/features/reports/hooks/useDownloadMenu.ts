import { useState, MouseEvent } from 'react';

interface UseDownloadMenuReturn {
  downloadMenuAnchorEl: HTMLElement | null;
  downloadMenuOpen: boolean;
  handleDownloadMenuOpen: (event: MouseEvent<HTMLElement>) => void;
  handleDownloadMenuClose: () => void;
  handleDownloadPDF: () => void;
  handleDownloadCSV: () => void;
  handleDownloadExcel: () => void;
}

const useDownloadMenu = (): UseDownloadMenuReturn => {
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState<HTMLElement | null>(null);
  const downloadMenuOpen = Boolean(downloadMenuAnchorEl);

  const handleDownloadMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setDownloadMenuAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchorEl(null);
  };

  const handleDownloadPDF = () => {
    handleDownloadMenuClose();
    // Implementación futura
    console.log('Download PDF');
  };

  const handleDownloadCSV = () => {
    handleDownloadMenuClose();
    // Implementación futura
    console.log('Download CSV');
  };

  const handleDownloadExcel = () => {
    handleDownloadMenuClose();
    // Implementación futura
    console.log('Download Excel');
  };

  return {
    downloadMenuAnchorEl,
    downloadMenuOpen,
    handleDownloadMenuOpen,
    handleDownloadMenuClose,
    handleDownloadPDF,
    handleDownloadCSV,
    handleDownloadExcel,
  };
};

export default useDownloadMenu;
