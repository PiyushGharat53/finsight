const Transaction = require("../models/Transaction");

// ➕ ADD TRANSACTION
exports.addTransaction = async (req, res) => {
  try {
    const { type, category, amount, note, date } = req.body;

    const transaction = new Transaction({
      type,
      category,
      amount,
      note,
      date,
      user: req.user.id // ✅ FIXED (use "user" everywhere)
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction added successfully",
      transaction
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 GET ALL TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id   // ✅ FIXED (was userId ❌)
    }).sort({ date: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ DELETE TRANSACTION
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user.id) { // ✅ FIXED
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ UPDATE TRANSACTION
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.user.toString() !== req.user.id) { // ✅ FIXED
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Updated successfully",
      transaction: updated
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📊 DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id   // ✅ FIXED
    });

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.type === "income") {
        income += Number(t.amount);
      } else {
        expense += Number(t.amount);
      }
    });

    const balance = income - expense;

    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      totalIncome: income,
      totalExpense: expense,
      balance,
      recentTransactions,
      allTransactions: transactions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};