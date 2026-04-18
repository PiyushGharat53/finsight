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

    const latestGoal = goals[goals.length - 1];

    if (latestGoal) setGoal(latestGoal);
    else setGoal(null);
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log("TOKEN:", token); // 🔥 debug

      const res = await fetch(
        "https://finsight-erku.onrender.com/api/transactions/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 HANDLE AUTH FAIL
      if (res.status === 401) {
        console.log("Unauthorized → logging out");
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      if (!res.ok) {
        console.log("API ERROR");
        return;
      }

      const data = await res.json();
      console.log("DASHBOARD DATA:", data);

      setData(data);

    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    loadLocalData();

    window.addEventListener("budgetUpdated", loadLocalData);
    window.addEventListener("goalUpdated", loadLocalData);

    return () => {
      window.removeEventListener("budgetUpdated", loadLocalData);
      window.removeEventListener("goalUpdated", loadLocalData);
    };
  }, []);

  // 🔥 STOP INFINITE LOADING
  if (!data) return <h2 style={{ color: "white" }}>Loading...</h2>;

  const { totalIncome, totalExpense, balance, allTransactions } = data;

  const now = new Date();

  let categoryExpense = {};
  let categoryTotal = {};

  (allTransactions || []).forEach((t) => {
    const d = new Date(t.date);

    if (t.type === "expense") {
      if (!categoryTotal[t.category]) categoryTotal[t.category] = 0;
      categoryTotal[t.category] += t.amount;
    }

    if (
      t.type === "expense" &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      if (!categoryExpense[t.category]) categoryExpense[t.category] = 0;
      categoryExpense[t.category] += t.amount;
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
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/logo.png" alt="logo" style={{ width: "40px" }} />
        <h1>FinSight</h1>
      </div>

      <h2 style={{ marginTop: "10px", color: "#cbd5f5" }}>
        👋 Welcome Hydra
      </h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        {[
          { title: "Income", value: totalIncome, color: "#22c55e" },
          { title: "Expense", value: totalExpense, color: "#ef4444" },
          { title: "Balance", value: balance, color: "#a855f7" }
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: "20px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.05)",
              boxShadow: `0 0 25px ${card.color}55`,
              minWidth: "220px"
            }}
          >
            <h3>{card.title}</h3>
            <h2 style={{ color: card.color }}>₹{card.value}</h2>
          </motion.div>
        ))}
      </div>

      <div style={cardStyle}>
        <h3>💡 Smart Insights</h3>
        <p>🔥 You spend most on <strong>{topCategory}</strong></p>
        <p>📊 Your saving rate is <strong>{savingRate}%</strong></p>
        <p>
          {balance < 0
            ? "⚠️ You are overspending!"
            : "💰 You are managing money well!"}
        </p>
      </div>

      {goal && (
        <div style={cardStyle}>
          <button onClick={() => setMenuOpen(menuOpen === "goal" ? null : "goal")} style={menuBtn}>⋮</button>

          {menuOpen === "goal" && (
            <div style={menu}>
              <div style={{ ...menuItem, color: "red" }} onClick={deleteGoal}>Delete</div>
            </div>
          )}

          <h3>🚀 Saving Goal: {goal.name}</h3>
          <p>₹{savedAmount} / ₹{goal.amount}</p>

          <div style={progressBg}>
            <div style={{ width: `${goalPercent}%`, height: "100%", background: "#22c55e" }} />
          </div>

          <p>{goalPercent}% completed</p>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3>📊 Category Budget</h3>

        {Object.keys(budgets).map((cat) => {
          const spent = categoryExpense[cat] || 0;
          const limit = budgets[cat];
          const percent = ((spent / limit) * 100).toFixed(1);

          return (
            <div key={cat} style={cardStyle}>
              <button onClick={() => setMenuOpen(menuOpen === cat ? null : cat)} style={menuBtn}>⋮</button>

              {menuOpen === cat && (
                <div style={menu}>
                  <div style={{ ...menuItem, color: "red" }} onClick={() => deleteBudget(cat)}>Delete</div>
                </div>
              )}

              <strong>{cat}</strong>
              <p>₹{spent} / ₹{limit}</p>

              <div style={progressBg}>
                <div style={{
                  width: `${Math.min(percent, 100)}%`,
                  height: "100%",
                  background:
                    percent > 100 ? "#ef4444" :
                    percent > 70 ? "#facc15" :
                    "#22c55e"
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;

// styles
const cardStyle = {
  marginTop: "40px",
  padding: "20px",
  borderRadius: "15px",
  background: "rgba(255,255,255,0.05)",
  position: "relative"
};

const progressBg = {
  height: "10px",
  background: "#333",
  borderRadius: "10px",
  overflow: "hidden"
};

const menuBtn = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "18px",
  cursor: "pointer"
};

const menu = {
  position: "absolute",
  top: "30px",
  right: "10px",
  background: "#1e1b4b",
  borderRadius: "8px",
  padding: "5px",
  zIndex: 10
};

const menuItem = {
  padding: "6px 10px",
  cursor: "pointer"
};