import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('fincontrol_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.me();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('fincontrol_token');
      localStorage.removeItem('fincontrol_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { user: userData, token } = res.data;
    localStorage.setItem('fincontrol_token', token);
    localStorage.setItem('fincontrol_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authAPI.register(name, email, password, confirmPassword);
    const { user: userData, token } = res.data;
    localStorage.setItem('fincontrol_token', token);
    localStorage.setItem('fincontrol_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('fincontrol_token');
    localStorage.removeItem('fincontrol_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
