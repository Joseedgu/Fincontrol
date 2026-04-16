const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const formatGoal = (goal) => {
  const targetAmount = Number(goal.target_amount);
  const currentAmount = Number(goal.current_amount);
  return {
    ...goal,
    targetAmount,
    currentAmount,
    progressPercent: targetAmount > 0 ? Math.min(100, Number(((currentAmount / targetAmount) * 100).toFixed(0))) : 0,
    isCompleted: goal.is_completed,
  };
};

const getGoals = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC", [req.user.id]);
    return sendSuccess(res, 200, "Metas obtenidas correctamente", { items: result.rows.map(formatGoal) });
  } catch (error) {
    console.error("Error en getGoals:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getGoalById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM goals WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (result.rows.length === 0) return sendError(res, 404, "Meta no encontrada");
    return sendSuccess(res, 200, "Meta obtenida correctamente", { goal: formatGoal(result.rows[0]) });
  } catch (error) {
    console.error("Error en getGoalById:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline, color, isCompleted } = req.body;
    if (!title || targetAmount === undefined) return sendError(res, 400, "El título y el monto objetivo son obligatorios");

    const result = await pool.query(
      `INSERT INTO goals (user_id, title, target_amount, current_amount, deadline, color, is_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, title, targetAmount, currentAmount || 0, deadline || null, color || "blue", Boolean(isCompleted)]
    );

    return sendSuccess(res, 201, "Meta creada correctamente", { goal: formatGoal(result.rows[0]) });
  } catch (error) {
    console.error("Error en createGoal:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

// NEW: Add funds to a goal
const addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return sendError(res, 400, "El monto debe ser mayor a 0");

    const existing = await pool.query("SELECT * FROM goals WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (existing.rows.length === 0) return sendError(res, 404, "Meta no encontrada");

    const goal = existing.rows[0];
    const newAmount = Number(goal.current_amount) + Number(amount);
    const isNowCompleted = newAmount >= Number(goal.target_amount);

    const result = await pool.query(
      `UPDATE goals SET current_amount = $1, is_completed = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *`,
      [newAmount, isNowCompleted, req.params.id, req.user.id]
    );

    return sendSuccess(res, 200, "Fondos agregados correctamente", { goal: formatGoal(result.rows[0]) });
  } catch (error) {
    console.error("Error en addFunds:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateGoal = async (req, res) => {
  try {
    const existing = await pool.query("SELECT * FROM goals WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (existing.rows.length === 0) return sendError(res, 404, "Meta no encontrada");

    const fieldMap = { title: "title", targetAmount: "target_amount", currentAmount: "current_amount", deadline: "deadline", color: "color", isCompleted: "is_completed" };
    const updates = [];
    const values = [];
    let idx = 1;

    for (const [bodyKey, dbCol] of Object.entries(fieldMap)) {
      if (req.body[bodyKey] !== undefined) {
        updates.push(`${dbCol} = $${idx++}`);
        values.push(req.body[bodyKey]);
      }
    }

    if (updates.length === 0) return sendError(res, 400, "No hay campos para actualizar");
    updates.push("updated_at = NOW()");
    values.push(req.params.id, req.user.id);

    const result = await pool.query(
      `UPDATE goals SET ${updates.join(", ")} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );

    return sendSuccess(res, 200, "Meta actualizada correctamente", { goal: formatGoal(result.rows[0]) });
  } catch (error) {
    console.error("Error en updateGoal:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const deleteGoal = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM goals WHERE id = $1 AND user_id = $2 RETURNING id", [req.params.id, req.user.id]);
    if (result.rows.length === 0) return sendError(res, 404, "Meta no encontrada");
    return sendSuccess(res, 200, "Meta eliminada correctamente");
  } catch (error) {
    console.error("Error en deleteGoal:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = { getGoals, getGoalById, createGoal, updateGoal, deleteGoal, addFunds };