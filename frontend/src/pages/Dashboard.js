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

  useEffect(() => {
    const handleClose = () => setMenuOpen(null);
    document.addEventListener("click", handleClose);
    return () => document.removeEventListener("click", handleClose);
  }, []);

  if (!data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 42, height: 42, border: "3px solid rgba(99,102,241,0.2)", borderTop: "3px solid #6366f1", borderRadius: "50%" }} />
      <p style={{ color: "#334155", fontSize: 14 }}>Loading your dashboard...</p>
    </div>
  );

  const { totalIncome, totalExpense, balance, allTransactions } = data;
  const now = new Date();
  let categoryExpense = {}, categoryTotal = {}, topCategory = "N/A", maxSpend = 0;

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const deleteGoal = (e) => { e.stopPropagation(); localStorage.removeItem("savingGoals"); setGoal(null); setMenuOpen(null); };
  const deleteBudget = (cat, e) => {
    e.stopPropagation();
    const u = { ...budgets }; delete u[cat];
    localStorage.setItem("categoryBudgets", JSON.stringify(u)); setBudgets(u); setMenuOpen(null);
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={s.header}>
        <div>
          <p style={s.greetSub}>{greeting} 👋</p>
          <h1 style={s.greetName} title={userName}>{userName}</h1>
        </div>
        <div style={s.headerRight}>
          <div style={s.dateBadge}>{now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
      </motion.div>

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: "Total Income", value: totalIncome, color: "#22c55e", dimColor: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.18)", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
          { label: "Total Expense", value: totalExpense, color: "#ef4444", dimColor: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.18)", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg> },
          { label: "Net Balance", value: balance, color: balance >= 0 ? "#818cf8" : "#f87171", dimColor: balance >= 0 ? "rgba(99,102,241,0.08)" : "rgba(239,68,68,0.06)", border: balance >= 0 ? "rgba(99,102,241,0.2)" : "rgba(239,68,68,0.18)", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={balance >= 0 ? "#818cf8" : "#f87171"} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} whileHover={{ y: -3, scale: 1.01 }}
            style={{ ...s.statCard, background: card.dimColor, borderColor: card.border }}>
            <div style={s.statTop}>
              <span style={s.statLabel}>{card.label}</span>
              <div style={{ ...s.statIconBox, borderColor: card.border }}>{card.icon}</div>
            </div>
            <div style={{ ...s.statValue, color: card.color }}>
              ₹{Math.abs(card.value || 0).toLocaleString("en-IN")}
            </div>
            {card.label === "Net Balance" && (
              <p style={{ fontSize: 12, color: balance >= 0 ? "#22c55e" : "#f87171", margin: "4px 0 0" }}>
                {balance >= 0 ? "▲ Positive balance" : "▼ In deficit"}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div style={s.twoCol}>
        {/* Saving Goal */}
        {goal && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} style={s.card}>
            <div style={s.cardHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={s.cardIconBox}>🎯</div>
                <span style={s.cardTitle}>Saving Goal</span>
              </div>
              <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setMenuOpen(menuOpen === "goal" ? null : "goal")} style={s.menuBtn}>⋯</button>
                <AnimatePresence>
                  {menuOpen === "goal" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={s.dropdown}>
                      <button onClick={deleteGoal} style={s.dropItem}>🗑️ Delete Goal</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p style={s.goalName}>{goal.name}</p>
            <div style={s.progressMeta}>
              <span style={s.progressLabel}>₹{savedAmount.toLocaleString("en-IN")} saved</span>
              <span style={s.progressLabel}>Target: ₹{Number(goal.amount).toLocaleString("en-IN")}</span>
            </div>
            <div style={s.progressTrack}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${goalPercent}%` }} transition={{ duration: 1.4, ease: "easeOut" }}
                style={{ ...s.progressBar, background: goalPercent >= 100 ? "linear-gradient(90deg, #22c55e, #4ade80)" : "linear-gradient(90deg, #6366f1, #a855f7)" }} />
            </div>
            <p style={{ ...s.goalPct, color: goalPercent >= 100 ? "#22c55e" : "#818cf8" }}>
              {goalPercent}% complete {goalPercent >= 100 ? "🎉 Goal reached!" : ""}
            </p>
          </motion.div>
        )}

        {/* Smart Insights */}
        <motion.div initial={{ opacity: 0, x: goal ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} style={s.card}>
          <div style={s.cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={s.cardIconBox}>💡</div>
              <span style={s.cardTitle}>Smart Insights</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {[
              { icon: "🔥", text: `Top category: ${topCategory}`, color: "#f97316" },
              { icon: "📊", text: `Saving rate: ${savingRate}%`, color: "#818cf8" },
              { icon: balance >= 0 ? "✅" : "⚠️", text: balance >= 0 ? "Finances look healthy" : "Expenses exceed income", color: balance >= 0 ? "#22c55e" : "#f87171" },
              { icon: "📅", text: `${(allTransactions || []).length} transactions total`, color: "#94a3b8" },
            ].map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                style={s.insightRow}>
                <span style={{ fontSize: 17 }}>{ins.icon}</span>
                <span style={{ fontSize: 14, color: "#cbd5e1", flex: 1 }}>{ins.text}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: ins.color, flexShrink: 0 }} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Category Budgets - full width with expanded bars */}
      {Object.keys(budgets).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={s.card}>
          <div style={{ ...s.cardHeader, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={s.cardIconBox}>📋</div>
              <span style={s.cardTitle}>Category Budgets</span>
            </div>
            <span style={s.cardSubBadge}>{Object.keys(budgets).length} active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {Object.entries(budgets).map(([cat, budget], i) => {
              const spent = categoryExpense[cat] || 0;
              const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
              const over = spent > budget;
              const remaining = budget - spent;
              return (
                <motion.div key={cat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  style={s.budgetRow}>
                  <div style={s.budgetInfo}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ ...s.budgetDot, background: over ? "#ef4444" : "#22c55e" }} />
                        <span style={s.budgetCat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        {over && <span style={s.overBadge}>Over budget</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 13, color: "#64748b" }}>₹{spent.toLocaleString("en-IN")} / ₹{budget.toLocaleString("en-IN")}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: over ? "#f87171" : "#22c55e", minWidth: 36, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                        <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => setMenuOpen(menuOpen === cat ? null : cat)} style={s.menuBtnSm}>⋯</button>
                          <AnimatePresence>
                            {menuOpen === cat && (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ ...s.dropdown, right: 0, left: "auto" }}>
                                <button onClick={(e) => deleteBudget(cat, e)} style={s.dropItem}>🗑️ Delete</button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                    {/* Full-width bar */}
                    <div style={s.progressTrack}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{ ...s.progressBar, background: over ? "linear-gradient(90deg, #ef4444, #f87171)" : pct > 75 ? "linear-gradient(90deg, #f97316, #fb923c)" : "linear-gradient(90deg, #22c55e, #4ade80)" }} />
                    </div>
                    {!over && (
                      <p style={{ fontSize: 12, color: "#334155", marginTop: 5 }}>
                        ₹{remaining.toLocaleString("en-IN")} remaining this month
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {recentTx.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={s.card}>
          <div style={{ ...s.cardHeader, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={s.cardIconBox}>🕐</div>
              <span style={s.cardTitle}>Recent Transactions</span>
            </div>
            <span style={s.cardSubBadge}>Last 5</span>
          </div>
          {recentTx.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.06 }} style={s.txRow}>
              <div style={{ ...s.txDot, background: t.type === "income" ? "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)" }}>
                <span style={{ color: t.type === "income" ? "#22c55e" : "#ef4444", fontSize: 11, fontWeight: 800 }}>
                  {t.type === "income" ? "↑" : "↓"}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={s.txCat}>{t.category.charAt(0).toUpperCase() + t.category.slice(1)}</p>
                <p style={s.txDate}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: t.type === "income" ? "#22c55e" : "#ef4444" }}>
                {t.type === "income" ? "+" : "−"}₹{t.amount.toLocaleString("en-IN")}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

const s = {
  page: { padding: "32px 28px", color: "white", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 1040, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 30 },
  greetSub: { color: "#475569", fontSize: 14, margin: "0 0 4px" },
  greetName: { fontSize: 30, fontWeight: 900, margin: 0, letterSpacing: "-0.03em", textTransform: "capitalize", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  headerRight: { display: "flex", gap: 10, alignItems: "center" },
  dateBadge: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "6px 14px", fontSize: 12, color: "#64748b" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 },
  statCard: { borderRadius: 18, padding: "22px 24px", border: "1px solid", transition: "transform 0.2s", cursor: "default" },
  statTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" },
  statIconBox: { width: 34, height: 34, borderRadius: 9, border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.03)" },
  statValue: { fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "24px 26px", marginBottom: 16 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardIconBox: { fontSize: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#e2e8f0" },
  cardSubBadge: { fontSize: 12, color: "#334155", background: "rgba(255,255,255,0.04)", borderRadius: 100, padding: "3px 10px" },
  goalName: { fontSize: 22, fontWeight: 800, margin: "14px 0 12px", color: "white", letterSpacing: "-0.02em" },
  progressMeta: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, color: "#64748b" },
  progressTrack: { height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 100, overflow: "hidden", width: "100%" },
  progressBar: { height: "100%", borderRadius: 100 },
  goalPct: { fontSize: 13, margin: "8px 0 0", fontWeight: 700 },
  menuBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, color: "#94a3b8", cursor: "pointer", padding: "5px 9px", fontSize: 15, letterSpacing: "0.05em" },
  menuBtnSm: { background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 15, padding: "3px 6px" },
  dropdown: { position: "absolute", right: 0, top: "110%", background: "#0d0b1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "4px", zIndex: 100, minWidth: 130, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" },
  dropItem: { display: "block", width: "100%", background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "8px 12px", textAlign: "left", borderRadius: 7, fontSize: 13, fontFamily: "inherit" },
  insightRow: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "11px 14px" },
  budgetRow: { borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 18 },
  budgetInfo: {},
  budgetDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  budgetCat: { fontSize: 14, fontWeight: 700, color: "#e2e8f0", textTransform: "capitalize" },
  overBadge: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 100, padding: "2px 8px", fontSize: 10, color: "#f87171", fontWeight: 700 },
  txRow: { display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  txDot: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  txCat: { fontSize: 14, fontWeight: 600, margin: 0, color: "#e2e8f0", textTransform: "capitalize" },
  txDate: { fontSize: 12, color: "#475569", margin: "2px 0 0" },
};

export default Dashboard;
