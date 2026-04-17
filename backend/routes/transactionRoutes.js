const auth = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// ==============================
// ➕ ADD TRANSACTION
// ==============================
router.post("/add", auth, async (req, res) => {
  try {
    const { type, amount, category, date } = req.body;

    const transaction = new Transaction({
      user: req.user.id,
      type,
      amount,
      category,
      date,
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ==============================
// 📜 GET HISTORY
// ==============================
router.get("/history", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id
    }).sort({ date: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ==============================
// 📊 DASHBOARD DATA
// ==============================
router.get("/dashboard", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      allTransactions: transactions,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ==============================
// 📈 ANALYTICS
// ==============================
router.get("/analytics", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id
    });

    const monthlyData = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0 };
      }

      if (t.type === "income") {
        monthlyData[key].income += t.amount;
      } else {
        monthlyData[key].expense += t.amount;
      }
    });

    const result = Object.keys(monthlyData).map((key) => ({
      month: key,
      income: monthlyData[key].income,
      expense: monthlyData[key].expense,
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ==============================
// ❌ DELETE TRANSACTION
// ==============================
router.delete("/:id", auth, async (req, res) => {
  try {
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ==============================
// ✏️ UPDATE TRANSACTION
// ==============================
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id
      },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;