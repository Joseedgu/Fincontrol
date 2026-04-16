import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, DollarSign, Tag, AlignLeft, Calendar } from 'lucide-react';
import { transactionsAPI } from '../services/api';

const TransactionModal = ({ isOpen, onClose, type, onTransactionAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const defaultForm = {
    title: '',
    amount: '',
    category: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  };

  const [form, setForm] = useState(defaultForm);

  if (!isOpen) return null;

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const resetAndClose = () => {
    setForm(defaultForm);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.title || !form.amount || !form.category || !form.transactionDate) {
      setError('Por favor completa los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await transactionsAPI.create({
        title: form.title,
        description: form.description,
        category: form.category,
        type: type,
        amount: Number(form.amount),
        transactionDate: form.transactionDate,
      });
      onTransactionAdded();
      setForm(defaultForm);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const isIncome = type === 'income';

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
          
          <h2 className="modal-title">
            {isIncome ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
          </h2>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px', marginBottom: '16px', color: '#DC2626', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input
                type="text"
                placeholder={isIncome ? 'Ej. Quincena, Venta...' : 'Ej. Supermercado, Gasolina...'}
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                className="form-input no-icon"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Monto (RD$) *</label>
                <div className="input-wrapper">
                  <DollarSign className="input-icon" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => update('amount', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Fecha *</label>
                <div className="input-wrapper">
                  <Calendar className="input-icon" />
                  <input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) => update('transactionDate', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <div className="input-wrapper">
                <Tag className="input-icon" />
                <select 
                  value={form.category} 
                  onChange={(e) => update('category', e.target.value)}
                  className="form-input"
                  style={{ appearance: 'none' }}
                  required
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {isIncome ? (
                    <>
                      <option value="Salario">Salario</option>
                      <option value="Negocios">Negocios</option>
                      <option value="Inversiones">Inversiones</option>
                      <option value="Otros Ingresos">Otros Ingresos</option>
                    </>
                  ) : (
                    <>
                      <option value="Alimentación">Alimentación</option>
                      <option value="Transporte">Transporte</option>
                      <option value="Vivienda">Vivienda</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Salud">Salud</option>
                      <option value="Ocio">Ocio</option>
                      <option value="Otros Gastos">Otros Gastos</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción (Opcional)</label>
              <div className="input-wrapper">
                <AlignLeft className="input-icon" />
                <input
                  type="text"
                  placeholder="Detalles adicionales..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ marginTop: '24px', backgroundColor: isIncome ? 'var(--color-emerald)' : 'var(--color-danger)' }}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
              ) : (
                isIncome ? 'Guardar Ingreso' : 'Guardar Gasto'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionModal;
