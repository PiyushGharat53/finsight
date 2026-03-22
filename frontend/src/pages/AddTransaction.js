import React, { useState } from "react";
import { motion } from "framer-motion";

function AddTransaction() {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const [message, setMessage] = useState("");

  // 🔥 FIXED ADD TRANSACTION
  const addTransaction = async () => {
    try {
      const res = await fetch("https://finsight-erku.onrender.com/api/transactions/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          date: date || new Date(),
        }),
      });

      const data = await res.json();
      console.log("RESPONSE:", data);

      if (res.ok) {
       setMessage("✅ Transaction Added");

  // 🔥 FORCE HISTORY REFRESH
  window.dispatchEvent(new Event("transactionAdded"));

  setAmount("");
  setCategory("");
  setDate("");
      } else {
        setMessage("❌ Failed to add");
      }
    } catch (err) {
      console.log(err);
      setMessage("❌ Server error");
    }
  };

  // 🔥 SAVE BUDGET (unchanged)
  const saveBudget = () => {
    const budgets =
      JSON.parse(localStorage.getItem("categoryBudgets")) || {};

    budgets[budgetCategory.toLowerCase()] = Number(budgetAmount);

    localStorage.setItem("categoryBudgets", JSON.stringify(budgets));

    window.dispatchEvent(new Event("budgetUpdated"));

    setMessage("💰 Budget Saved");
    setBudgetCategory("");
    setBudgetAmount("");
  };

  // 🔥 FIXED GOALS (NO REPLACE ISSUE EVER)
  const saveGoal = () => {
    let goals = JSON.parse(localStorage.getItem("savingGoals"));

    if (!Array.isArray(goals)) {
      goals = [];
    }

    const newGoal = {
      name: goalName,
      amount: Number(goalAmount),
    };

    goals.push(newGoal);

    localStorage.setItem("savingGoals", JSON.stringify(goals));

    window.dispatchEvent(new Event("goalUpdated"));

    setMessage("🎯 Goal Saved");
    setGoalName("");
    setGoalAmount("");
  };

  const goals =
    JSON.parse(localStorage.getItem("savingGoals")) || [];

  const currentGoal = goals[goals.length - 1];

  return (
    <div style={{ padding: "30px" }}>
      <h1>✨ Add & Plan</h1>

      {message && <div style={toast}>{message}</div>}

      {/* ADD */}
      <motion.div style={card}>
        <h2>💸 Add Transaction</h2>

        <div style={row}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={input} />
          <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={input} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />

          <button onClick={addTransaction} style={btn}>Add</button>
        </div>

        {currentGoal && (
          <p style={{ color: "#22c55e" }}>
            This helps your goal "{currentGoal.name}"
          </p>
        )}
      </motion.div>

      {/* BUDGET */}
      <motion.div style={card}>
        <h2>📊 Category Budget</h2>

        <div style={row}>
          <input placeholder="Category" value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)} style={input} />
          <input placeholder="Amount" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} style={input} />
          <button onClick={saveBudget} style={btn}>Save</button>
        </div>
      </motion.div>

      {/* GOAL */}
      <motion.div style={card}>
        <h2>🎯 Saving Goal</h2>

        <div style={row}>
          <input placeholder="Goal" value={goalName} onChange={(e) => setGoalName(e.target.value)} style={input} />
          <input placeholder="Target" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} style={input} />
          <button onClick={saveGoal} style={btn}>Save</button>
        </div>
      </motion.div>
    </div>
  );
}

export default AddTransaction;

// styles
const card = { background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "20px", marginBottom: "20px" };
const row = { display: "flex", gap: "10px", flexWrap: "wrap" };
const input = { padding: "10px", borderRadius: "10px", border: "none", background: "#1e1b4b", color: "white" };
const btn = { padding: "10px", borderRadius: "10px", background: "#22c55e", color: "white", border: "none" };

// ✅ FIXED MESSAGE COLOR
const toast = { 
  background: "#111827", 
  color: "#ffffff", 
  padding: "10px", 
  borderRadius: "10px", 
  marginBottom: "10px",
  fontWeight: "500"
};