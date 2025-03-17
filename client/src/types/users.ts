import { TimeStamped } from './common';

// Usuario
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id?: number;
  role?: Role;
}

// Rol
export interface Role extends TimeStamped {
  id: number;
  role_name: string;
  permissions: Record<string, boolean | string[]>;
}