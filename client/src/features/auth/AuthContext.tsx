import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setupInterceptors, clearTokenRefresh, setupTokenRefresh } from '../../services/api/authApi';
import apiProtected from '../../services/api/secureApi';
import { Credentials, AuthUserData, AuthContextType } from '../../types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const response = await api.get<{ user: AuthUserData | null }>('auth-status/');
      const userData = response.data.user;
      setUser(userData ? { ...userData } : null);
      if (userData) {
        setupTokenRefresh();
      }
    } catch (error) {
      setUser(null);
      clearTokenRefresh();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    setupInterceptors(api, navigate);
    setupInterceptors(apiProtected, navigate);
  }, [navigate]);

  const login = async (credentials: Credentials) => {
    try {
      const response = await api.post('login/', credentials);
      if (response.status === 200) {
        await checkAuthStatus();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearTokenRefresh();
      await api.post('logout/');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;