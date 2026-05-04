import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const userData = await authService.login({ email, password });
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    return authService.register({ name, email, password });
  };

  const verifyOtp = async (email, otp) => {
    const data = await authService.verifyOtp({ email, otp });
    // User data set in api service
    const freshUser = await authService.getCurrentUser();
    setUser(freshUser);
    return data;
  };

  const forgotPassword = async (email) => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (email, otp, newPassword) => {
    return authService.resetPassword({ email, otp, newPassword });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOtp, forgotPassword, resetPassword, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};