import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, LogOut, LayoutGrid, TrendingUp, Plus, Activity, Settings, Coffee, Zap, ShoppingBag, Utensils, Wallet, CreditCard, Trash2, ChevronLeft, ChevronRight, Save, User, Globe, Palette, Loader2, Target, ArrowDownRight, ArrowUpRight, DollarSign, Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, transactionsAPI, reportsAPI, settingsAPI, goalsAPI, debtsAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Logo from '../components/Logo';
import TransactionModal from '../components/TransactionModal';
import GoalModal from '../components/GoalModal';
import '../Dashboard.css';

const navItems = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Panel' },
  { id: 'goals', icon: Target, label: 'Metas' },
  { id: 'debts', icon: Users, label: 'Deudas' },
  { id: 'reports', icon: Activity, label: 'Reportes' },
  { id: 'settings', icon: Settings, label: 'Configuración' },
];

const iconMap = {
  'shopping-bag': ShoppingBag, 'utensils': Utensils, 'coffee': Coffee,
  'zap': Zap, 'wallet': Wallet, 'credit-card': CreditCard,
};
const getTransactionIcon = (iconName) => iconMap[iconName] || Wallet;

const CURRENCY_SYMBOLS = { DOP: 'RD$', USD: '$', EUR: '€' };
const formatCurrency = (amount, cur) => {
  const prefix = CURRENCY_SYMBOLS[cur] || 'RD$';
  return `${prefix} ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/* ─── AVATAR COMPONENT ─── */
const UserAvatar = ({ name, size = 36 }) => {
  const initials = (name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #042B49, #00C6FF)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.4, letterSpacing: '0.02em',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
};

/* ════════════════════════════════════════════ */
/* ══  GOALS VIEW (Metas de Ahorro)         ══ */
/* ════════════════════════════════════════════ */
const GOAL_COLORS = ['#042B49', '#00C48C', '#6366F1', '#F59E0B', '#EC4899', '#00C6FF', '#8B5CF6', '#DC2626'];

const GoalsView = () => {
  const { currency } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [fundModal, setFundModal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', targetAmount: '', deadline: '' });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await goalsAPI.getAll();
      setGoals(res.data.items || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await goalsAPI.create({ title: createForm.title, targetAmount: Number(createForm.targetAmount), deadline: createForm.deadline || null });
      setCreateForm({ title: '', targetAmount: '', deadline: '' });
      setShowCreate(false);
      loadGoals();
    } catch (err) { console.error(err); }
    finally { setCreateLoading(false); }
  };

  const handleFund = async () => {
    if (!fundAmount || Number(fundAmount) <= 0) return;
    setFundLoading(true);
    try {
      await goalsAPI.addFunds(fundModal.id, Number(fundAmount));
      setFundModal(null);
      setFundAmount('');
      loadGoals();
    } catch (err) { console.error(err); }
    finally { setFundLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    try { await goalsAPI.delete(id); loadGoals(); } catch (err) { console.error(err); }
  };

  const fmt = (v) => formatCurrency(v, currency);
  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} /><p>Cargando metas...</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>Metas de Ahorro</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Ahorrado: {fmt(totalSaved)} de {fmt(totalTarget)}</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
          <Plus size={16} /> Nueva Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>
          <Target size={42} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p style={{ fontSize: '15px', fontWeight: 600 }}>No tienes metas activas</p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>Crea tu primera meta de ahorro para comenzar.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {goals.map((goal, i) => {
            const color = GOAL_COLORS[i % GOAL_COLORS.length];
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            return (
              <motion.div key={goal.id} className="goal-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.3, flex: 1, paddingRight: '8px' }}>{goal.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {goal.isCompleted && <span style={{ background: 'var(--color-emerald)', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '5px' }}>✓</span>}
                    <button onClick={() => handleDelete(goal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px' }} title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{fmt(goal.currentAmount)}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color }}>{goal.progressPercent}%</span>
                </div>
                <div className="progress-track" style={{ height: '6px', marginBottom: '8px' }}>
                  <div style={{ width: `${goal.progressPercent}%`, height: '100%', borderRadius: '3px', background: color, transition: 'width 0.5s' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                  <span>Meta: {fmt(goal.targetAmount)}</span>
                  <span>Faltan: {fmt(remaining)}</span>
                </div>
                {goal.deadline && <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Límite: {formatDate(goal.deadline)}</p>}
                <button
                  onClick={() => { setFundModal(goal); setFundAmount(''); }}
                  style={{ width: '100%', padding: '8px 0', background: `${color}12`, color, border: `1px solid ${color}30`, borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
                >
                  <Plus size={14} /> Agregar Fondos
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-content" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowCreate(false)} className="modal-close"><X size={24} /></button>
              <h2 className="modal-title">Crear Nueva Meta</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input no-icon" required value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} placeholder="Ej. Vacaciones, Fondo de Emergencia" /></div>
                <div className="form-group"><label className="form-label">Monto Objetivo (RD$) *</label><input className="form-input no-icon" type="number" step="0.01" min="1" required value={createForm.targetAmount} onChange={e => setCreateForm(p => ({ ...p, targetAmount: e.target.value }))} placeholder="0.00" /></div>
                <div className="form-group"><label className="form-label">Fecha Límite (Opcional)</label><input className="form-input no-icon" type="date" value={createForm.deadline} onChange={e => setCreateForm(p => ({ ...p, deadline: e.target.value }))} /></div>
                <button type="submit" className="btn-primary" style={{ marginTop: '16px' }} disabled={createLoading}>{createLoading ? 'Creando...' : 'Crear Meta'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fund Modal */}
      <AnimatePresence>
        {fundModal && (
          <div className="modal-overlay" onClick={() => setFundModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-content" onClick={e => e.stopPropagation()}>
              <button onClick={() => setFundModal(null)} className="modal-close"><X size={24} /></button>
              <h2 className="modal-title">Agregar a "{fundModal.title}"</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>Progreso actual: {fmt(fundModal.currentAmount)} / {fmt(fundModal.targetAmount)}</p>
              <div className="progress-track" style={{ height: '10px', marginBottom: '24px' }}>
                <div style={{ width: `${fundModal.progressPercent}%`, height: '100%', borderRadius: '5px', background: 'var(--color-emerald)', transition: 'width 0.5s' }}></div>
              </div>
              <div className="form-group">
                <label className="form-label">Monto a agregar (RD$)</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon" />
                  <input className="form-input" type="number" step="0.01" min="0.01" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0.00" autoFocus />
                </div>
              </div>
              <button onClick={handleFund} className="btn-primary" style={{ marginTop: '16px', background: 'var(--color-emerald)' }} disabled={fundLoading || !fundAmount}>
                {fundLoading ? 'Agregando...' : `Agregar ${fundAmount ? fmt(fundAmount) : ''}`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
};

/* ════════════════════════════════════════════ */
/* ══  DEBTS VIEW (Deudas)                  ══ */
/* ════════════════════════════════════════════ */
const DebtsView = () => {
  const { currency } = useAuth();
  const [data, setData] = useState({ iOwe: [], theyOwe: [], totalIOwe: 0, totalTheyOwe: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ personName: '', amount: '', type: 'i_owe', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => { loadDebts(); }, []);

  const loadDebts = async () => {
    setLoading(true);
    try { const res = await debtsAPI.getAll(); setData(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await debtsAPI.create({ personName: createForm.personName, amount: Number(createForm.amount), type: createForm.type, description: createForm.description });
      setCreateForm({ personName: '', amount: '', type: 'i_owe', description: '' });
      setShowCreate(false);
      loadDebts();
    } catch (err) { console.error(err); }
    finally { setCreateLoading(false); }
  };

  const handlePay = async () => {
    if (!payAmount || Number(payAmount) <= 0) return;
    setPayLoading(true);
    try { await debtsAPI.pay(payModal.id, Number(payAmount)); setPayModal(null); setPayAmount(''); loadDebts(); }
    catch (err) { console.error(err); }
    finally { setPayLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta deuda?')) return;
    try { await debtsAPI.delete(id); loadDebts(); } catch (err) { console.error(err); }
  };

  const DEBT_COLORS = { high: '#DC2626', med: '#F59E0B', low: '#00C48C' };
  const getDebtColor = (pct) => pct >= 70 ? DEBT_COLORS.low : pct >= 30 ? DEBT_COLORS.med : DEBT_COLORS.high;

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} /><p>Cargando deudas...</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  const renderDebtCard = (debt) => {
    const remaining = debt.amount - debt.paidAmount;
    const color = getDebtColor(debt.progressPercent);
    const isMeDeben = debt.type === 'they_owe';
    const mainColor = isMeDeben ? 'var(--color-emerald)' : 'var(--color-danger)';
    
    return (
      <motion.div key={debt.id} className="debt-card-modern" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderLeft: `4px solid ${mainColor}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserAvatar name={debt.personName} size={36} />
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '15px' }}>{debt.personName}</h4>
              {debt.description && <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{debt.description}</p>}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(debt.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }} title="Eliminar"><Trash2 size={16} /></button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Pagado: <span style={{fontWeight: 700, color: 'var(--color-text-primary)'}}>{formatCurrency(debt.paidAmount, currency)}</span></span>
          <span style={{ fontSize: '13px', fontWeight: 800, color }}>{debt.progressPercent}%</span>
        </div>

        <div className="progress-track" style={{ height: '6px', marginBottom: '12px' }}>
          <div style={{ width: `${debt.progressPercent}%`, height: '100%', borderRadius: '3px', background: color, transition: 'width 0.5s' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          <span>Total: {formatCurrency(debt.amount, currency)}</span>
          <span>Resta: <span style={{color: mainColor, fontWeight: 700}}>{formatCurrency(remaining, currency)}</span></span>
        </div>

        <button
          onClick={() => { setPayModal(debt); setPayAmount(''); }}
          style={{ width: '100%', padding: '10px 0', background: isMeDeben ? 'var(--color-emerald-bg)' : 'var(--color-danger-bg)', color: mainColor, border: `1px solid ${isMeDeben ? 'rgba(0,196,140,0.3)' : 'rgba(220,38,38,0.3)'}`, borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
        >
          {isMeDeben ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />} 
          {isMeDeben ? 'Recibir Pago' : 'Abonar a Deuda'}
        </button>
      </motion.div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '4px' }}>Deudas</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Lleva el control de lo que debes y te deben</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
          <Plus size={18} /> Nueva Deuda
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Debo */}
        <div className="panel-card" style={{ borderTop: '3px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)' }}>Debo</h3>
            <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--color-danger)', fontFamily: 'monospace' }}>-{formatCurrency(data.totalIOwe, currency)}</span>
          </div>
          {data.iOwe.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>No debes nada 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{data.iOwe.map(renderDebtCard)}</div>
          )}
        </div>

        {/* Me deben */}
        <div className="panel-card" style={{ borderTop: '3px solid var(--color-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '18px', color: 'var(--color-text-primary)' }}>Me deben</h3>
            <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--color-emerald)', fontFamily: 'monospace' }}>{formatCurrency(data.totalTheyOwe, currency)}</span>
          </div>
          {data.theyOwe.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>Nadie te debe</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{data.theyOwe.map(renderDebtCard)}</div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-content" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowCreate(false)} className="modal-close"><X size={24} /></button>
              <h2 className="modal-title">Registrar Deuda</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setCreateForm(p => ({ ...p, type: 'i_owe' }))} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${createForm.type === 'i_owe' ? 'var(--color-danger)' : 'var(--color-border)'}`, background: createForm.type === 'i_owe' ? 'var(--color-danger-bg)' : 'transparent', fontWeight: 700, cursor: 'pointer', color: createForm.type === 'i_owe' ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>Debo</button>
                    <button type="button" onClick={() => setCreateForm(p => ({ ...p, type: 'they_owe' }))} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${createForm.type === 'they_owe' ? 'var(--color-emerald)' : 'var(--color-border)'}`, background: createForm.type === 'they_owe' ? 'var(--color-emerald-bg)' : 'transparent', fontWeight: 700, cursor: 'pointer', color: createForm.type === 'they_owe' ? 'var(--color-emerald)' : 'var(--color-text-secondary)' }}>Me deben</button>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Nombre de la persona *</label><input className="form-input no-icon" required value={createForm.personName} onChange={e => setCreateForm(p => ({ ...p, personName: e.target.value }))} placeholder="Ej. Carlos, María..." /></div>
                <div className="form-group"><label className="form-label">Monto (RD$) *</label><input className="form-input no-icon" type="number" step="0.01" min="1" required value={createForm.amount} onChange={e => setCreateForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
                <div className="form-group"><label className="form-label">Descripción (Opcional)</label><input className="form-input no-icon" value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej. Dinero para almuerzo" /></div>
                <button type="submit" className="btn-primary" style={{ marginTop: '16px', background: createForm.type === 'i_owe' ? 'var(--color-danger)' : 'var(--color-emerald)' }} disabled={createLoading}>{createLoading ? 'Creando...' : 'Registrar Deuda'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Modal */}
      <AnimatePresence>
        {payModal && (
          <div className="modal-overlay" onClick={() => setPayModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="modal-content" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPayModal(null)} className="modal-close"><X size={24} /></button>
              <h2 className="modal-title">{payModal.type === 'i_owe' ? 'Abonar a' : 'Recibir de'} {payModal.personName}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>Pagado: {formatCurrency(payModal.paidAmount, currency)} / {formatCurrency(payModal.amount, currency)}</p>
              <div className="progress-track" style={{ height: '10px', marginBottom: '24px' }}>
                <div style={{ width: `${payModal.progressPercent}%`, height: '100%', borderRadius: '5px', background: payModal.type === 'i_owe' ? 'var(--color-danger)' : 'var(--color-emerald)', transition: 'width 0.5s' }}></div>
              </div>
              <div className="form-group">
                <label className="form-label">Monto a {payModal.type === 'i_owe' ? 'pagar' : 'recibir'} (RD$)</label>
                <div className="input-wrapper"><DollarSign className="input-icon" /><input className="form-input" type="number" step="0.01" min="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" autoFocus /></div>
              </div>
              <button onClick={handlePay} className="btn-primary" style={{ marginTop: '16px', background: payModal.type === 'i_owe' ? 'var(--color-danger)' : 'var(--color-emerald)' }} disabled={payLoading || !payAmount}>
                {payLoading ? 'Registrando...' : `Registrar ${payAmount ? formatCurrency(payAmount, currency) : ''}`}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
};

/* ════════════════════════════════════════════ */
/* ══  REPORTS VIEW                         ══ */
/* ════════════════════════════════════════════ */
const ReportsView = () => {
  const { currency } = useAuth();
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => { loadReports(); }, [month, year]);

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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} /><p>Cargando reportes...</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  const PIE_COLORS = ['#042B49', '#00C48C', '#DC2626', '#00C6FF', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6'];
  const chartData = monthlyData.map(m => ({ name: monthNames[m.month - 1].slice(0, 3), Ingresos: m.income, Gastos: m.expenses }));
  const pieData = categories.map(c => ({ name: c.category, value: c.amount }));
  const totalCat = pieData.reduce((s, c) => s + c.value, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ fontWeight: 700, fontSize: '13px', color: '#042B49', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (<p key={i} style={{ fontSize: '13px', color: p.color, fontWeight: 600 }}>{p.name}: {formatCurrency(p.value, currency)}</p>))}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '8px' }}>Reportes Financieros</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={prevMonth} className="page-btn"><ChevronLeft size={18} /></button>
        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-primary)', minWidth: '160px', textAlign: 'center' }}>{monthNames[month - 1]} {year}</span>
        <button onClick={nextMonth} className="page-btn"><ChevronRight size={18} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="report-card"><p className="report-card-label">Ingresos del Mes</p><p className="report-card-value" style={{ color: 'var(--color-emerald)' }}>{formatCurrency(overview?.totalIncome || 0, currency)}</p></div>
        <div className="report-card"><p className="report-card-label">Gastos del Mes</p><p className="report-card-value" style={{ color: 'var(--color-danger)' }}>{formatCurrency(overview?.totalExpenses || 0, currency)}</p></div>
        <div className="report-card"><p className="report-card-label">Balance</p><p className="report-card-value" style={{ color: (overview?.balance || 0) >= 0 ? 'var(--color-emerald)' : 'var(--color-danger)' }}>{formatCurrency(overview?.balance || 0, currency)}</p></div>
      </div>
      <div className="panel-card" style={{ marginBottom: '24px' }}>
        <h3 className="panel-title" style={{ marginBottom: '24px', fontSize: '18px' }}>Flujo de Efectivo — {year}</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00C48C" stopOpacity={0.3} /><stop offset="95%" stopColor="#00C48C" stopOpacity={0} /></linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} /><stop offset="95%" stopColor="#DC2626" stopOpacity={0} /></linearGradient>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#00C48C' }}></div> Ingresos</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#DC2626' }}></div> Gastos</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="panel-card">
          <h3 className="panel-title" style={{ marginBottom: '16px', fontSize: '18px' }}>Distribución por Categoría</h3>
          {pieData.length === 0 ? (<p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Sin datos para este mes</p>) : (<>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value" strokeWidth={0}>{pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}</Pie><Tooltip formatter={v => formatCurrency(v, currency)} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center' }}>{pieData.map((cat, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}><div style={{ width: '10px', height: '10px', borderRadius: '3px', background: PIE_COLORS[i % PIE_COLORS.length] }}></div>{cat.name} ({totalCat > 0 ? ((cat.value / totalCat) * 100).toFixed(0) : 0}%)</div>))}</div>
          </>)}
        </div>
        <div className="panel-card">
          <h3 className="panel-title" style={{ marginBottom: '24px', fontSize: '18px' }}>Desglose de Gastos</h3>
          {categories.length === 0 ? (<p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Sin datos para este mes</p>) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {categories.map((cat, i) => {
                const maxCat = Math.max(...categories.map(c => c.amount));
                const pct = maxCat > 0 ? (cat.amount / maxCat) * 100 : 0;
                const globalPct = totalCat > 0 ? ((cat.amount / totalCat) * 100).toFixed(1) : '0';
                return (<div key={i}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', background: PIE_COLORS[i % PIE_COLORS.length] }}></div><span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>{cat.category}</span></div><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{globalPct}%</span><span style={{ fontWeight: 700, fontSize: '14px', fontFamily: 'monospace' }}>{formatCurrency(cat.amount, currency)}</span></div></div><div className="progress-track" style={{ height: '8px' }}><div style={{ width: `${pct}%`, height: '100%', borderRadius: '4px', background: PIE_COLORS[i % PIE_COLORS.length], transition: 'width 0.5s' }}></div></div></div>);
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════ */
/* ══  SETTINGS VIEW                        ══ */
/* ════════════════════════════════════════════ */
const SettingsView = () => {
  const { user, logout, setCurrency } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [prefs, setPrefs] = useState({ currency: 'DOP', language: 'es', theme: 'light' });

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try { const res = await settingsAPI.get(); setPrefs(res.data.preferences); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setSuccess('');
    try {
      await settingsAPI.update(prefs);
      setCurrency(prefs.currency);
      setSuccess('Configuración guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} /><p>Cargando configuración...</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy)', marginBottom: '32px' }}>Configuración</h1>
      {success && (<div style={{ background: 'rgba(0,196,140,0.1)', border: '1px solid var(--color-emerald)', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px', color: 'var(--color-emerald)', fontWeight: 600, fontSize: '14px' }}>✓ {success}</div>)}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <UserAvatar name={user?.name || user?.firstName || 'U'} size={56} />
            <div>
              <h3 style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{user?.name || user?.firstName || 'Usuario'}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{user?.email || ''}</p>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>Tu perfil está vinculado a tu correo electrónico.</p>
        </div>
        <div className="panel-card">
          <h3 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--color-text-primary)' }}>Preferencias</h3>
          <div className="form-group" style={{ marginBottom: '16px' }}><label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={14} /> Moneda</label><select className="form-input no-icon" value={prefs.currency} onChange={e => setPrefs(p => ({ ...p, currency: e.target.value }))}><option value="DOP">Peso Dominicano (DOP)</option><option value="USD">Dólar (USD)</option><option value="EUR">Euro (EUR)</option></select></div>
          <div className="form-group" style={{ marginBottom: '16px' }}><label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={14} /> Idioma</label><select className="form-input no-icon" value={prefs.language} onChange={e => setPrefs(p => ({ ...p, language: e.target.value }))}><option value="es">Español</option><option value="en">English</option></select></div>
          <div className="form-group" style={{ marginBottom: '24px' }}><label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Palette size={14} /> Tema</label><select className="form-input no-icon" value={prefs.theme} onChange={e => setPrefs(p => ({ ...p, theme: e.target.value }))}><option value="light">Claro</option><option value="dark">Oscuro (próximamente)</option></select></div>
          <button onClick={handleSave} className="btn-primary" style={{ gap: '8px' }} disabled={saving}>{saving ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={18} /> Guardar Cambios</>}</button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
};

/* ════════════════════════════════════════════ */
/* ══  MAIN DASHBOARD PAGE                  ══ */
/* ════════════════════════════════════════════ */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, currency } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState(null);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try { const res = await dashboardAPI.getData(); setDashData(res.data); }
    catch (err) { setError(err.message || 'Error cargando datos'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const userName = user?.firstName || user?.name || 'Usuario';
  const fmt = (v) => formatCurrency(v, currency);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', background: '#F8FAFC', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: 'var(--color-navy)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: '500' }}>Cargando dashboard...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const summary = dashData?.summaryCards || {};
  const transactions = dashData?.recentTransactions || [];
  const goals = dashData?.goals || [];
  const header = dashData?.header || {};

  const renderContent = () => {
    switch (currentView) {
      case 'goals': return <GoalsView />;
      case 'debts': return <DebtsView />;
      case 'reports': return <ReportsView />;
      case 'settings': return <SettingsView />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="welcome-section">
        <h1 className="welcome-title">{header.greeting || `¡Bienvenido de nuevo, ${userName}!`}</h1>
        <p className="welcome-subtitle">{header.subtitle || 'Comienza a registrar tus movimientos para obtener un resumen financiero.'}</p>
      </motion.div>
      {error && (<div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px' }}>{error}</div>)}
      <div className="stats-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card dark">
          <div><h3 className="stat-label-dark">Saldo Total</h3><div className="stat-value-dark">{fmt(summary.totalBalance?.amount || 0)}</div></div>
          <div className="stat-trend-dark"><TrendingUp size={16} />{summary.totalBalance?.changePercent > 0 ? '+' : ''}{summary.totalBalance?.changePercent || 0}% {summary.totalBalance?.changeLabel || 'desde el mes pasado'}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green"><ArrowDownRight size={24} strokeWidth={2.5} /></div>
            <button onClick={() => setModalType('income')} style={{ background: 'none', border: 'none', color: 'var(--color-emerald)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={16} /> Añadir</button>
          </div>
          <div><h3 className="stat-label">Ingresos Mensuales</h3><div className="stat-value">{fmt(summary.monthlyIncome?.amount || 0)}</div><div className="progress-track"><div className="progress-fill green" style={{ width: `${summary.monthlyIncome?.progressPercent || 0}%` }}></div></div><div className="stat-desc">{summary.monthlyIncome?.progressPercent || 0}% {summary.monthlyIncome?.label || 'de los ingresos proyectados'}</div></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red"><ArrowUpRight size={24} strokeWidth={2.5} /></div>
            <button onClick={() => setModalType('expense')} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={16} /> Añadir</button>
          </div>
          <div><h3 className="stat-label">Gastos Mensuales</h3><div className="stat-value">{fmt(summary.monthlyExpenses?.amount || 0)}</div><div className="progress-track"><div className="progress-fill red" style={{ width: `${summary.monthlyExpenses?.budgetUsedPercent || 0}%` }}></div></div><div className="stat-desc">{summary.monthlyExpenses?.label || 'Aún no hay presupuesto configurado'}</div></div>
        </motion.div>
      </div>
      <div className="bottom-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel-card">
          <div className="panel-header"><h2 className="panel-title">Transacciones Recientes</h2><button className="panel-action" onClick={() => setCurrentView('reports')}>Ver todo</button></div>
          <div className="tx-list">
            {transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}>
                <Wallet size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} /><p style={{ fontSize: '14px' }}>No hay transacciones aún</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  <button onClick={() => setModalType('income')} style={{ padding: '8px 16px', background: 'var(--color-emerald-bg)', color: 'var(--color-emerald)', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Ingreso</button>
                  <button onClick={() => setModalType('expense')} style={{ padding: '8px 16px', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>+ Gasto</button>
                </div>
              </div>
            ) : (
              transactions.map((tx, idx) => {
                const Icon = getTransactionIcon(tx.icon);
                return (<div key={tx.id || idx} className="tx-item"><div className="tx-info"><div className="tx-icon"><Icon size={24} strokeWidth={2} /></div><div><h4 className="tx-title">{tx.title}</h4><p className="tx-desc">{tx.description || tx.category} • {formatDate(tx.transactionDate)}</p></div></div><span className={`tx-amount ${tx.type === 'income' ? 'income' : ''}`}>{tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}</span></div>);
              })
            )}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="panel-card gray" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="panel-title" style={{ marginBottom: '32px' }}>Metas de Ahorro</h2>
          <div className="goals-list">
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted)' }}><Target size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} /><p style={{ fontSize: '14px' }}>No tienes metas activas</p><p style={{ fontSize: '12px', marginTop: '4px' }}>Crea tu primera meta de ahorro</p></div>
            ) : (
              goals.map((goal, idx) => (<div key={goal.id || idx}><div className="goal-header"><h4 className="goal-title">{goal.title}</h4><span className="goal-percent">{goal.progressPercent || 0}%</span></div><div className="goal-track"><div className={`goal-fill ${goal.isCompleted ? 'emerald' : 'navy'}`} style={{ width: `${goal.progressPercent || 0}%` }}></div></div><p className="goal-meta">Meta: {fmt(goal.targetAmount)}</p></div>))
            )}
          </div>
          <button className="btn-secondary" onClick={() => setCurrentView('goals')}>Ver Todas las Metas</button>
        </motion.div>
      </div>
    </>
  );

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="logo-container"><Logo variant="dark" /></div>
          <nav>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setCurrentView(id)} className={`nav-item ${currentView === id ? 'active' : ''}`}><Icon size={20} />{label}</button>
            ))}
          </nav>
        </div>
        <button className="logout-btn" onClick={handleLogout}><LogOut size={20} />Cerrar sesión</button>
      </aside>
      <main className="main-content">
        <header className="header">
          <div className="search-bar"><Search className="search-icon" size={20} /><input type="text" placeholder="Buscar transacciones, reportes..." className="search-input" /></div>
          <div className="header-actions">
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="icon-btn"><Bell size={24} />{dashData?.notifications?.unreadCount > 0 && <div className="badge"></div>}</button>
              <button className="icon-btn"><HelpCircle size={24} /></button>
            </div>
            <div className="divider"></div>
            <div className="user-profile">
              <UserAvatar name={userName} size={36} />
              <span>{userName}</span>
            </div>
          </div>
        </header>
        <div className="dashboard-body"><AnimatePresence mode="wait">{renderContent()}</AnimatePresence></div>
      </main>
      <TransactionModal isOpen={modalType === 'income' || modalType === 'expense'} type={modalType} onClose={() => setModalType(null)} onTransactionAdded={() => { loadDashboard(); }} />
      <GoalModal isOpen={modalType === 'goal'} onClose={() => setModalType(null)} onGoalAdded={loadDashboard} />
    </div>
  );
};

export default DashboardPage;
