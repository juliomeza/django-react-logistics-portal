import React, { useState, useEffect, MouseEvent } from 'react';
import {
  FormControl,
  TextField,
  InputAdornment,
  Popover,
  Box,
  useTheme,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface Report {
  id: number;
  name: string;
  category: string;
}

interface ReportSelectorProps {
  availableReports: Report[];
  selectedReport: string | number;
  onReportChange: (reportId: number) => void;
  isLoading: boolean;
}

const ReportSelector: React.FC<ReportSelectorProps> = ({
  availableReports,
  selectedReport,
  onReportChange,
  isLoading,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (availableReports.length > 0) {
      const categories = Array.from(new Set(availableReports.map(report => report.category)));
      const initialExpandState: Record<string, boolean> = {};
      categories.forEach(category => {
        initialExpandState[category] = false;
      });
      setExpandedCategories(initialExpandState);
    }
  }, [availableReports]);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReportSelect = (reportId: number) => {
    onReportChange(reportId);
    handleClose();
  };

  const toggleCategory = (category: string, event?: MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
    }
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const selectedReportName =
    availableReports.find(report => report.id === Number(selectedReport))?.name || 'Select Report';

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
            width: anchorEl ? anchorEl.clientWidth : undefined,
          },
        }}
      >
        <Box sx={{ p: 1 }}>
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
                    {expandedCategories[category] ? (
                      <ExpandMoreIcon fontSize="small" sx={{ mr: 1 }} />
                    ) : (
                      <ChevronRightIcon fontSize="small" sx={{ mr: 1 }} />
                    )}
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
                              ...(report.id === Number(selectedReport)
                                ? { backgroundColor: theme.palette.action.selected }
                                : {}),
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

export default ReportSelector;