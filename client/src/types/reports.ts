// ReportDefinition (Definición de reporte)
export interface ReportDefinition {
    id: number;
    name: string;
    description?: string;
    category: string;
    file_path: string;
    requires_project_filter: boolean;
    created_at: string;
    updated_at: string;
  }