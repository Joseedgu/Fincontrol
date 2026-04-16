const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addFunds
} = require("../controllers/goal.controller");

router.use(authMiddleware);

router.get("/", getGoals);
router.post("/", createGoal);
router.get("/:id", getGoalById);
router.patch("/:id", updateGoal);
router.patch("/:id/fund", addFunds);
router.delete("/:id", deleteGoal);

module.exports = router;