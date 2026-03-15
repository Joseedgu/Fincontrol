import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, BrainCircuit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/Logo';
import '../Auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', terms: false });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const leftContent = (
    <>
      <div>
        <Logo variant="light" size="sm" />
        <h1 className="auth-title">
          Domina tu<br/><span className="auth-title-highlight">legado<br/>financiero.</span>
        </h1>
        <p className="auth-subtitle">
          Únete a la plataforma de élite diseñada para una gestión precisa del patrimonio e inteligencia fiscal en tiempo real.
        </p>
      </div>

      <div style={{ marginTop: '48px' }}>
        <div className="auth-feature">
          <div className="auth-feature-icon">
            <ShieldCheck />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>Seguridad de Grado Bancario</h3>
            <p style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>Cifrado de 256 bits para todos tus datos.</p>
          </div>
        </div>
        <div className="auth-feature">
          <div className="auth-feature-icon">
            <BrainCircuit />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>Análisis Predictivo</h3>
            <p style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>Información impulsada por IA sobre tus hábitos de gasto.</p>
          </div>
        </div>
      </div>
    </>
  );

  const rightContent = (
    <div className="auth-form-container" style={{ maxWidth: '460px' }}>
      <h2 className="auth-form-title">Crear Cuenta</h2>
      <p className="auth-form-subtitle">
        Por favor, ingresa tus datos para comenzar.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre Completo</label>
          <input
            type="text"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="form-input no-icon"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <input
            type="email"
            placeholder="nombre@empresa.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="form-input no-icon"
          />
        </div>

        <div className="flex" style={{ gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                className="form-input"
                style={{ fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="input-action"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <label className="auth-checkbox-label" style={{ margin: '12px 0 24px 0' }}>
          <input
            type="checkbox"
            checked={form.terms}
            onChange={(e) => update('terms', e.target.checked)}
            className="auth-checkbox"
          />
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
            Acepto los <button type="button" onClick={() => setShowModal(true)} className="auth-link" style={{background:'none', border:'none', padding:0, font:'inherit', cursor:'pointer'}}>Términos de Servicio</button> y la <button type="button" onClick={() => setShowModal(true)} className="auth-link" style={{background:'none', border:'none', padding:0, font:'inherit', cursor:'pointer'}}>Política de Privacidad</button>.
          </span>
        </label>

        <button type="submit" className="btn-primary">
          Crear Cuenta
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
            ¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Iniciar sesión</Link>
          </p>
        </div>
      </form>
    </div>
  );

  const modalOverlay = (
    <AnimatePresence>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '90%', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={24} />
            </button>
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-input-bg)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--color-navy)' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-navy)', marginBottom: '12px', letterSpacing: '-0.02em' }}>Sección en Desarrollo</h3>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
              Nuestros Términos de Servicio y Políticas de Privacidad están siendo cuidadosamente redactados. Muy pronto estarán disponibles en esta sección.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="btn-primary"
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <AuthLayout leftContent={leftContent} rightContent={rightContent} />
      {modalOverlay}
    </>
  );
};

export default RegisterPage;
