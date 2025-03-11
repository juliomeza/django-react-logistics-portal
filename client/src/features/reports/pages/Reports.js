import React, { useState, useEffect, useRef } from 'react';
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
  InputLabel,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import apiProtected from '../../../services/api/secureApi';

const Reports = () => {
  // Theme
  const theme = useTheme();
  
  // Refs
  const tableContainerRef = useRef(null);
  
  // State
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50); // Default rows per page
  const [searchTerm, setSearchTerm] = useState('');
  const [projectInfo, setProjectInfo] = useState(null);
  const [availableReports, setAvailableReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  // Handle horizontal scroll
  const handleScroll = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
      setScrollPosition(scrollLeft);
      setShowLeftShadow(scrollLeft > 5);
      setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  // Scroll left/right by one visible width
  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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

  // Check for scroll shadows when data changes
  useEffect(() => {
    // Reset scroll position when data changes
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
    
    // Check if shadows should be shown
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [data]);

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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2">
                {selectedReportName}: Found {filteredData.length} results
              </Typography>
              
              {/* Scroll controls */}
              {(showLeftShadow || showRightShadow) && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    onClick={scrollLeft} 
                    disabled={!showLeftShadow}
                    sx={{ opacity: showLeftShadow ? 1 : 0.3 }}
                  >
                    <KeyboardArrowLeftIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={scrollRight} 
                    disabled={!showRightShadow}
                    sx={{ opacity: showRightShadow ? 1 : 0.3 }}
                  >
                    <KeyboardArrowRightIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Data table with sticky header */}
            <Box 
              sx={{ 
                position: 'relative',
                '&::before': showLeftShadow ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '20px',
                  height: '100%',
                  background: `linear-gradient(to right, ${theme.palette.background.paper}, transparent)`,
                  zIndex: 2,
                  pointerEvents: 'none'
                } : {},
                '&::after': showRightShadow ? {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '20px',
                  height: '100%',
                  background: `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
                  zIndex: 2,
                  pointerEvents: 'none'
                } : {}
              }}
            >
              <TableContainer 
                component={Paper} 
                variant="outlined" 
                ref={tableContainerRef}
                onScroll={handleScroll}
                sx={{ 
                  maxHeight: '60vh',
                  overflow: 'auto',
                  '& .MuiTableHead-root': {
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    backgroundColor: theme.palette.background.paper,
                  }
                }}
              >
                <Table stickyHeader aria-label="report results table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                      {columns.map((column) => (
                        <TableCell 
                          key={column}
                          sx={{
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            backgroundColor: (theme) => theme.palette.action.hover,
                          }}
                        >
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {columns.map((column) => (
                          <TableCell 
                            key={column}
                            sx={{ 
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row[column]}
                          </TableCell>
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
            </Box>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[25, 50, 100]} // Rows per page options
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