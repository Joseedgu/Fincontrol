const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d"
    }
  );
};

const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  generateToken,
  generatePasswordResetToken
};