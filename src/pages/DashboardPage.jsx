import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, LogOut, LayoutGrid, ArrowDownRight, ArrowUpRight, TrendingUp, ChevronRight, Plus, Activity, CreditCard, Coffee, Zap, ShoppingBag, Utensils, Loader2, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import Logo from '../components/Logo';
import TransactionModal from '../components/TransactionModal';
import GoalModal from '../components/GoalModal';
import '../Dashboard.css';

const navItems = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Panel' },
  { id: 'income', icon: ArrowDownRight, label: 'Ingresos' },
  { id: 'expenses', icon: ArrowUpRight, label: 'Gastos' },
  { id: 'reports', icon: Activity, label: 'Reportes' },
  { id: 'settings', icon: CreditCard, label: 'Configuración' },
];

const iconMap = {
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'coffee': Coffee,
  'zap': Zap,
  'wallet': Wallet,
  'credit-card': CreditCard,
};

const getTransactionIcon = (iconName) => {
  return iconMap[iconName] || Wallet;
};

const formatCurrency = (amount, currency = 'DOP') => {
  const prefix = currency === 'DOP' ? 'RD$' : '$';
  return `${prefix} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [modalType, setModalType] = useState(null); // 'income', 'expense', 'goal', null

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
        height: '100vh', width: '100vw', background: 'var(--color-bg)', flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid var(--color-input-border)', borderTopColor: 'var(--color-navy)',
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
    if (currentView !== 'dashboard') {
      return (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Activity size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
          <h2 style={{ fontSize: '24px', color: 'var(--color-navy)', marginBottom: '8px' }}>Módulo en Construcción</h2>
          <p>La vista de "{navItems.find(n => n.id === currentView)?.label}" estará disponible en la próxima actualización.</p>
          <button className="btn-primary" style={{ width: 'auto', marginTop: '24px' }} onClick={() => setCurrentView('dashboard')}>
            Volver al Panel
          </button>
        </div>
      );
    }

    return (
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
  };

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
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      <TransactionModal 
        isOpen={modalType === 'income' || modalType === 'expense'} 
        type={modalType} 
        onClose={() => setModalType(null)} 
        onTransactionAdded={loadDashboard}
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
