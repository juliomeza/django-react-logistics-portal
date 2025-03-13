import { useState } from 'react';

// Hook para gestionar el menú de descarga
const useDownloadMenu = () => {
  const [downloadMenuAnchorEl, setDownloadMenuAnchorEl] = useState(null);
  const downloadMenuOpen = Boolean(downloadMenuAnchorEl);

  // Handlers for the download menu
  const handleDownloadMenuOpen = (event) => {
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
    handleDownloadExcel
  };
};

export default useDownloadMenu;