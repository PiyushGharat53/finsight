import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Food", "Bills", "Transport", "Shopping", "Entertainment", "Health", "Education", "Travel", "Tech", "Other"];

function AddTransaction() {
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const goals = JSON.parse(localStorage.getItem("savingGoals")) || [];
  const currentGoal = goals[goals.length - 1];

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const validateTx = () => {
    const e = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid amount (numbers only)";
    if (!category) e.category = "Please enter a category";
    if (!date) e.date = "Please select a date";
    return e;
  };

  const addTransaction = async () => {
    const errs = validateTx();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://finsight-erku.onrender.com/api/transactions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type, amount: Number(amount), category, date: new Date(date).toISOString(), note }),
      });

      const result = await res.json();
      if (res.ok) {
        showMsg("✅ Transaction added successfully!", "success");
        window.dispatchEvent(new Event("transactionAdded"));
        setAmount(""); setCategory(""); setDate(""); setNote(""); setErrors({});
      } else {
        showMsg(result.message || "❌ Failed to add", "error");
      }
    } catch {
      showMsg("❌ Server error", "error");
    }
    setLoading(false);
  };

  const saveBudget = () => {
    if (!budgetCategory || !budgetAmount || Number(budgetAmount) <= 0) {
      showMsg("⚠️ Enter valid category and amount", "error"); return;
    }
    const budgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
    budgets[budgetCategory.toLowerCase()] = Number(budgetAmount);
    localStorage.setItem("categoryBudgets", JSON.stringify(budgets));
    window.dispatchEvent(new Event("budgetUpdated"));
    showMsg("💰 Budget saved!", "success");
    setBudgetCategory(""); setBudgetAmount("");
  };

  const saveGoal = () => {
    if (!goalName || !goalAmount || Number(goalAmount) <= 0) {
      showMsg("⚠️ Enter valid goal name and target", "error"); return;
    }
    let goals = JSON.parse(localStorage.getItem("savingGoals")) || [];
    if (!Array.isArray(goals)) goals = [];
    goals.push({ name: goalName, amount: Number(goalAmount) });
    localStorage.setItem("savingGoals", JSON.stringify(goals));
    window.dispatchEvent(new Event("goalUpdated"));
    showMsg("🎯 Goal saved!", "success");
    setGoalName(""); setGoalAmount("");
  };

  return (
    <div style={s.page}>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={s.pageTitle}>
        ✨ Add & Plan
      </motion.h1>

      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
            style={{ ...s.toast, ...(message.type === "error" ? s.toastErr : s.toastOk) }}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Transaction Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={s.card}>
        <h2 style={s.cardTitle}>💸 Add Transaction</h2>

        {/* Type Toggle */}
        <div style={s.typeToggle}>
          {["expense", "income"].map(t => (
            <motion.button key={t} onClick={() => setType(t)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ ...s.typeBtn, ...(type === t ? (t === "income" ? s.typeBtnIncome : s.typeBtnExpense) : s.typeBtnInactive) }}>
              {t === "income" ? "↑ Income" : "↓ Expense"}
            </motion.button>
          ))}
        </div>

        <div style={s.formGrid}>
          {/* Amount */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Amount (₹)</label>
            <div style={{ position: "relative" }}>
              <span style={s.prefix}>₹</span>
              <input
                type="number" min="0" step="any"
                placeholder="0.00" value={amount}
                onKeyDown={e => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }}
                onChange={e => { setAmount(e.target.value); setErrors(v => ({ ...v, amount: "" })); }}
                style={{ ...s.input, ...(errors.amount ? s.inputErr : {}), paddingLeft: 32 }} />
            </div>
            {errors.amount && <p style={s.errTxt}>⚠ {errors.amount}</p>}
          </div>

          {/* Category Dropdown */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Category</label>
           <input
  type="text"
  placeholder="Enter category (e.g. Food, Travel...)"
  value={category}
  onChange={e => {
    setCategory(e.target.value);
    setErrors(v => ({ ...v, category: "" }));
  }}
  style={{ ...s.input, ...(errors.category ? s.inputErr : {}) }}
/>
            {errors.category && <p style={s.errTxt}>⚠ {errors.category}</p>}
          </div>

          {/* Date */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Date</label>
            <input type="date" value={date}
              onChange={e => { setDate(e.target.value); setErrors(v => ({ ...v, date: "" })); }}
              style={{ ...s.input, ...(errors.date ? s.inputErr : {}), colorScheme: "dark" }} />
            {errors.date && <p style={s.errTxt}>⚠ {errors.date}</p>}
          </div>

          {/* Note */}
          <div style={s.fieldWrap}>
            <label style={s.label}>Note (optional)</label>
            <input placeholder="Add a note..." value={note}
              onChange={e => setNote(e.target.value)}
              style={s.input} />
          </div>
        </div>

        {currentGoal && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.goalHint}>
            🎯 This contributes toward your goal "{currentGoal.name}"
          </motion.p>
        )}

        <motion.button onClick={addTransaction} disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }}
          whileTap={{ scale: 0.98 }}
          style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Adding..." : "Add Transaction →"}
        </motion.button>
      </motion.div>

      <div style={s.grid2}>
        {/* Category Budget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={s.card}>
          <h2 style={s.cardTitle}>📋 Category Budget</h2>
          <p style={s.cardSub}>Set a monthly spending limit per category</p>
          <div style={s.miniForm}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Category</label>
              <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} style={s.input}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Monthly Limit (₹)</label>
              <input type="number" min="0" placeholder="5000"
                value={budgetAmount}
                onKeyDown={e => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }}
                onChange={e => setBudgetAmount(e.target.value)} style={s.input} />
            </div>
            <motion.button onClick={saveBudget} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={s.secBtn}>
              Save Budget
            </motion.button>
          </div>
        </motion.div>

        {/* Saving Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={s.card}>
          <h2 style={s.cardTitle}>🎯 Saving Goal</h2>
          <p style={s.cardSub}>Set a savings target to work toward</p>
          <div style={s.miniForm}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Goal Name</label>
              <input placeholder="e.g. New Laptop, Vacation..." value={goalName}
                onChange={e => setGoalName(e.target.value)} style={s.input} />
            </div>
            <div style={s.fieldWrap}>
              <label style={s.label}>Target Amount (₹)</label>
              <input type="number" min="0" placeholder="50000"
                value={goalAmount}
                onKeyDown={e => { if (["e","E","+","-"].includes(e.key)) e.preventDefault(); }}
                onChange={e => setGoalAmount(e.target.value)} style={s.input} />
            </div>
            <motion.button onClick={saveGoal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={s.secBtn}>
              Save Goal
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const s = {
  page: { padding: "32px 24px", color: "white", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 900, margin: "0 auto" },
  pageTitle: { fontSize: 26, fontWeight: 800, margin: "0 0 24px", letterSpacing: "-0.02em" },
  toast: { borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 14, fontWeight: 600 },
  toastOk: { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" },
  toastErr: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "28px", marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "white" },
  cardSub: { fontSize: 13, color: "#64748b", margin: "0 0 20px" },
  typeToggle: { display: "flex", gap: 10, marginBottom: 24 },
  typeBtn: { flex: 1, padding: "12px", borderRadius: 10, border: "2px solid", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  typeBtnExpense: { background: "rgba(239,68,68,0.12)", borderColor: "#ef4444", color: "#f87171" },
  typeBtnIncome: { background: "rgba(34,197,94,0.12)", borderColor: "#22c55e", color: "#4ade80" },
  typeBtnInactive: { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)", color: "#64748b" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 16 },
  fieldWrap: {},
  label: { display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.07em", textTransform: "uppercase" },
  input: { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", appearance: "none" },
  inputErr: { borderColor: "rgba(239,68,68,0.5)" },
  prefix: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14, pointerEvents: "none" },
  errTxt: { color: "#f87171", fontSize: 11, margin: "4px 0 0" },
  goalHint: { color: "#22c55e", fontSize: 13, margin: "0 0 16px" },
  submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  secBtn: { width: "100%", padding: "12px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  miniForm: { display: "flex", flexDirection: "column", gap: 14 },
};

export default AddTransaction;
