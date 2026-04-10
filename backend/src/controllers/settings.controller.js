const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT currency, language, theme FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return sendError(res, 404, "Usuario no encontrado");

    return sendSuccess(res, 200, "Configuración obtenida correctamente", {
      preferences: result.rows[0]
    });
  } catch (error) {
    console.error("Error en getSettings:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateSettings = async (req, res) => {
  try {
    const { currency, language, theme } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (typeof currency === "string") { updates.push(`currency = $${idx++}`); values.push(currency); }
    if (typeof language === "string") { updates.push(`language = $${idx++}`); values.push(language); }
    if (typeof theme === "string") { updates.push(`theme = $${idx++}`); values.push(theme); }

    if (updates.length === 0) return sendError(res, 400, "No hay campos para actualizar");

    updates.push("updated_at = NOW()");
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx} RETURNING currency, language, theme`,
      values
    );

    return sendSuccess(res, 200, "Configuración actualizada correctamente", {
      preferences: result.rows[0]
    });
  } catch (error) {
    console.error("Error en updateSettings:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = { getSettings, updateSettings };