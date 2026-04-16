require("dotenv").config();
const { pool, connectDB } = require("./db");

const createTables = async () => {
  const queries = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      role VARCHAR(50) DEFAULT 'user',
      currency VARCHAR(10) DEFAULT 'DOP',
      language VARCHAR(10) DEFAULT 'es',
      theme VARCHAR(20) DEFAULT 'light',
      last_login_at TIMESTAMP,
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      category VARCHAR(255) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
      amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
      transaction_date TIMESTAMP DEFAULT NOW(),
      merchant VARCHAR(255) DEFAULT '',
      icon VARCHAR(50) DEFAULT 'wallet',
      color VARCHAR(50) DEFAULT 'default',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS goals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      target_amount DECIMAL(12,2) NOT NULL CHECK (target_amount >= 0),
      current_amount DECIMAL(12,2) DEFAULT 0 CHECK (current_amount >= 0),
      deadline DATE,
      color VARCHAR(50) DEFAULT 'blue',
      is_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
      year INTEGER NOT NULL,
      monthly_income_target DECIMAL(12,2) DEFAULT 0,
      monthly_expense_limit DECIMAL(12,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, month, year)
    );

    CREATE TABLE IF NOT EXISTS debts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      person_name VARCHAR(255) NOT NULL,
      amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
      paid_amount DECIMAL(12,2) DEFAULT 0 CHECK (paid_amount >= 0),
      type VARCHAR(20) NOT NULL CHECK (type IN ('i_owe', 'they_owe')),
      description TEXT DEFAULT '',
      due_date DATE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;

  try {
    await connectDB();
    await pool.query(queries);
    console.log("Tablas creadas correctamente en Supabase");
    process.exit(0);
  } catch (error) {
    console.error("Error creando tablas:", error.message);
    process.exit(1);
  }
};

createTables();
