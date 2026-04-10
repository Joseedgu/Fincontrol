const { pool } = require("../config/db");

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end, now };
};

const getPreviousMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end };
};

const buildDashboardData = async (user) => {
  const { start, end, now } = getCurrentMonthRange();
  const previousMonth = getPreviousMonthRange();

  const [allTx, currentTx, previousTx, goalsResult, budgetResult] = await Promise.all([
    pool.query("SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC", [user.id]),
    pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date < $3 ORDER BY transaction_date DESC",
      [user.id, start, end]
    ),
    pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 AND transaction_date >= $2 AND transaction_date < $3",
      [user.id, previousMonth.start, previousMonth.end]
    ),
    pool.query("SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC", [user.id]),
    pool.query(
      "SELECT * FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3",
      [user.id, now.getMonth() + 1, now.getFullYear()]
    )
  ]);

  const allTransactions = allTx.rows;
  const currentMonthTransactions = currentTx.rows;
  const previousMonthTransactions = previousTx.rows;
  const goals = goalsResult.rows;
  const budget = budgetResult.rows[0] || null;

  const totalIncome = allTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const previousMonthIncome = previousMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const previousMonthExpenses = previousMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const previousBalance = previousMonthIncome - previousMonthExpenses;
  const changePercent =
    previousBalance > 0
      ? Number((((totalBalance - previousBalance) / previousBalance) * 100).toFixed(1))
      : 0;

  const incomeTarget = budget ? Number(budget.monthly_income_target) : 0;
  const expenseLimit = budget ? Number(budget.monthly_expense_limit) : 0;

  const incomeProgressPercent =
    incomeTarget > 0 ? Math.min(100, Number(((currentMonthIncome / incomeTarget) * 100).toFixed(0))) : 0;

  const expenseUsedPercent =
    expenseLimit > 0 ? Math.min(100, Number(((currentMonthExpenses / expenseLimit) * 100).toFixed(0))) : 0;

  const amountBelowBudget =
    expenseLimit > currentMonthExpenses ? Number((expenseLimit - currentMonthExpenses).toFixed(2)) : 0;

  const recentTransactions = currentMonthTransactions.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    type: t.type,
    amount: Number(t.amount),
    transactionDate: t.transaction_date,
    icon: t.icon,
    merchant: t.merchant
  }));

  const goalItems = goals.slice(0, 3).map((goal) => {
    const targetAmount = Number(goal.target_amount);
    const currentAmount = Number(goal.current_amount);
    const progressPercent =
      targetAmount > 0
        ? Math.min(100, Number(((currentAmount / targetAmount) * 100).toFixed(0)))
        : 0;

    return {
      id: goal.id,
      title: goal.title,
      targetAmount,
      currentAmount,
      progressPercent,
      deadline: goal.deadline,
      color: goal.color,
      isCompleted: goal.is_completed
    };
  });

  const averageGoalProgress =
    goalItems.length > 0
      ? Number((goalItems.reduce((sum, g) => sum + g.progressPercent, 0) / goalItems.length).toFixed(0))
      : 0;

  let subtitle = "Comienza a registrar tus movimientos para obtener un resumen financiero.";
  if (goalItems.length > 0) {
    subtitle = `Tu salud financiera se ve sólida este mes. Has alcanzado el ${averageGoalProgress}% de tu meta de ahorro.`;
  }

  return {
    header: {
      greeting: `¡Bienvenido de nuevo, ${user.first_name || user.name}!`,
      subtitle
    },
    summaryCards: {
      totalBalance: {
        amount: Number(totalBalance.toFixed(2)),
        currency: user.currency || "DOP",
        changePercent,
        changeLabel: "desde el mes pasado"
      },
      monthlyIncome: {
        amount: Number(currentMonthIncome.toFixed(2)),
        currency: user.currency || "DOP",
        progressPercent: incomeProgressPercent,
        label: "de los ingresos mensuales proyectados"
      },
      monthlyExpenses: {
        amount: Number(currentMonthExpenses.toFixed(2)),
        currency: user.currency || "DOP",
        budgetUsedPercent: expenseUsedPercent,
        label:
          expenseLimit > 0
            ? `Por debajo del presupuesto por RD$${amountBelowBudget.toFixed(2)}`
            : "Aún no hay presupuesto configurado"
      }
    },
    recentTransactions,
    goals: goalItems,
    notifications: {
      unreadCount: 1
    }
  };
};

module.exports = {
  buildDashboardData
};