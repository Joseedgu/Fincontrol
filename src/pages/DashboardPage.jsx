import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, LogOut, LayoutGrid, ArrowDownRight, ArrowUpRight, TrendingUp, Plus, Activity, Settings, Coffee, Zap, ShoppingBag, Utensils, Wallet, CreditCard, Trash2, Filter, ChevronLeft, ChevronRight, Save, User, Globe, Palette, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, transactionsAPI, reportsAPI, settingsAPI, goalsAPI } from '../services/api';
import Logo from '../components/Logo';
import TransactionModal from '../components/TransactionModal';
import GoalModal from '../components/GoalModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import '../Dashboard.css';

const navItems = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Panel' },
  { id: 'income', icon: ArrowDownRight, label: 'Ingresos' },
  { id: 'expenses', icon: ArrowUpRight, label: 'Gastos' },
  { id: 'reports', icon: Activity, label: 'Reportes' },
  { id: 'settings', icon: Settings, label: 'Configuración' },
];

const iconMap = {
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'coffee': Coffee,
  'zap': Zap,
  'wallet': Wallet,
  'credit-card': CreditCard,
};

const getTransactionIcon = (iconName) => iconMap[iconName] || Wallet;

const formatCurrency = (amount, currency = 'DOP') => {
  const prefix = currency === 'DOP' ? 'RD$' : '$';
  return `${prefix} ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* ─── TRANSACTIONS VIEW (Ingresos / Gastos) ─── */
const TransactionsView = ({ type, onAddNew }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const isIncome = type === 'income';

  useEffect(() => {
    loadTransactions();
  }, [type, page]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await transactionsAPI.getAll({ type, limit, page, sort: '-transaction_date' });
      setItems(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta transacción?')) return;
    try {
      await transactionsAPI.delete(id);
      loadTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const totalAmount = items.reduce((s, t) => s + Number(t.amount), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>
            {isIncome ? 'Ingresos' : 'Gastos'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            {total} {total === 1 ? 'registro' : 'registros'} • Total: {formatCurrency(totalAmount)}
          </p>
        </div>
        <button 
          onClick={onAddNew}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
            background: isIncome ? 'var(--color-emerald)' : 'var(--color-danger)',
            color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700,
            cursor: 'pointer', fontSize: '14px'
          }}
        >
          <Plus size={18} /> {isIncome ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }} />
          <p>Cargando...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
          <Wallet size={48} style={{ margin: '0 auto 16px auto', opacity: 0.3 }} />
          <p style={{ fontSize: '16px', fontWeight: 600 }}>No hay {isIncome ? 'ingresos' : 'gastos'} registrados</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Haz clic en el botón de arriba para agregar uno.</p>
        </div>
      ) : (
        <>
          <div className="tx-table">
            <div className="tx-table-header">
              <span style={{ flex: 2 }}>Título</span>
              <span style={{ flex: 1.5 }}>Categoría</span>
              <span style={{ flex: 1.5 }}>Fecha</span>
              <span style={{ flex: 1, textAlign: 'right' }}>Monto</span>
              <span style={{ flex: 0.5, textAlign: 'center' }}></span>
            </div>
            {items.map((tx) => {
              const Icon = getTransactionIcon(tx.icon);
              return (
                <motion.div 
                  key={tx.id} 
                  className="tx-table-row"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div className="tx-icon" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{tx.title}</span>
                      {tx.description && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{tx.description}</p>}
                    </div>
                  </div>
                  <span style={{ flex: 1.5, color: 'var(--color-text-secondary)', fontSize: '14px' }}>{tx.category}</span>
                  <span style={{ flex: 1.5, color: 'var(--color-text-muted)', fontSize: '14px' }}>{formatDate(tx.transactionDate)}</span>
                  <span style={{ flex: 1, textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: isIncome ? 'var(--color-emerald)' : 'var(--color-danger)' }}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span style={{ flex: 0.5, textAlign: 'center' }}>
                    <button onClick={() => handleDelete(tx.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Página {page} de {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

/* ─── REPORTS VIEW ─── */
const ReportsView = () => {
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    loadReports();
  }, [month, year]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [ovRes, catRes, incRes] = await Promise.all([
        reportsAPI.getOverview({ month, year }),
        reportsAPI.getByCategory({ month, year }),
        reportsAPI.getIncomeVsExpenses({ year }),
      ]);
      setOverview(ovRes.data);
      setCategories(catRes.data.items || []);
      setMonthlyData(incRes.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p>Cargando reportes...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const PIE_COLORS = ['#042B49', '#00C48C', '#DC2626', '#00C6FF', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];

  const chartData = monthlyData.map(m => ({
    name: monthNames[m.month - 1].slice(0, 3),
    Ingresos: m.income,
    Gastos: m.expenses,
  }));

  const pieData = categories.map(c => ({ name: c.category, value: c.amount }));
  const totalCat = pieData.reduce((s, c) => s + c.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: 700, fontSize: '13px', color: '#042B49', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '13px', color: p.color, fontWeight: 600 }}>
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>Reportes Financieros</h1>

      {/* Month Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={prevMonth} className="page-btn"><ChevronLeft size={18} /></button>
        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-primary)', minWidth: '160px', textAlign: 'center' }}>
          {monthNames[month - 1]} {year}
        </span>
        <button onClick={nextMonth} className="page-btn"><ChevronRight size={18} /></button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="report-card">
          <p className="report-card-label">Ingresos del Mes</p>
          <p className="report-card-value" style={{ color: 'var(--color-emerald)' }}>{formatCurrency(overview?.totalIncome || 0)}</p>
        </div>
        <div className="report-card">
          <p className="report-card-label">Gastos del Mes</p>
          <p className="report-card-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(overview?.totalExpenses || 0)}</p>
        </div>
        <div className="report-card">
          <p className="report-card-label">Balance</p>
          <p className="report-card-value" style={{ color: (overview?.balance || 0) >= 0 ? 'var(--color-emerald)' : 'var(--color-danger)' }}>
            {formatCurrency(overview?.balance || 0)}
          </p>
        </div>
      </div>

      {/* ─── AREA CHART: Ingresos vs Gastos ─── */}
      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h3 className="panel-title" style={{ marginBottom: '24px', fontSize: '18px' }}>Flujo de Efectivo — {year}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C48C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C48C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Ingresos" stroke="#00C48C" strokeWidth={2.5} fill="url(#gradIncome)" dot={{ r: 4, fill: '#00C48C', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            <Area type="monotone" dataKey="Gastos" stroke="#DC2626" strokeWidth={2.5} fill="url(#gradExpense)" dot={{ r: 4, fill: '#DC2626', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#00C48C' }}></div> Ingresos
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#111827' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#DC2626' }}></div> Gastos
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* ─── PIE CHART: Categorías ─── */}
        <div className="panel-card">
          <h3 className="panel-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Distribución por Categoría</h3>
          {pieData.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Sin datos para este mes</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center' }}>
                {pieData.map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                    {cat.name} ({totalCat > 0 ? ((cat.value / totalCat) * 100).toFixed(0) : 0}%)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─── Category Breakdown List ─── */}
        <div className="panel-card">
          <h3 className="panel-title" style={{ marginBottom: '24px', fontSize: '18px' }}>Desglose de Gastos</h3>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Sin datos para este mes</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categories.map((cat, i) => {
                const maxCat = Math.max(...categories.map(c => c.amount));
                const pct = maxCat > 0 ? (cat.amount / maxCat) * 100 : 0;
                const globalPct = totalCat > 0 ? ((cat.amount / totalCat) * 100).toFixed(1) : '0';
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>{cat.category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{globalPct}%</span>
                        <span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{formatCurrency(cat.amount)}</span>
                      </div>
                    </div>
                    <div className="progress-track" style={{ height: '8px' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: PIE_COLORS[i % PIE_COLORS.length], transition: 'width 0.5s' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── SETTINGS VIEW ─── */
const SettingsView = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [prefs, setPrefs] = useState({ currency: 'DOP', language: 'es', theme: 'light' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setPrefs(res.data.preferences);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await settingsAPI.update(prefs);
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutAll = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p>Cargando configuración...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '32px' }}>Configuración</h1>

      {success && (
        <div style={{ background: 'rgba(0,196,140,0.1)', border: '1px solid var(--color-emerald)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', color: 'var(--color-emerald)', fontWeight: 600, fontSize: '14px' }}>
          ✓ {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Card */}
        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--color-navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{user?.name || user?.firstName || 'Usuario'}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{user?.email || ''}</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            Tu perfil está vinculado a tu correo electrónico. Para cambiar tu contraseña, usa la opción en la pantalla de inicio de sesión.
          </p>
        </div>

        {/* Preferences Card */}
        <div className="panel-card">
          <h3 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)' }}>Preferencias</h3>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} /> Moneda
            </label>
            <select className="form-input no-icon" value={prefs.currency} onChange={(e) => setPrefs(p => ({ ...p, currency: e.target.value }))}>
              <option value="DOP">Peso Dominicano (DOP)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={14} /> Idioma
            </label>
            <select className="form-input no-icon" value={prefs.language} onChange={(e) => setPrefs(p => ({ ...p, language: e.target.value }))}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={14} /> Tema
            </label>
            <select className="form-input no-icon" value={prefs.theme} onChange={(e) => setPrefs(p => ({ ...p, theme: e.target.value }))}>
              <option value="light">Claro</option>
              <option value="dark">Oscuro (próximamente)</option>
            </select>
          </div>

          <button onClick={handleSave} className="btn-primary" style={{ gap: '8px' }} disabled={saving}>
            {saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={18} /> Guardar Cambios</>}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="panel-card" style={{ marginTop: '24px', borderColor: 'var(--color-danger)' }}>
        <h3 style={{ fontWeight: 700, color: 'var(--color-danger)', marginBottom: '12px' }}>Zona de Peligro</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
          Cerrar sesión en todos los dispositivos eliminará todos los tokens activos.
        </p>
        <button onClick={handleLogoutAll} style={{ padding: '10px 20px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
          Cerrar todas las sesiones
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════ */
/* ═══  MAIN DASHBOARD PAGE COMPONENT   ═══ */
/* ═══════════════════════════════════════════ */

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardAPI.getData();
      setDashData(res.data);
    } catch (err) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.firstName || user?.name || 'Usuario';

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw', background: '#F8FAFC', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #E5E7EB', borderTopColor: 'var(--color-navy)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: '500' }}>Cargando dashboard...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const summary = dashData?.summaryCards || {};
  const transactions = dashData?.recentTransactions || [];
  const goals = dashData?.goals || [];
  const header = dashData?.header || {};

  const renderContent = () => {
    switch (currentView) {
      case 'income':
        return <TransactionsView type="income" onAddNew={() => setModalType('income')} />;
      case 'expenses':
        return <TransactionsView type="expense" onAddNew={() => setModalType('expense')} />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="welcome-section">
        <h1 className="welcome-title">{header.greeting || `¡Bienvenido de nuevo, ${userName}!`}</h1>
        <p className="welcome-subtitle">
          {header.subtitle || 'Comienza a registrar tus movimientos para obtener un resumen financiero.'}
        </p>
      </motion.div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="stats-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card dark">
          <div>
            <h3 className="stat-label-dark">Saldo Total</h3>
            <div className="stat-value-dark">{formatCurrency(summary.totalBalance?.amount || 0, summary.totalBalance?.currency)}</div>
          </div>
          <div className="stat-trend-dark">
            <TrendingUp size={16} />
            {summary.totalBalance?.changePercent > 0 ? '+' : ''}{summary.totalBalance?.changePercent || 0}% {summary.totalBalance?.changeLabel || 'desde el mes pasado'}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green"><ArrowDownRight size={24} strokeWidth={2.5} /></div>
            <button 
              onClick={() => setModalType('income')}
              style={{ background: 'none', border: 'none', color: 'var(--color-emerald)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Añadir
            </button>
          </div>
          <div>
            <h3 className="stat-label">Ingresos Mensuales</h3>
            <div className="stat-value">{formatCurrency(summary.monthlyIncome?.amount || 0, summary.monthlyIncome?.currency)}</div>
            <div className="progress-track">
              <div className="progress-fill green" style={{ width: `${summary.monthlyIncome?.progressPercent || 0}%` }}></div>
            </div>
            <div className="stat-desc">{summary.monthlyIncome?.progressPercent || 0}% {summary.monthlyIncome?.label || 'de los ingresos mensuales proyectados'}</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red"><ArrowUpRight size={24} strokeWidth={2.5} /></div>
            <button 
              onClick={() => setModalType('expense')}
              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Añadir
            </button>
          </div>
          <div>
            <h3 className="stat-label">Gastos Mensuales</h3>
            <div className="stat-value">{formatCurrency(summary.monthlyExpenses?.amount || 0, summary.monthlyExpenses?.currency)}</div>
            <div className="progress-track">
              <div className="progress-fill red" style={{ width: `${summary.monthlyExpenses?.budgetUsedPercent || 0}%` }}></div>
            </div>
            <div className="stat-desc">{summary.monthlyExpenses?.label || 'Aún no hay presupuesto configurado'}</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Transacciones Recientes</h2>
            <button className="panel-action" onClick={() => setCurrentView('reports')}>Ver todo</button>
          </div>
          <div className="tx-list">
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
                <Wallet size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>No hay transacciones aún</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  <button onClick={() => setModalType('income')} style={{ padding: '8px 16px', background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Ingreso</button>
                  <button onClick={() => setModalType('expense')} style={{ padding: '8px 16px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Gasto</button>
                </div>
              </div>
            ) : (
              transactions.map((tx, idx) => {
                const Icon = getTransactionIcon(tx.icon);
                return (
                  <div key={tx.id || idx} className="tx-item">
                    <div className="tx-info">
                      <div className="tx-icon"><Icon size={24} strokeWidth={2} /></div>
                      <div>
                        <h4 className="tx-title">{tx.title}</h4>
                        <p className="tx-desc">{tx.description || tx.category} • {formatDate(tx.transactionDate)}</p>
                      </div>
                    </div>
                    <span className={`tx-amount ${tx.type === 'income' ? 'income' : ''}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="panel-card gray" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="panel-title" style={{ marginBottom: '32px' }}>Metas Futuras</h2>
          <div className="goals-list">
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
                <Plus size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                <p style={{ fontSize: '14px' }}>No tienes metas activas</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>Crea tu primera meta de ahorro</p>
              </div>
            ) : (
              goals.map((goal, idx) => (
                <div key={goal.id || idx}>
                  <div className="goal-header">
                    <h4 className="goal-title">{goal.title}</h4>
                    <span className="goal-percent">{goal.progressPercent || 0}%</span>
                  </div>
                  <div className="goal-track">
                    <div
                      className={`goal-fill ${goal.isCompleted ? 'emerald' : 'navy'}`}
                      style={{ width: `${goal.progressPercent || 0}%` }}
                    ></div>
                  </div>
                  <p className="goal-meta">
                    Meta: {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              ))
            )}
          </div>
          <button className="btn-secondary" onClick={() => setModalType('goal')}>
            Crear Nueva Meta
          </button>
        </motion.div>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      {/* ───── Left Sidebar ───── */}
      <aside className="sidebar">
        <div>
          <div className="logo-container">
            <Logo variant="dark" />
          </div>
          <nav>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button 
                key={id} 
                onClick={() => setCurrentView(id)}
                className={`nav-item ${currentView === id ? 'active' : ''}`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </aside>

      {/* ───── Main Content Area ───── */}
      <main className="main-content">
        <header className="header">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="Buscar transacciones, reportes..." className="search-input" />
          </div>
          <div className="header-actions">
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="icon-btn">
                <Bell size={24} />
                {dashData?.notifications?.unreadCount > 0 && <div className="badge"></div>}
              </button>
              <button className="icon-btn">
                <HelpCircle size={24} />
              </button>
            </div>
            <div className="divider"></div>
            <div className="user-profile">
              <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
              <span>{userName}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={modalType === 'income' || modalType === 'expense'} 
        type={modalType} 
        onClose={() => setModalType(null)} 
        onTransactionAdded={() => { loadDashboard(); }}
      />
      
      <GoalModal 
        isOpen={modalType === 'goal'} 
        onClose={() => setModalType(null)} 
        onGoalAdded={loadDashboard}
      />
    </div>
  );
};

export default DashboardPage;
