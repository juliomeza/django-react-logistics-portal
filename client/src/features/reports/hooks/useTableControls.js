import { useState, useEffect } from 'react';

// Hook para gestionar paginación y filtrado de tablas
const useTableControls = (data) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50); // Default rows per page
  const [searchTerm, setSearchTerm] = useState('');

  // Reset page when data changes
  useEffect(() => {
    setPage(0);
  }, [data]);

  // Filter the data based on search term
  const filteredData = data.filter(item => 
    Object.values(item).some(value => 
      value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginate the data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  return {
    page,
    rowsPerPage,
    searchTerm,
    filteredData,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange
  };
};

export default useTableControls;