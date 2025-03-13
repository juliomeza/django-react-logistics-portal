import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';

interface ReportTableProps {
  columns: string[];
  paginatedData: any[];
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  showLeftShadow: boolean;
  showRightShadow: boolean;
}

const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  paginatedData,
  tableContainerRef,
  onScroll,
  showLeftShadow,
  showRightShadow,
}) => {
  const theme = useTheme();

  return (
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
        onScroll={onScroll}
        sx={{ 
          maxHeight: '65vh',
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
            <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
              {columns.map((column) => (
                <TableCell 
                  key={column}
                  sx={{
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    backgroundColor: theme.palette.action.hover,
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
                    sx={{ whiteSpace: 'nowrap' }}
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
  );
};

export default ReportTable;
