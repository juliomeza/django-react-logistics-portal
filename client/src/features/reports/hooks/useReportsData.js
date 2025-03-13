import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';

// Hook para gestionar datos de reportes y fetching
const useReportsData = () => {
  const [availableReports, setAvailableReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Handle report selection change
  const handleReportChange = (reportId) => {
    setSelectedReport(reportId);
  };

  // Refresh current report data
  const handleRefresh = () => {
    fetchReportData(selectedReport);
  };

  // Load available reports on hook initialization
  useEffect(() => {
    fetchAvailableReports();
  }, []);

  // Load report data when a report is selected
  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [selectedReport]);

  return {
    availableReports,
    selectedReport,
    data,
    columns,
    projectInfo,
    loading,
    error,
    handleReportChange,
    handleRefresh
  };
};

export default useReportsData;