const { sendSuccess, sendError } = require("../utils/response");
const { buildDashboardData } = require("../services/dashboard.service");

const getDashboard = async (req, res) => {
  try {
    const data = await buildDashboardData(req.user);

    return sendSuccess(res, 200, "Datos del dashboard obtenidos correctamente", data);
  } catch (error) {
    console.error("Error en dashboard:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  getDashboard
};