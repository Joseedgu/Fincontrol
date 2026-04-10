const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
const { sendError } = require("../utils/response");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "No autorizado. Token no proporcionado");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT id, name, first_name, last_name, email, avatar_url, is_active, role, currency, language, theme, last_login_at, created_at, updated_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 401, "Token inválido. Usuario no encontrado");
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error("Error en authMiddleware:", error.message);
    return sendError(res, 401, "No autorizado. Token inválido o expirado");
  }
};

module.exports = authMiddleware;