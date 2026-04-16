import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const getToken = () => {
  return localStorage.getItem('fincontrol_token') || sessionStorage.getItem('fincontrol_token');
};

const getUser = () => {
  const raw = localStorage.getItem('fincontrol_user') || sessionStorage.getItem('fincontrol_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
};

const getCurrency = () => {
  return localStorage.getItem('fincontrol_currency') || 'DOP';
};

const clearAll = () => {
  localStorage.removeItem('fincontrol_token');
  localStorage.removeItem('fincontrol_user');
  localStorage.removeItem('fincontrol_persist');
  localStorage.removeItem('fincontrol_currency');
  localStorage.removeItem('fincontrol_language');
  sessionStorage.removeItem('fincontrol_token');
  sessionStorage.removeItem('fincontrol_user');
};

const saveUser = (userData, token, persist) => {
  if (persist) {
    localStorage.setItem('fincontrol_persist', 'true');
    localStorage.setItem('fincontrol_token', token);
    localStorage.setItem('fincontrol_user', JSON.stringify(userData));
  } else {
    localStorage.removeItem('fincontrol_persist');
    sessionStorage.setItem('fincontrol_token', token);
    sessionStorage.setItem('fincontrol_user', JSON.stringify(userData));
  }
};

const getLanguage = () => {
  return localStorage.getItem('fincontrol_language') || 'es';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [currency, setCurrencyState] = useState(() => getCurrency());
  const [language, setLanguageState] = useState(() => getLanguage());
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
      const u = res.data.user;
      setUser(u);
      const persist = localStorage.getItem('fincontrol_persist') === 'true';
      saveUser(u, token, persist);
      if (u.currency) {
        setCurrencyState(u.currency);
        localStorage.setItem('fincontrol_currency', u.currency);
      }
      if (u.language) {
        setLanguageState(u.language);
        localStorage.setItem('fincontrol_language', u.language);
      }
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
    saveUser(userData, token, rememberMe);
    setUser(userData);
    if (userData.currency) {
      setCurrencyState(userData.currency);
      localStorage.setItem('fincontrol_currency', userData.currency);
    }
    if (userData.language) {
      setLanguageState(userData.language);
      localStorage.setItem('fincontrol_language', userData.language);
    }
    return userData;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authAPI.register(name, email, password, confirmPassword);
    const { user: userData, token } = res.data;
    saveUser(userData, token, true);
    setUser(userData);
    return userData;
  };

  const setCurrency = (c) => {
    setCurrencyState(c);
    localStorage.setItem('fincontrol_currency', c);
  };

  const setLanguage = (l) => {
    setLanguageState(l);
    localStorage.setItem('fincontrol_language', l);
  };

  const logout = () => {
    clearAll();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user, currency, setCurrency, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
