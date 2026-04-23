const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getBudgets, saveBudget, deleteBudget,
  getGoals, addGoal, deleteGoal
} = require("../controllers/planController");

// ---- BUDGETS ----
router.get("/budgets", auth, getBudgets);
router.post("/budgets", auth, saveBudget);
router.delete("/budgets/:category", auth, deleteBudget);

// ---- GOALS ----
router.get("/goals", auth, getGoals);
router.post("/goals", auth, addGoal);
router.delete("/goals/:id", auth, deleteGoal);

module.exports = router;