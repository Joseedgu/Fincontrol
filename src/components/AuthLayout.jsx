import { motion } from 'framer-motion';
import '../Auth.css';

const AuthLayout = ({ leftContent, rightContent }) => {
  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="app-window app-window-auth"
      >
        <div className="auth-left">
          {leftContent}
        </div>

        <div className="auth-right">
          {rightContent}
          
          <div className="auth-footer-text">
            © 2026 FinControl Servicios Institucionales.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
