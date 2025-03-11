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
  FormControl,
  Popover,
  useTheme,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import apiProtected from '../../../services/api/secureApi';

// Componente personalizado para el selector de reportes con TreeView
const ReportSelector = ({ 
  availableReports, 
  selectedReport, 
  onReportChange,
  isLoading 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Inicializar estados expandidos para las categorías
  useEffect(() => {
    if (availableReports.length > 0) {
      const categories = Array.from(new Set(availableReports.map(report => report.category)));
      const initialExpandState = {};
      categories.forEach(category => {
        initialExpandState[category] = false;
      });
      setExpandedCategories(initialExpandState);
    }
  }, [availableReports]);
  
  // Manejar apertura/cierre del popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Manejar selección de reporte
  const handleReportSelect = (reportId) => {
    onReportChange(reportId);
    handleClose();
  };
  
  // Manejar expansión de categorías
  const toggleCategory = (category, event) => {
    if (event) {
      event.stopPropagation();
    }
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Obtener el nombre del reporte seleccionado
  const selectedReportName = availableReports.find(
    report => report.id === parseInt(selectedReport)
  )?.name || 'Select Report';
  
  // Verificar si el popover está abierto
  const open = Boolean(anchorEl);
  
  return (
    <FormControl fullWidth variant="outlined">
      <TextField
        value={selectedReportName}
        onClick={handleClick}
        label="Select Report"
        size="small"
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <KeyboardArrowDownIcon />
            </InputAdornment>
          ),
        }}
        disabled={isLoading}
      />
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          style: {
            maxHeight: 350,
            width: anchorEl ? anchorEl.clientWidth : undefined
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          {/* Simulamos un TreeView con componentes estándar de MUI */}
          <Box sx={{ width: '100%' }}>
            {Array.from(new Set(availableReports.map(report => report.category)))
              .sort()
              .map(category => (
                <Box key={category}>
                  <Box
                    onClick={(e) => toggleCategory(category, e)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {expandedCategories[category] ? 
                      <ExpandMoreIcon fontSize="small" sx={{ mr: 1 }} /> : 
                      <ChevronRightIcon fontSize="small" sx={{ mr: 1 }} />
                    }
                    {category}
                  </Box>
                  
                  {expandedCategories[category] && (
                    <Box sx={{ ml: 3 }}>
                      {availableReports
                        .filter(report => report.category === category)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(report => (
                          <Box
                            key={report.id}
                            onClick={() => handleReportSelect(report.id)}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                              ...(report.id === parseInt(selectedReport) ? {
                                backgroundColor: theme.palette.action.selected,
                              } : {}),
                            }}
                          >
                            {report.name}
                          </Box>
                        ))}
                    </Box>
                  )}
                </Box>
              ))}
          </Box>
        </Box>
      </Popover>
    </FormControl>
  );
};

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

  const handleReportChange = (reportId) => {
    setSelectedReport(reportId);
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
    <>
      {/* Second header with controls - styled like DashboardFilters */}
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
            {/* Report selector - left side */}
            <Box sx={{ width: '30%' }}>
              <ReportSelector 
                availableReports={availableReports}
                selectedReport={selectedReport}
                onReportChange={handleReportChange}
                isLoading={loading && data.length === 0}
              />
            </Box>
            
            {/* Search field - center/right */}
            <TextField
              placeholder="Search in results"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Project code and refresh - right side */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {projectInfo && projectInfo.lookup_code && (
                <Chip 
                  label={`Code: ${projectInfo.lookup_code}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
              <IconButton onClick={handleRefresh} color="primary" aria-label="refresh" size="small">
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main content - adjusted with top margin to account for fixed header */}
      <Container maxWidth="lg" sx={{ mt: 16, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading indicator */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Results count and scroll controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                    maxHeight: '65vh', // Slightly larger to use more vertical space
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
    </>
  );
};

export default Reports;