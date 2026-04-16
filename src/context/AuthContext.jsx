import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const getStorage = () => {
  // If user chose "remember", use localStorage; otherwise sessionStorage
  return localStorage.getItem('fincontrol_persist') === 'true' ? localStorage : sessionStorage;
};

const getToken = () => {
  return localStorage.getItem('fincontrol_token') || sessionStorage.getItem('fincontrol_token');
};

const getUser = () => {
  const raw = localStorage.getItem('fincontrol_user') || sessionStorage.getItem('fincontrol_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const clearAll = () => {
  localStorage.removeItem('fincontrol_token');
  localStorage.removeItem('fincontrol_user');
  localStorage.removeItem('fincontrol_persist');
  sessionStorage.removeItem('fincontrol_token');
  sessionStorage.removeItem('fincontrol_user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.me();
      setUser(res.data.user);
    } catch {
      clearAll();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    const res = await authAPI.login(email, password);
    const { user: userData, token } = res.data;

    // Choose where to store
    if (rememberMe) {
      localStorage.setItem('fincontrol_persist', 'true');
      localStorage.setItem('fincontrol_token', token);
      localStorage.setItem('fincontrol_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('fincontrol_persist');
      sessionStorage.setItem('fincontrol_token', token);
      sessionStorage.setItem('fincontrol_user', JSON.stringify(userData));
    }

    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authAPI.register(name, email, password, confirmPassword);
    const { user: userData, token } = res.data;
    // New registrations auto-persist
    localStorage.setItem('fincontrol_persist', 'true');
    localStorage.setItem('fincontrol_token', token);
    localStorage.setItem('fincontrol_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    clearAll();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
