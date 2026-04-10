const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");
const { mapUser } = require("../utils/user.mapper");

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, first_name, last_name, email, avatar_url, is_active, role, currency, language, theme, last_login_at, created_at, updated_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return sendError(res, 404, "Usuario no encontrado");

    return sendSuccess(res, 200, "Perfil obtenido correctamente", {
      user: mapUser(result.rows[0])
    });
  } catch (error) {
    console.error("Error en getProfile:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, avatarUrl } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (typeof firstName === "string") { updates.push(`first_name = $${idx++}`); values.push(firstName.trim()); }
    if (typeof lastName === "string") { updates.push(`last_name = $${idx++}`); values.push(lastName.trim()); }
    if (typeof avatarUrl === "string") { updates.push(`avatar_url = $${idx++}`); values.push(avatarUrl.trim() || null); }

    if (firstName || lastName) {
      const fn = firstName || req.user.first_name || "";
      const ln = lastName || req.user.last_name || "";
      const fullName = `${fn} ${ln}`.trim();
      if (fullName) { updates.push(`name = $${idx++}`); values.push(fullName); }
    }

    if (updates.length === 0) return sendError(res, 400, "No hay campos para actualizar");
    updates.push("updated_at = NOW()");
    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx} RETURNING id, name, first_name, last_name, email, avatar_url, is_active, role, currency, language, theme, last_login_at, created_at, updated_at`,
      values
    );

    return sendSuccess(res, 200, "Perfil actualizado correctamente", {
      user: mapUser(result.rows[0])
    });
  } catch (error) {
    console.error("Error en updateProfile:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = { getProfile, updateProfile };