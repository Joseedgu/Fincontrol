const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const getTransactions = async (req, res) => {
  try {
    const { type, category, month, year, limit = 10, page = 1, sort = "-transaction_date" } = req.query;
    const numericLimit = Number(limit);
    const numericPage = Number(page);
    const offset = (numericPage - 1) * numericLimit;

    let whereClause = "WHERE user_id = $1";
    const params = [req.user.id];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (category) {
      whereClause += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 1);
      whereClause += ` AND transaction_date >= $${paramIndex++} AND transaction_date < $${paramIndex++}`;
      params.push(startDate, endDate);
    }

    const sortColumn = sort.startsWith("-") ? sort.slice(1) : sort;
    const sortDir = sort.startsWith("-") ? "DESC" : "ASC";
    const orderClause = `ORDER BY ${sortColumn} ${sortDir}`;

    const [itemsResult, countResult] = await Promise.all([
      pool.query(`SELECT * FROM transactions ${whereClause} ${orderClause} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, [...params, numericLimit, offset]),
      pool.query(`SELECT COUNT(*) FROM transactions ${whereClause}`, params)
    ]);

    return sendSuccess(res, 200, "Transacciones obtenidas correctamente", {
      items: itemsResult.rows.map(t => ({
        id: t.id, title: t.title, description: t.description, category: t.category,
        type: t.type, amount: Number(t.amount), transactionDate: t.transaction_date,
        merchant: t.merchant, icon: t.icon, color: t.color, createdAt: t.created_at
      })),
      pagination: { page: numericPage, limit: numericLimit, total: Number(countResult.rows[0].count) }
    });
  } catch (error) {
    console.error("Error en getTransactions:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getTransactionById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (result.rows.length === 0) return sendError(res, 404, "Transacción no encontrada");

    const t = result.rows[0];
    return sendSuccess(res, 200, "Transacción obtenida correctamente", {
      transaction: { id: t.id, title: t.title, description: t.description, category: t.category, type: t.type, amount: Number(t.amount), transactionDate: t.transaction_date, merchant: t.merchant, icon: t.icon, color: t.color }
    });
  } catch (error) {
    console.error("Error en getTransactionById:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const createTransaction = async (req, res) => {
  try {
    const { title, description, category, type, amount, transactionDate, merchant, icon, color } = req.body;

    if (!title || !category || !type || amount === undefined) {
      return sendError(res, 400, "Título, categoría, tipo y monto son obligatorios");
    }

    const result = await pool.query(
      `INSERT INTO transactions (user_id, title, description, category, type, amount, transaction_date, merchant, icon, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, title, description || "", category, type, amount, transactionDate || new Date(), merchant || "", icon || "wallet", color || "default"]
    );

    const t = result.rows[0];
    return sendSuccess(res, 201, "Transacción creada correctamente", {
      transaction: { id: t.id, title: t.title, description: t.description, category: t.category, type: t.type, amount: Number(t.amount), transactionDate: t.transaction_date, merchant: t.merchant, icon: t.icon, color: t.color }
    });
  } catch (error) {
    console.error("Error en createTransaction:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateTransaction = async (req, res) => {
  try {
    const existing = await pool.query("SELECT * FROM transactions WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    if (existing.rows.length === 0) return sendError(res, 404, "Transacción no encontrada");

    const fields = ["title", "description", "category", "type", "amount", "transaction_date", "merchant", "icon", "color"];
    const updates = [];
    const values = [];
    let idx = 1;

    // Map camelCase from body to snake_case in DB
    const bodyMap = { transactionDate: "transaction_date" };
    for (const field of fields) {
      const bodyKey = Object.keys(bodyMap).find(k => bodyMap[k] === field) || field;
      if (req.body[bodyKey] !== undefined) {
        updates.push(`${field} = $${idx++}`);
        values.push(req.body[bodyKey]);
      }
    }

    if (updates.length === 0) return sendError(res, 400, "No hay campos para actualizar");

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id, req.user.id);

    const result = await pool.query(
      `UPDATE transactions SET ${updates.join(", ")} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );

    const t = result.rows[0];
    return sendSuccess(res, 200, "Transacción actualizada correctamente", {
      transaction: { id: t.id, title: t.title, category: t.category, type: t.type, amount: Number(t.amount), transactionDate: t.transaction_date }
    });
  } catch (error) {
    console.error("Error en updateTransaction:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id", [req.params.id, req.user.id]);
    if (result.rows.length === 0) return sendError(res, 404, "Transacción no encontrada");
    return sendSuccess(res, 200, "Transacción eliminada correctamente");
  } catch (error) {
    console.error("Error en deleteTransaction:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction };