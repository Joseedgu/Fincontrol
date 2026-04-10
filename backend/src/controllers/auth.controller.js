const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");
const { mapUser } = require("../utils/user.mapper");
const { generateToken, generatePasswordResetToken } = require("../utils/auth");

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
};

const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return sendError(res, 400, "Todos los campos son obligatorios");
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, "Las contraseñas no coinciden");
    }

    if (password.length < 6) {
      return sendError(res, 400, "La contraseña debe tener al menos 6 caracteres");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return sendError(res, 409, "Ya existe un usuario con ese correo");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { firstName, lastName } = splitName(name);

    const result = await pool.query(
      `INSERT INTO users (name, first_name, last_name, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, first_name, last_name, email, avatar_url, is_active, role, currency, language, theme, last_login_at, created_at, updated_at`,
      [name.trim(), firstName, lastName, normalizedEmail, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return sendSuccess(res, 201, "Usuario registrado correctamente", {
      user: mapUser(user),
      token
    });
  } catch (error) {
    console.error("Error en register:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Correo y contraseña son obligatorios");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);

    if (result.rows.length === 0) {
      return sendError(res, 401, "Credenciales inválidas");
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 401, "Credenciales inválidas");
    }

    await pool.query("UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1", [user.id]);

    const token = generateToken(user);

    return sendSuccess(res, 200, "Inicio de sesión exitoso", {
      user: mapUser(user),
      token
    });
  } catch (error) {
    console.error("Error en login:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const me = async (req, res) => {
  try {
    return sendSuccess(res, 200, "Usuario autenticado", {
      user: mapUser(req.user)
    });
  } catch (error) {
    console.error("Error en me:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "El correo es obligatorio");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);

    if (result.rows.length === 0) {
      return sendSuccess(res, 200, "Si el correo existe, se enviarán instrucciones de recuperación");
    }

    const resetToken = generatePasswordResetToken();
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30);

    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2, updated_at = NOW() WHERE id = $3",
      [hashedToken, expires, result.rows[0].id]
    );

    return sendSuccess(res, 200, "Si el correo existe, se enviarán instrucciones de recuperación", { resetToken });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return sendError(res, 400, "Todos los campos son obligatorios");
    }
    if (password !== confirmPassword) {
      return sendError(res, 400, "Las contraseñas no coinciden");
    }
    if (password.length < 6) {
      return sendError(res, 400, "La contraseña debe tener al menos 6 caracteres");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      "SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return sendError(res, 400, "Token inválido o expirado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = NOW() WHERE id = $2",
      [hashedPassword, result.rows[0].id]
    );

    return sendSuccess(res, 200, "Contraseña restablecida correctamente");
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 400, "Todos los campos son obligatorios");
    }
    if (newPassword !== confirmPassword) {
      return sendError(res, 400, "Las contraseñas no coinciden");
    }
    if (newPassword.length < 6) {
      return sendError(res, 400, "La nueva contraseña debe tener al menos 6 caracteres");
    }

    const result = await pool.query("SELECT id, password FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return sendError(res, 404, "Usuario no encontrado");
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) {
      return sendError(res, 401, "La contraseña actual no es válida");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", [hashedPassword, req.user.id]);

    return sendSuccess(res, 200, "Contraseña actualizada correctamente");
  } catch (error) {
    console.error("Error en changePassword:", error);
    return sendError(res, 500, "Error interno del servidor");
  }
};

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  changePassword
};