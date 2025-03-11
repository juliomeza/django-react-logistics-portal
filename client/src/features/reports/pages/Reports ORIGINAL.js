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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import apiProtected from '../../../services/api/secureApi';

const Reports = () => {
  // State
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectInfo, setProjectInfo] = useState(null);
  const [availableReports, setAvailableReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');

  // Fetch available reports
  const fetchAvailableReports = async () => {
    try {
      const response = await apiProtected.get('reports/');
      setAvailableReports(response.data);
      if (response.data.length > 0) {
        setSelectedReport(response.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching available reports:', err);
      setError('Failed to load available reports. Please try again.');
    }
  };

  // Fetch report data
  const fetchReportData = async (reportId) => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiProtected.get(`reports/${reportId}/execute/`);
      
      // Establecer las columnas si están presentes en la respuesta
      if (response.data.columns) {
        setColumns(response.data.columns);
      }
      
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

  // Load available reports on component mount
  useEffect(() => {
    fetchAvailableReports();
  }, []);

  // Load report data when a report is selected
  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [selectedReport]);

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
    fetchReportData(selectedReport);
  };

  const handleReportChange = (event) => {
    setSelectedReport(event.target.value);
  };

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

  // Obtener el nombre del reporte seleccionado
  const selectedReportName = availableReports.find(
    report => report.id === parseInt(selectedReport)
  )?.name || 'Report';

  return (
    <Container maxWidth="lg" sx={{ mt: 14, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Reports
          </Typography>
          <IconButton onClick={handleRefresh} color="primary" aria-label="refresh">
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Report selection */}
        <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
          <InputLabel>Select Report</InputLabel>
          <Select
            value={selectedReport}
            onChange={handleReportChange}
            label="Select Report"
          >
            {availableReports.map((report) => (
              <MenuItem key={report.id} value={report.id}>
                {report.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
          placeholder="Search in results"
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
              {selectedReportName}: Found {filteredData.length} results
            </Typography>

            {/* Data table */}
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }} aria-label="report results table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                    {columns.map((column) => (
                      <TableCell key={column}><strong>{column}</strong></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} hover>
                      {columns.map((column) => (
                        <TableCell key={column}>{row[column]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        No results found matching your search.
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