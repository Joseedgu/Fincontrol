import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Target, Calendar, DollarSign } from 'lucide-react';
import { goalsAPI } from '../services/api';

const GoalModal = ({ isOpen, onClose, onGoalAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
  });

  if (!isOpen) return null;

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const resetAndClose = () => {
    setForm({ title: '', targetAmount: '', deadline: '' });
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.title || !form.targetAmount) {
      setError('El título y el monto objetivo son obligatorios');
      return;
    }

    setLoading(true);
    try {
      await goalsAPI.create({
        title: form.title,
        targetAmount: Number(form.targetAmount),
        deadline: form.deadline || null,
      });
      onGoalAdded();
      setForm({ title: '', targetAmount: '', deadline: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={resetAndClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={resetAndClose} className="modal-close"><X size={24} /></button>
          
          <h2 className="modal-title">Crear Nueva Meta</h2>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre de la Meta *</label>
              <div className="input-wrapper">
                <Target className="input-icon" />
                <input
                  type="text"
                  placeholder="Ej. Fondo de Emergencia, Viaje..."
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Monto Objetivo (RD$) *</label>
              <div className="input-wrapper">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.targetAmount}
                  onChange={(e) => update('targetAmount', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>
              
            <div className="form-group">
              <label className="form-label">Fecha Límite (Opcional)</label>
              <div className="input-wrapper">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => update('deadline', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '24px' }} disabled={loading}>
              {loading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creando...</>
              ) : (
                'Crear Meta'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalModal;
