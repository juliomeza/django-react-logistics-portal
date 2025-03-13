import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  TablePagination,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import DownloadIcon from '@mui/icons-material/Download';

// Custom Hooks
import useReportsData from '../hooks/useReportsData';
import useTableControls from '../hooks/useTableControls';
import useTableScroll from '../hooks/useTableScroll';
import useDownloadMenu from '../hooks/useDownloadMenu';

// Components
import ReportSelector from '../components/ReportSelector';
import DownloadMenu from '../components/DownloadMenu';
import ReportTable from '../components/ReportTable';

const Reports: React.FC = () => {
  const {
    availableReports,
    selectedReport,
    data,
    columns,
    projectInfo,
    loading,
    error,
    handleReportChange,
    handleRefresh,
  } = useReportsData();

  const {
    page,
    rowsPerPage,
    searchTerm,
    filteredData,
    paginatedData,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSearchChange,
  } = useTableControls(data);

  const {
    tableContainerRef,
    showLeftShadow,
    showRightShadow,
    handleScroll,
    scrollLeft,
    scrollRight,
  } = useTableScroll();

  const {
    downloadMenuAnchorEl,
    downloadMenuOpen,
    handleDownloadMenuOpen,
    handleDownloadMenuClose,
    handleDownloadPDF,
    handleDownloadCSV,
    handleDownloadExcel,
  } = useDownloadMenu();

  // Reset scroll position when data changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = 0;
    }
    setTimeout(() => {
      handleScroll();
    }, 100);
  }, [data, tableContainerRef, handleScroll]);

  const selectedReportName =
    availableReports.find((report) => report.id === Number(selectedReport))?.name || 'Report';

  // Render controls header
  const renderControlsHeader = () => (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
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

          {/* Search field */}
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

          {/* Project code, refresh and download buttons */}
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
            <IconButton
              onClick={handleDownloadMenuOpen}
              color="primary"
              aria-label="download"
              size="small"
              aria-controls={downloadMenuOpen ? 'download-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={downloadMenuOpen ? 'true' : undefined}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );

  // Render results header with count and scroll controls
  const renderResultsHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2">
        {selectedReportName}: Found {filteredData.length} results
      </Typography>
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
  );

  // Render loading indicator
  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <>
      {renderControlsHeader()}

      <DownloadMenu
        anchorEl={downloadMenuAnchorEl}
        open={downloadMenuOpen}
        onClose={handleDownloadMenuClose}
        onDownloadPDF={handleDownloadPDF}
        onDownloadCSV={handleDownloadCSV}
        onDownloadExcel={handleDownloadExcel}
      />

      <Container maxWidth="lg" sx={{ mt: 16, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {loading ? (
            renderLoading()
          ) : (
            <>
              {renderResultsHeader()}
              <ReportTable
                columns={columns}
                paginatedData={paginatedData}
                tableContainerRef={tableContainerRef}
                onScroll={handleScroll}
                showLeftShadow={showLeftShadow}
                showRightShadow={showRightShadow}
              />
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
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
