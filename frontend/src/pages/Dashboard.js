import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

function Dashboard() {
  const [data, setData] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [goal, setGoal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const loadLocalData = () => {
    const savedBudgets =
      JSON.parse(localStorage.getItem("categoryBudgets")) || {};
    setBudgets(savedBudgets);

    const goals =
      JSON.parse(localStorage.getItem("savingGoals")) || [];

    setGoal(goals[goals.length - 1] || null);
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://finsight-erku.onrender.com/api/transactions/dashboard",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      const result = await res.json();
      console.log("DASHBOARD:", result);

      setData(result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    loadLocalData();

    // 🔥 THIS WAS MISSING
    window.addEventListener("transactionAdded", fetchDashboard);
    window.addEventListener("budgetUpdated", loadLocalData);
    window.addEventListener("goalUpdated", loadLocalData);

    return () => {
      window.removeEventListener("transactionAdded", fetchDashboard);
      window.removeEventListener("budgetUpdated", loadLocalData);
      window.removeEventListener("goalUpdated", loadLocalData);
    };
  }, []);

  if (!data) return <h2 style={{ color: "white" }}>Loading...</h2>;

  const { totalIncome, totalExpense, balance, allTransactions } = data;

  const now = new Date();
  let categoryExpense = {};
  let categoryTotal = {};

  (allTransactions || []).forEach((t) => {
    const d = new Date(t.date);

    if (t.type === "expense") {
      categoryTotal[t.category] =
        (categoryTotal[t.category] || 0) + t.amount;
    }

    if (
      t.type === "expense" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      categoryExpense[t.category] =
        (categoryExpense[t.category] || 0) + t.amount;
    }
  });

  let topCategory = "N/A";
  let max = 0;

  Object.keys(categoryTotal).forEach((cat) => {
    if (categoryTotal[cat] > max) {
      max = categoryTotal[cat];
      topCategory = cat;
    }
  });

  const savingRate = totalIncome
    ? ((balance / totalIncome) * 100).toFixed(1)
    : 0;

  const savedAmount = balance > 0 ? balance : 0;
  const goalPercent = goal?.amount
    ? Math.min(((savedAmount / goal.amount) * 100).toFixed(1), 100)
    : 0;

  const deleteGoal = () => {
    localStorage.removeItem("savingGoals");
    setGoal(null);
    setMenuOpen(null);
  };

  const deleteBudget = (cat) => {
    const updated = { ...budgets };
    delete updated[cat];
    localStorage.setItem("categoryBudgets", JSON.stringify(updated));
    setBudgets(updated);
    setMenuOpen(null);
  };

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>FinSight</h1>

      <h2 style={{ marginTop: "10px", color: "#cbd5f5" }}>
        👋 Welcome Hydra
      </h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        {[
          { title: "Income", value: totalIncome, color: "#22c55e" },
          { title: "Expense", value: totalExpense, color: "#ef4444" },
          { title: "Balance", value: balance, color: "#a855f7" }
        ].map((card, i) => (
          <motion.div key={i} style={{
            padding: "20px",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.05)",
            minWidth: "220px"
          }}>
            <h3>{card.title}</h3>
            <h2 style={{ color: card.color }}>₹{card.value}</h2>
          </motion.div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3>💡 Smart Insights</h3>
        <p>🔥 You spend most on <strong>{topCategory}</strong></p>
        <p>📊 Saving rate: <strong>{savingRate}%</strong></p>
      </div>
    </div>
  );
}

export default Dashboard;

const cardStyle = {
  marginTop: "30px",
  padding: "20px",
  borderRadius: "15px",
  background: "rgba(255,255,255,0.05)"
};