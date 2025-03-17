// Tipos base para modelos con timestamp
export interface TimeStamped {
    id: number;
    created_date: string; // ISO date string
    modified_date: string; // ISO date string
    created_by_id?: number;
    modified_by_id?: number;
  }
  
  // Status (Catalogo)
  export interface Status {
    id: number;
    name: string;
    description: string;
    code: string;
  }
  
  // DTO para creación/actualización
  export type CreateTimeStamped = Omit<TimeStamped, 'id' | 'created_date' | 'modified_date'>;