import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';

interface Report {
  id: number;
  name: string;
  category: string;
  // Agrega otros campos que sean necesarios
}

interface ReportResponse {
  columns?: any[];
  project?: any;
  results: any[];
}

interface UseReportsDataReturn {
  availableReports: Report[];
  selectedReport: number | string;
  data: any[];
  columns: any[];
  projectInfo: any;
  loading: boolean;
  error: string | null;
  handleReportChange: (reportId: number | string) => void;
  handleRefresh: () => void;
}

const useReportsData = (): UseReportsDataReturn => {
  const [availableReports, setAvailableReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<number | string>('');
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available reports
  const fetchAvailableReports = async () => {
    try {
      const response = await apiProtected.get('reports/');
      const reports: Report[] = response.data;
      setAvailableReports(reports);
      if (reports.length > 0) {
        setSelectedReport(reports[0].id);
      }
    } catch (err) {
      console.error('Error fetching available reports:', err);
      setError('Failed to load available reports. Please try again.');
    }
  };

  // Fetch report data
  const fetchReportData = async (reportId: number | string) => {
    if (!reportId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiProtected.get<ReportResponse>(`reports/${reportId}/execute/`);
      
      if (response.data.columns) {
        setColumns(response.data.columns);
      }
      
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

  const handleReportChange = (reportId: number | string) => {
    setSelectedReport(reportId);
  };

  const handleRefresh = () => {
    fetchReportData(selectedReport);
  };

  useEffect(() => {
    fetchAvailableReports();
  }, []);

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
    handleRefresh,
  };
};

export default useReportsData;
