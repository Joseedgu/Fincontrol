const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
} = require("../controllers/goal.controller");

router.use(authMiddleware);

router.get("/", getGoals);
router.post("/", createGoal);
router.get("/:id", getGoalById);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

module.exports = router;