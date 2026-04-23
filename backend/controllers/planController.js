const User = require("../models/User");

// ============================================================
// BUDGETS
// ============================================================

// GET all budgets for current user
exports.getBudgets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("budgets");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ budgets: user.budgets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SAVE (upsert) a budget for a category
exports.saveBudget = async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid category and amount required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cat = category.trim().toLowerCase();
    const idx = user.budgets.findIndex(b => b.category === cat);
    if (idx > -1) {
      // Update existing
      user.budgets[idx].amount = Number(amount);
    } else {
      // Add new
      user.budgets.push({ category: cat, amount: Number(amount) });
    }

    await user.save();
    res.json({ message: "Budget saved", budgets: user.budgets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a budget by category name
exports.deleteBudget = async (req, res) => {
  try {
    const { category } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.budgets = user.budgets.filter(b => b.category !== category.toLowerCase());
    await user.save();
    res.json({ message: "Budget deleted", budgets: user.budgets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ============================================================
// GOALS
// ============================================================

// GET all goals for current user
exports.getGoals = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("goals");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ goals: user.goals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD a new goal (multiple goals allowed)
exports.addGoal = async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Valid goal name and amount required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.goals.push({ name: name.trim(), amount: Number(amount) });
    await user.save();
    res.json({ message: "Goal added", goals: user.goals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a goal by its _id
exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.goals = user.goals.filter(g => g._id.toString() !== id);
    await user.save();
    res.json({ message: "Goal deleted", goals: user.goals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};