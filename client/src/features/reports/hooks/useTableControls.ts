import { useState, useEffect, ChangeEvent } from 'react';

function useTableControls<T extends Record<string, unknown>>(data: T[]) {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [searchTerm, setSearchTerm] = useState<string>('');

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
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
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
    handleSearchChange,
  };
}

export default useTableControls;
