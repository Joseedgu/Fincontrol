const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getOverview,
  getIncomeVsExpenses,
  getByCategory
} = require("../controllers/report.controller");

router.use(authMiddleware);

router.get("/overview", getOverview);
router.get("/income-vs-expenses", getIncomeVsExpenses);
router.get("/by-category", getByCategory);

module.exports = router;