const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const getDebts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM debts WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
    
    const items = result.rows.map(d => ({
      id: d.id,
      personName: d.person_name,
      amount: Number(d.amount),
      paidAmount: Number(d.paid_amount),
      type: d.type,
      description: d.description,
      dueDate: d.due_date,
      progressPercent: Number(d.amount) > 0 ? Math.min(100, Math.round((Number(d.paid_amount) / Number(d.amount)) * 100)) : 0,
      createdAt: d.created_at,
    }));

    const iOwe = items.filter(d => d.type === 'i_owe');
    const theyOwe = items.filter(d => d.type === 'they_owe');
    const totalIOwe = iOwe.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
    const totalTheyOwe = theyOwe.reduce((s, d) => s + (d.amount - d.paidAmount), 0);

    return sendSuccess(res, 200, "Deudas obtenidas correctamente", { iOwe, theyOwe, totalIOwe, totalTheyOwe });
  } catch (error) {
    console.error("Error en getDebts:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const createDebt = async (req, res) => {
  try {
    const { personName, amount, type, description, dueDate } = req.body;
    if (!personName || !amount || !type) return sendError(res, 400, "Nombre, monto y tipo son obligatorios");
    if (!['i_owe', 'they_owe'].includes(type)) return sendError(res, 400, "Tipo debe ser 'i_owe' o 'they_owe'");

    const result = await pool.query(
      `INSERT INTO debts (user_id, person_name, amount, type, description, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, personName, amount, type, description || "", dueDate || null]
    );

    const d = result.rows[0];
    return sendSuccess(res, 201, "Deuda creada correctamente", {
      debt: { id: d.id, personName: d.person_name, amount: Number(d.amount), paidAmount: 0, type: d.type, description: d.description, progressPercent: 0 }
    });
  } catch (error) {
    console.error("Error en createDebt:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const payDebt = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return sendError(res, 400, "El monto debe ser mayor a 0");

    const existing = await pool.query("SELECT * FROM debts WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (existing.rows.length === 0) return sendError(res, 404, "Deuda no encontrada");

    const debt = existing.rows[0];
    const newPaid = Math.min(Number(debt.amount), Number(debt.paid_amount) + Number(amount));

    const result = await pool.query(
      `UPDATE debts SET paid_amount = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *`,
      [newPaid, req.params.id, req.user.id]
    );

    const d = result.rows[0];
    return sendSuccess(res, 200, "Pago registrado correctamente", {
      debt: {
        id: d.id, personName: d.person_name, amount: Number(d.amount), paidAmount: Number(d.paid_amount), type: d.type,
        progressPercent: Number(d.amount) > 0 ? Math.min(100, Math.round((Number(d.paid_amount) / Number(d.amount)) * 100)) : 0,
      }
    });
  } catch (error) {
    console.error("Error en payDebt:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const deleteDebt = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING id", [req.params.id, req.user.id]);
    if (result.rows.length === 0) return sendError(res, 404, "Deuda no encontrada");
    return sendSuccess(res, 200, "Deuda eliminada correctamente");
  } catch (error) {
    console.error("Error en deleteDebt:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = { getDebts, createDebt, payDebt, deleteDebt };
