// Credenciales para iniciar sesión
export interface Credentials {
  email: string;
  password: string;
}

// Datos del usuario autenticado
export interface AuthUserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  client_name?: string;
  role_id?: number;
  role?: {
    id: number;
    role_name: string;
    permissions: Record<string, boolean | string[]>;
  };
}

// Tipo del contexto de autenticación
export interface AuthContextType {
  user: AuthUserData | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Error de API (para Axios)
export interface ApiError {
  response?: {
    status: number;
    data?: unknown;
  };
  message?: string;
}