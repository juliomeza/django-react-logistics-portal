import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiProtected from '../../../services/api/secureApi';

const Reports = () => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectInfo, setProjectInfo] = useState(null);

  // Fetch report data
  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // El backend ya se encarga de filtrar por el proyecto del usuario
      const response = await apiProtected.get('reports/1/execute/');
      
      // Establecer los datos del proyecto si están presentes en la respuesta
      if (response.data.project) {
        setProjectInfo(response.data.project);
      }
      
      setData(response.data.results);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchReportData();
  }, []);

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

  const handleRefresh = () => {
    fetchReportData();
  };

  // Filter the data based on search term
  const filteredData = data.filter(item => 
    (item.lookupCode && item.lookupCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.id && item.id.toString().includes(searchTerm)) ||
    (item.projectId && item.projectId.toString().includes(searchTerm))
  );

  // Paginate the data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 14, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Materials Report
          </Typography>
          <IconButton onClick={handleRefresh} color="primary" aria-label="refresh">
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Project information */}
        {projectInfo && (
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              Project:
            </Typography>
            <Chip 
              label={projectInfo.name} 
              color="primary" 
              variant="outlined"
            />
            {projectInfo.lookup_code && (
              <Typography variant="body2" color="text.secondary">
                (Code: {projectInfo.lookup_code})
              </Typography>
            )}
          </Box>
        )}

        {/* Search input */}
        <TextField
          fullWidth
          margin="normal"
          variant="outlined"
          placeholder="Search by ID, Project ID, or Lookup Code"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Results count */}
            <Typography variant="body2" sx={{ mb: 2 }}>
              Found {filteredData.length} materials
            </Typography>

            {/* Data table */}
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }} aria-label="materials table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Project ID</strong></TableCell>
                    <TableCell><strong>Lookup Code</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.projectId}</TableCell>
                      <TableCell>{row.lookupCode}</TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No materials found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Reports;