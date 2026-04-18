import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [data, setData] = useState(null);
  const [budgets, setBudgets] = useState({});
  const [goal, setGoal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [userName, setUserName] = useState("there");

  const loadLocalData = () => {
    setBudgets(JSON.parse(localStorage.getItem("categoryBudgets")) || {});
    const goals = JSON.parse(localStorage.getItem("savingGoals")) || [];
    setGoal(goals[goals.length - 1] || null);
    const stored = localStorage.getItem("userName");
    if (stored) setUserName(stored);
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://finsight-erku.onrender.com/api/transactions/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem("token"); window.location.reload(); return; }
      const result = await res.json();
      setData(result);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchDashboard();
    loadLocalData();
    window.addEventListener("transactionAdded", fetchDashboard);
    window.addEventListener("budgetUpdated", loadLocalData);
    window.addEventListener("goalUpdated", loadLocalData);
    return () => {
      window.removeEventListener("transactionAdded", fetchDashboard);
      window.removeEventListener("budgetUpdated", loadLocalData);
      window.removeEventListener("goalUpdated", loadLocalData);
    };
  }, []);

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,0.3)", borderTop: "3px solid #6366f1", borderRadius: "50%" }} />
    </div>
  );

  const { totalIncome, totalExpense, balance, allTransactions } = data;
  const now = new Date();

  // Category expense this month
  let categoryExpense = {};
  let categoryTotal = {};
  let topCategory = "N/A"; let maxSpend = 0;

  (allTransactions || []).forEach(t => {
    const d = new Date(t.date);
    if (t.type === "expense") {
      categoryTotal[t.category] = (categoryTotal[t.category] || 0) + t.amount;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
      }
      if (categoryTotal[t.category] > maxSpend) { maxSpend = categoryTotal[t.category]; topCategory = t.category; }
    }
  });

  const savingRate = totalIncome ? ((balance / totalIncome) * 100).toFixed(1) : 0;
  const savedAmount = balance > 0 ? balance : 0;
  const goalPercent = goal?.amount ? Math.min(((savedAmount / goal.amount) * 100).toFixed(1), 100) : 0;

  const recentTx = [...(allTransactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const deleteGoal = () => { localStorage.removeItem("savingGoals"); setGoal(null); setMenuOpen(null); };
  const deleteBudget = cat => {
    const u = { ...budgets }; delete u[cat];
    localStorage.setItem("categoryBudgets", JSON.stringify(u)); setBudgets(u); setMenuOpen(null);
  };

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? "Good morning" : getHour() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={s.page}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={s.header}>
        <div>
          <p style={s.greetSub}>{greeting} 👋</p>
          <h1 style={s.greetName}>{userName}</h1>
        </div>
        <div style={s.badge}>HydraBolt Dashboard</div>
      </motion.div>

      {/* Stats Row */}
      <div style={s.statsRow}>
        {[
          { label: "Total Income", value: totalIncome, color: "#22c55e", icon: "↑", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" },
          { label: "Total Expense", value: totalExpense, color: "#ef4444", icon: "↓", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
          { label: "Balance", value: balance, color: "#818cf8", icon: "◎", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} whileHover={{ y: -3, scale: 1.01 }}
            style={{ ...s.statCard, background: card.bg, borderColor: card.border }}>
            <div style={s.statTop}>
              <span style={s.statLabel}>{card.label}</span>
              <span style={{ ...s.statIcon, color: card.color }}>{card.icon}</span>
            </div>
            <div style={{ ...s.statValue, color: card.color }}>₹{card.value?.toLocaleString()}</div>
          </motion.div>
        ))}
      </div>

      <div style={s.grid2}>
        {/* Saving Goal */}
        {goal && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardTitle}>🎯 Saving Goal</span>
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(menuOpen === "goal" ? null : "goal")} style={s.menuBtn}>⋮</button>
                <AnimatePresence>
                  {menuOpen === "goal" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} style={s.dropdown}>
                      <button onClick={deleteGoal} style={s.dropItem}>🗑️ Delete Goal</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p style={s.goalName}>{goal.name}</p>
            <div style={s.progressRow}>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>₹{savedAmount.toLocaleString()}</span>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>₹{goal.amount.toLocaleString()}</span>
            </div>
            <div style={s.progressBg}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${goalPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ ...s.progressFill, background: "linear-gradient(90deg, #6366f1, #a855f7)" }} />
            </div>
            <p style={{ ...s.goalPercent, color: goalPercent >= 100 ? "#22c55e" : "#818cf8" }}>
              {goalPercent}% completed {goalPercent >= 100 ? "🎉" : ""}
            </p>
          </motion.div>
        )}

        {/* Smart Insights */}
        <motion.div initial={{ opacity: 0, x: goal ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} style={s.card}>
          <div style={s.cardTitle}>💡 Smart Insights</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "🔥", text: `Most spending: ${topCategory}` },
              { icon: "📊", text: `Saving rate: ${savingRate}%` },
              { icon: "💰", text: `Balance: ₹${balance?.toLocaleString()}` },
              { icon: balance >= 0 ? "✅" : "⚠️", text: balance >= 0 ? "Finances look healthy!" : "Expenses exceed income" },
            ].map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }} style={s.insightRow}>
                <span style={s.insightIcon}>{ins.icon}</span>
                <span style={{ fontSize: 14, color: "#cbd5e1" }}>{ins.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Category Budgets */}
      {Object.keys(budgets).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardTitle}>📋 Category Budgets</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
            {Object.entries(budgets).map(([cat, budget], i) => {
              const spent = categoryExpense[cat.toLowerCase()] || categoryExpense[cat] || 0;
              const pct = Math.min((spent / budget) * 100, 100).toFixed(0);
              const over = spent > budget;
              return (
                <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }} style={s.budgetCard}>
                  <div style={s.budgetTop}>
                    <span style={s.budgetCat}>{cat}</span>
                    <div style={{ position: "relative" }}>
                      <button onClick={() => setMenuOpen(menuOpen === cat ? null : cat)} style={s.menuBtnSm}>⋮</button>
                      <AnimatePresence>
                        {menuOpen === cat && (
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={s.dropdown}>
                            <button onClick={() => deleteBudget(cat)} style={s.dropItem}>🗑️ Delete</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div style={s.progressRow}>
                    <span style={{ fontSize: 12, color: over ? "#f87171" : "#94a3b8" }}>₹{spent.toLocaleString()} / ₹{budget.toLocaleString()}</span>
                    <span style={{ fontSize: 12, color: over ? "#f87171" : "#22c55e", fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={s.progressBg}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }}
                      style={{ ...s.progressFill, background: over ? "linear-gradient(90deg,#ef4444,#f87171)" : "linear-gradient(90deg,#22c55e,#4ade80)" }} />
                  </div>
                  {over && <p style={{ color: "#f87171", fontSize: 11, margin: "4px 0 0" }}>⚠ Over budget</p>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={s.card}>
          <div style={s.cardTitle}>🕐 Recent Transactions</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {recentTx.map((t, i) => (
              <motion.div key={t._id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06 }} style={s.txRow}>
                <div style={{ ...s.txDot, background: t.type === "income" ? "#22c55e" : "#ef4444" }} />
                <div style={{ flex: 1 }}>
                  <p style={s.txCat}>{t.category}</p>
                  <p style={s.txDate}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span style={{ ...s.txAmount, color: t.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

const s = {
  page: { padding: "32px 24px", color: "white", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 1000, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  greetSub: { color: "#94a3b8", fontSize: 14, margin: "0 0 4px" },
  greetName: { fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", textTransform: "capitalize" },
  badge: { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, padding: "6px 14px", fontSize: 13, color: "#a5b4fc" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { borderRadius: 16, padding: "20px 22px", border: "1px solid", transition: "transform 0.2s", cursor: "default" },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  statLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 24px", marginBottom: 16 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0" },
  goalName: { fontSize: 20, fontWeight: 700, margin: "12px 0 10px", color: "white" },
  progressRow: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  progressBg: { height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 100 },
  goalPercent: { fontSize: 13, margin: "8px 0 0", fontWeight: 600 },
  menuBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "white", cursor: "pointer", padding: "4px 8px", fontSize: 16 },
  menuBtnSm: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 16, padding: "2px 6px" },
  dropdown: { position: "absolute", right: 0, top: "110%", background: "#1e1b3a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "4px", zIndex: 100, minWidth: 130, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" },
  dropItem: { display: "block", width: "100%", background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "8px 12px", textAlign: "left", borderRadius: 7, fontSize: 13 },
  insightRow: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px" },
  insightIcon: { fontSize: 18 },
  budgetCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" },
  budgetTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  budgetCat: { fontSize: 14, fontWeight: 600, textTransform: "capitalize", color: "#e2e8f0" },
  txRow: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  txDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  txCat: { fontSize: 14, fontWeight: 600, margin: 0, color: "#e2e8f0", textTransform: "capitalize" },
  txDate: { fontSize: 12, color: "#64748b", margin: "2px 0 0" },
  txAmount: { fontSize: 15, fontWeight: 700, flexShrink: 0 },
};

export default Dashboard;
