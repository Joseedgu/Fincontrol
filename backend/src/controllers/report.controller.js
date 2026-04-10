const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const getMonthRange = (month, year) => {
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);
  return { start, end };
};

const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());
    const { start, end } = getMonthRange(month, year);

    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date < $3",
      [req.user.id, start, end]
    );

    const transactions = result.rows;
    const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);

    return sendSuccess(res, 200, "Reporte general obtenido correctamente", {
      month, year, totalIncome, totalExpenses, balance: totalIncome - totalExpenses
    });
  } catch (error) {
    console.error("Error en getOverview:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getIncomeVsExpenses = async (req, res) => {
  try {
    const year = Number(req.query.year || new Date().getFullYear());
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date < $3",
      [req.user.id, start, end]
    );

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expenses: 0 }));

    result.rows.forEach(t => {
      const monthIndex = new Date(t.transaction_date).getMonth();
      if (t.type === "income") monthlyData[monthIndex].income += Number(t.amount);
      else monthlyData[monthIndex].expenses += Number(t.amount);
    });

    return sendSuccess(res, 200, "Reporte de ingresos vs gastos obtenido correctamente", { year, items: monthlyData });
  } catch (error) {
    console.error("Error en getIncomeVsExpenses:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const getByCategory = async (req, res) => {
  try {
    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());
    const { start, end } = getMonthRange(month, year);

    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date < $3",
      [req.user.id, start, end]
    );

    const categoryMap = {};
    result.rows.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    });

    const items = Object.entries(categoryMap).map(([category, amount]) => ({ category, amount }));

    return sendSuccess(res, 200, "Reporte por categoría obtenido correctamente", { month, year, items });
  } catch (error) {
    console.error("Error en getByCategory:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = { getOverview, getIncomeVsExpenses, getByCategory };