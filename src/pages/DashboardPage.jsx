import { useState } from 'react';
import { Search, Bell, HelpCircle, LogOut, LayoutGrid, ArrowDownRight, ArrowUpRight, TrendingUp, ChevronRight, Plus, Activity, CreditCard, Coffee, Zap, ShoppingBag, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import '../Dashboard.css';

const navItems = [
  { icon: LayoutGrid, label: 'Panel', active: true },
  { icon: ArrowDownRight, label: 'Ingresos' },
  { icon: ArrowUpRight, label: 'Gastos' },
  { icon: Activity, label: 'Reportes' },
  { icon: LogOut, label: 'Configuración' },
];

const transactions = [
  { icon: ShoppingBag, title: 'Apple Store - MacBook Pro', category: 'Tienda', date: '24 Oct, 2026', amount: '-RD$ 2,499.00', type: 'expense' },
  { icon: ShoppingBag, title: 'Landing page', category: 'Freelance', date: '24 Oct, 2026', amount: '+RD$ 8,500.00', type: 'income' },
  { icon: Utensils, title: 'Mañon', category: 'Restaurante', date: '23 Oct, 2026', amount: '-RD$ 156.40', type: 'expense' },
  { icon: Zap, title: 'Edeeste', category: 'Servicios Públicos', date: '22 Oct, 2026', amount: '-RD$ 84.20', type: 'expense' },
];

const goals = [
  { title: 'Viaje a Japon', current: 0, target: 115000, progress: 80, color: 'navy' },
  { title: 'Pago Inicial Casa', current: 0, target: 120000, progress: 45, color: 'navy' },
  { title: 'Fondo de Emergencia', current: 0, target: 30000, progress: 100, color: 'emerald' },
];

const DashboardPage = () => {
  return (
    <div className="dashboard-layout app-window">
      {/* ───── Left Sidebar ───── */}
      <aside className="sidebar">
        <div>
          {/* Logo */}
          <div className="logo-container">
            <Logo variant="dark" />
          </div>

          {/* Navigation */}
          <nav>
            {navItems.map(({ icon: Icon, label, active }, idx) => (
              <button key={idx} className={`nav-item ${active ? 'active' : ''}`}>
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout button at bottom */}
        <button className="logout-btn">
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </aside>

      {/* ───── Main Content Area ───── */}
      <main className="main-content">
        {/* Top Header */}
        <header className="header">
          {/* Search Bar */}
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar transacciones, reportes..." 
              className="search-input"
            />
          </div>

          {/* Header Right */}
          <div className="header-actions">
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="icon-btn">
                <Bell size={24} />
                <div className="badge"></div>
              </button>
              <button className="icon-btn">
                <HelpCircle size={24} />
              </button>
            </div>
            
            <div className="divider"></div>
            
            <div className="user-profile">
              <img src="https://i.pravatar.cc/150?img=11" alt="User Avatar" />
              <span>Jose</span>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="welcome-section">
            <h1 className="welcome-title">¡Bienvenido de nuevo, Jose!</h1>
            <p className="welcome-subtitle">
              Tu salud financiera se ve sólida este mes. Has alcanzado el <strong>85%</strong> de tu meta de ahorro.
            </p>
          </motion.div>

          {/* Stat Cards */}
          <div className="stats-grid">
            {/* Saldo Total */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card dark">
              <div>
                <h3 className="stat-label-dark">Saldo Total</h3>
                <div className="stat-value-dark">RD$ 124,592.00</div>
              </div>
              <div className="stat-trend-dark">
                <TrendingUp size={16} />
                +4.2% desde el mes pasado
              </div>
            </motion.div>

            {/* Ingresos Mensuales */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon green">
                  <ArrowDownRight size={24} strokeWidth={2.5} />
                </div>
                <div className="stat-badge green">Depositado</div>
              </div>
              <div>
                <h3 className="stat-label">Ingresos Mensuales</h3>
                <div className="stat-value">RD$ 12,450.00</div>
                <div className="progress-track">
                  <div className="progress-fill green" style={{ width: '75%' }}></div>
                </div>
                <div className="stat-desc">75% de los ingresos mensuales proyectados</div>
              </div>
            </motion.div>

            {/* Gastos Mensuales */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon red">
                  <ArrowUpRight size={24} strokeWidth={2.5} />
                </div>
                <div className="stat-badge red">Retirado</div>
              </div>
              <div>
                <h3 className="stat-label">Gastos Mensuales</h3>
                <div className="stat-value">RD$ 4,120.50</div>
                <div className="progress-track">
                  <div className="progress-fill red" style={{ width: '35%' }}></div>
                </div>
                <div className="stat-desc">Por debajo del presupuesto por RD$ 800.00</div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="bottom-grid">
            {/* Recent Transactions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="panel-card">
              <div className="panel-header">
                <h2 className="panel-title">Transacciones Recientes</h2>
                <button className="panel-action">Ver todo</button>
              </div>
              
              <div className="tx-list">
                {transactions.map((tx, idx) => {
                  const Icon = tx.icon;
                  return (
                  <div key={idx} className="tx-item">
                    <div className="tx-info">
                      <div className="tx-icon">
                        <Icon size={24} strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="tx-title">{tx.title}</h4>
                        <p className="tx-desc">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <span className={`tx-amount ${tx.type === 'income' ? 'income' : ''}`}>
                      {tx.amount}
                    </span>
                  </div>
                )})}
              </div>
            </motion.div>

            {/* Future Goals */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="panel-card gray" style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 className="panel-title" style={{ marginBottom: '32px' }}>Metas Futuras</h2>
              
              <div className="goals-list">
                {goals.map((goal, idx) => (
                  <div key={idx}>
                    <div className="goal-header">
                      <h4 className="goal-title">{goal.title}</h4>
                      <span className="goal-percent">{goal.progress}%</span>
                    </div>
                    <div className="goal-track">
                      <div 
                        className={`goal-fill ${goal.color}`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="goal-meta">
                      Meta: RD$ {goal.target.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>

              <button className="btn-secondary">
                Crear Nueva Meta
              </button>
            </motion.div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default DashboardPage;
