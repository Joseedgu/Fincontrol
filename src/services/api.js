const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getToken = () => {
  return localStorage.getItem('fincontrol_token') || sessionStorage.getItem('fincontrol_token');
};

const clearAuth = () => {
  localStorage.removeItem('fincontrol_token');
  localStorage.removeItem('fincontrol_user');
  localStorage.removeItem('fincontrol_persist');
  sessionStorage.removeItem('fincontrol_token');
  sessionStorage.removeItem('fincontrol_user');
};

const api = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    throw { status: response.status, message: data.message || 'Error del servidor', data };
  }

  return data;
};

export const authAPI = {
  login: (email, password) =>
    api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, confirmPassword) =>
    api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    }),

  me: () => api('/api/auth/me'),
};

export const dashboardAPI = {
  getData: () => api('/api/dashboard'),
};

export const transactionsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/api/transactions${query ? `?${query}` : ''}`);
  },
  create: (data) => api('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => api(`/api/transactions/${id}`, { method: 'DELETE' }),
};

export const goalsAPI = {
  getAll: () => api('/api/goals'),
  create: (data) => api('/api/goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => api(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => api(`/api/goals/${id}`, { method: 'DELETE' }),
};

export const reportsAPI = {
  getOverview: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/api/reports/overview${query ? `?${query}` : ''}`);
  },
  getIncomeVsExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/api/reports/income-vs-expenses${query ? `?${query}` : ''}`);
  },
  getByCategory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(`/api/reports/by-category${query ? `?${query}` : ''}`);
  },
};

export const settingsAPI = {
  get: () => api('/api/settings'),
  update: (data) => api('/api/settings', { method: 'PATCH', body: JSON.stringify(data) }),
};

export const userAPI = {
  getProfile: () => api('/api/users/profile'),
  updateProfile: (data) => api('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
};

export default api;
