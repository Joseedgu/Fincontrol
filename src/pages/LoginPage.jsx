import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/Logo';
import '../Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, remember);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const leftContent = (
    <>
      <div>
        <Logo variant="light" size="sm" />
        <h1 className="auth-title">
          Controla tu dinero<br/>con claridad.
        </h1>
        <p className="auth-subtitle">
          FinControl te ofrece una vista clara de tu situación financiera para tomar mejores decisiones cada día.
        </p>
      </div>

      <div className="auth-social-proof">
        <div className="flex items-center" style={{ gap: '12px', marginBottom: '12px' }}>
          <div className="auth-avatars">
            <img src="https://i.pravatar.cc/150?img=1" alt="Avatar" />
            <img src="https://i.pravatar.cc/150?img=2" alt="Avatar" />
            <img src="https://i.pravatar.cc/150?img=3" alt="Avatar" />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
            Confiado por más de 12,000 analistas
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', lineHeight: '1.6' }}>
          "El sistema de Fincontrol cambió la forma en que visualizamos nuestra liquidez trimestral."
        </p>
      </div>
    </>
  );

  const rightContent = (
    <div className="auth-form-container">
      <h2 className="auth-form-title">Bienvenido de Nuevo</h2>
      <p className="auth-form-subtitle">
        Ingresa tus credenciales para acceder a tu libro contable.
      </p>

      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#DC2626',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <div className="input-wrapper">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Contraseña</label>
            <Link to="#" className="auth-link" style={{ fontSize: '12px' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'monospace' }}
              required
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

        <label className="auth-checkbox-label">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="auth-checkbox"
          />
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
            Recordar este dispositivo
          </span>
        </label>

        <button type="submit" className="btn-primary" style={{ marginTop: '16px', gap: '8px' }} disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Ingresando...
            </>
          ) : (
            <>
              Iniciar sesión <ArrowRight size={18} />
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="auth-link">Regístrate</Link>
          </p>
          <div className="flex items-center justify-center" style={{ gap: '6px', marginTop: '16px', opacity: 0.5 }}>
            <ShieldCheck size={14} />
            <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Seguridad cifrada AES-256
            </span>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return <AuthLayout leftContent={leftContent} rightContent={rightContent} />;
};

export default LoginPage;
