require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Goal = require("../models/goal");
const Budget = require("../models/budget");

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Goal.deleteMany({}),
      Budget.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = await User.create({
      name: "Jose Pérez",
      firstName: "Jose",
      lastName: "Pérez",
      email: "jose@fincontrol.com",
      password: hashedPassword,
      preferences: {
        currency: "DOP",
        language: "es",
        theme: "light"
      }
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    await Budget.create({
      user: user._id,
      month,
      year,
      monthlyIncomeTarget: 16600,
      monthlyExpenseLimit: 4920.5
    });

    await Transaction.insertMany([
      {
        user: user._id,
        title: "Landing page",
        category: "Freelance",
        type: "income",
        amount: 8500,
        transactionDate: new Date(year, now.getMonth(), 24),
        icon: "briefcase"
      },
      {
        user: user._id,
        title: "Apple Store - MacBook Pro",
        category: "Tienda",
        type: "expense",
        amount: 2499,
        transactionDate: new Date(year, now.getMonth(), 24),
        icon: "shopping-bag"
      },
      {
        user: user._id,
        title: "Mañon",
        category: "Restaurante",
        type: "expense",
        amount: 156.4,
        transactionDate: new Date(year, now.getMonth(), 23),
        icon: "utensils"
      },
      {
        user: user._id,
        title: "Edeeste",
        category: "Servicios Públicos",
        type: "expense",
        amount: 84.2,
        transactionDate: new Date(year, now.getMonth(), 22),
        icon: "zap"
      },
      {
        user: user._id,
        title: "Consultoría UX",
        category: "Servicios",
        type: "income",
        amount: 3950,
        transactionDate: new Date(year, now.getMonth(), 12),
        icon: "chart-line"
      },
      {
        user: user._id,
        title: "Pago por soporte",
        category: "Servicios",
        type: "income",
        amount: 124592,
        transactionDate: new Date(year, now.getMonth(), 2),
        icon: "wallet"
      }
    ]);

    await Goal.insertMany([
      {
        user: user._id,
        title: "Viaje a Japon",
        targetAmount: 115000,
        currentAmount: 92000,
        color: "blue"
      },
      {
        user: user._id,
        title: "Pago Inicial Casa",
        targetAmount: 120000,
        currentAmount: 54000,
        color: "blue"
      },
      {
        user: user._id,
        title: "Fondo de Emergencia",
        targetAmount: 30000,
        currentAmount: 30000,
        color: "green",
        isCompleted: true
      }
    ]);

    console.log("Seed completado correctamente");
    console.log("Usuario de prueba: jose@fincontrol.com / 123456");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando seed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();