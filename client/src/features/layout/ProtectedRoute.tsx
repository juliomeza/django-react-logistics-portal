import React, { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../auth/AuthContext';
import MainLayout from './MainLayout';
import { AuthContextType } from '../../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useContext(AuthContext) as AuthContextType;

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <MainLayout>{children}</MainLayout>;
};

export default ProtectedRoute;