import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [focused, setFocused] = useState("");

  const goals = JSON.parse(localStorage.getItem("savingGoals")) || [];
  const currentGoal = goals[goals.length - 1];

  const showMsg = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3500);
  };

  const validateTx = () => {
    const e = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid positive number";
    if (!category.trim()) e.category = "Category is required";
    else if (/\d/.test(category)) e.category = "Category must be text only, no numbers";
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
        body: JSON.stringify({ type, amount: Number(amount), category: category.trim().toLowerCase(), date: new Date(date).toISOString(), note }),
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
      showMsg("❌ Server error. Try again.", "error");
    }
    setLoading(false);
  };

  const saveBudget = () => {
    if (!budgetCategory.trim() || !budgetAmount || Number(budgetAmount) <= 0) {
      showMsg("⚠️ Enter a category and valid amount", "error"); return;
    }
    const b = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
    b[budgetCategory.trim().toLowerCase()] = Number(budgetAmount);
    localStorage.setItem("categoryBudgets", JSON.stringify(b));
    window.dispatchEvent(new Event("budgetUpdated"));
    showMsg("💰 Budget saved!", "success");
    setBudgetCategory(""); setBudgetAmount("");
  };

  const saveGoal = () => {
    if (!goalName.trim() || !goalAmount || Number(goalAmount) <= 0) {
      showMsg("⚠️ Enter a goal name and valid target", "error"); return;
    }
    let g = JSON.parse(localStorage.getItem("savingGoals")) || [];
    if (!Array.isArray(g)) g = [];
    g.push({ name: goalName.trim(), amount: Number(goalAmount) });
    localStorage.setItem("savingGoals", JSON.stringify(g));
    window.dispatchEvent(new Event("goalUpdated"));
    showMsg("🎯 Goal saved!", "success");
    setGoalName(""); setGoalAmount("");
  };

  const inputStyle = (name) => ({
    ...s.input,
    ...(errors[name] ? s.inputErr : focused === name ? s.inputFocus : {}),
  });

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={s.pageHeader}>
        <h1 style={s.pageTitle}>✨ Add & Plan</h1>
        <p style={s.pageSub}>Track transactions, set budgets, and build savings goals</p>
      </motion.div>

      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            style={{ ...s.toast, ...(message.type === "error" ? s.toastErr : s.toastOk) }}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Transaction Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h2 style={s.cardTitle}>💸 Add Transaction</h2>
            <p style={s.cardSub}>Record a new income or expense</p>
          </div>
        </div>

        {/* Type toggle */}
        <div style={s.typeRow}>
          {["expense", "income"].map(t => (
            <motion.button key={t} onClick={() => setType(t)}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                ...s.typeBtn,
                ...(type === t
                  ? t === "income" ? s.typeBtnIncome : s.typeBtnExpense
                  : s.typeBtnOff)
              }}>
              <span style={{ fontSize: 16 }}>{t === "income" ? "↑" : "↓"}</span>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </motion.button>
          ))}
        </div>

        <div style={s.grid3}>
          {/* Amount */}
          <div>
            <Label>Amount (₹)</Label>
            <div style={{ position: "relative" }}>
              <span style={s.prefix}>₹</span>
              <input type="number" min="0" step="any" placeholder="0.00" value={amount}
                onFocus={() => setFocused("amount")} onBlur={() => setFocused("")}
                onKeyDown={e => ["e","E","+","-"].includes(e.key) && e.preventDefault()}
                onChange={e => { setAmount(e.target.value); setErrors(v => ({ ...v, amount: "" })); }}
                style={{ ...inputStyle("amount"), paddingLeft: 32 }} />
            </div>
            <Err msg={errors.amount} />
          </div>

          {/* Category - free text */}
          <div>
            <Label>Category</Label>
            <input placeholder="e.g. Food, Bills, Travel..." value={category}
              onFocus={() => setFocused("category")} onBlur={() => setFocused("")}
              onChange={e => {
                // Only allow letters, spaces, hyphens
                const val = e.target.value.replace(/[^a-zA-Z\s\-]/g, "");
                setCategory(val);
                setErrors(v => ({ ...v, category: "" }));
              }}
              style={inputStyle("category")} />
            <Err msg={errors.category} />
          </div>

          {/* Date */}
          <div>
            <Label>Date</Label>
            <input type="date" value={date}
              onFocus={() => setFocused("date")} onBlur={() => setFocused("")}
              onChange={e => { setDate(e.target.value); setErrors(v => ({ ...v, date: "" })); }}
              style={{ ...inputStyle("date"), colorScheme: "dark" }} />
            <Err msg={errors.date} />
          </div>
        </div>

        {/* Note */}
        <div style={{ marginTop: 14 }}>
          <Label>Note (optional)</Label>
          <input placeholder="Add a description or note..." value={note}
            onFocus={() => setFocused("note")} onBlur={() => setFocused("")}
            onChange={e => setNote(e.target.value)}
            style={inputStyle("note")} />
        </div>

        {currentGoal && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.goalHint}>
            🎯 This contributes toward your goal "{currentGoal.name}"
          </motion.p>
        )}

        <motion.button onClick={addTransaction} disabled={loading}
          whileHover={!loading ? { scale: 1.01, boxShadow: "0 12px 40px rgba(99,102,241,0.4)" } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1, marginTop: 20 }}>
          {loading ? "Adding..." : `Add ${type.charAt(0).toUpperCase() + type.slice(1)} →`}
        </motion.button>
      </motion.div>

      <div style={s.grid2}>
        {/* Budget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={s.card}>
          <h2 style={s.cardTitle}>📋 Category Budget</h2>
          <p style={s.cardSub}>Set monthly spending limits per category</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <div>
              <Label>Category Name</Label>
              <input placeholder="e.g. Food, Shopping..." value={budgetCategory}
                onChange={e => setBudgetCategory(e.target.value.replace(/[^a-zA-Z\s\-]/g, ""))}
                style={s.input} />
            </div>
            <div>
              <Label>Monthly Limit (₹)</Label>
              <input type="number" min="0" placeholder="5000"
                value={budgetAmount}
                onKeyDown={e => ["e","E","+","-"].includes(e.key) && e.preventDefault()}
                onChange={e => setBudgetAmount(e.target.value)} style={s.input} />
            </div>
            <motion.button onClick={saveBudget} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={s.secBtn}>
              Save Budget
            </motion.button>
          </div>
        </motion.div>

        {/* Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={s.card}>
          <h2 style={s.cardTitle}>🎯 Saving Goal</h2>
          <p style={s.cardSub}>Set a target amount to save toward</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            <div>
              <Label>Goal Name</Label>
              <input placeholder="e.g. New Laptop, Vacation..." value={goalName}
                onChange={e => setGoalName(e.target.value)} style={s.input} />
            </div>
            <div>
              <Label>Target Amount (₹)</Label>
              <input type="number" min="0" placeholder="50000" value={goalAmount}
                onKeyDown={e => ["e","E","+","-"].includes(e.key) && e.preventDefault()}
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

function Label({ children }) {
  return <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</label>;
}
function Err({ msg }) {
  return msg ? <p style={{ color: "#f87171", fontSize: 12, margin: "4px 0 0" }}>⚠ {msg}</p> : null;
}

const s = {
  page: { padding: "32px 28px", color: "white", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 920, margin: "0 auto" },
  pageHeader: { marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 800, margin: "0 0 5px", letterSpacing: "-0.02em" },
  pageSub: { fontSize: 14, color: "#475569", margin: 0 },
  toast: { borderRadius: 12, padding: "13px 18px", marginBottom: 22, fontSize: 14, fontWeight: 600, border: "1px solid" },
  toastOk: { background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)", color: "#4ade80" },
  toastErr: { background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.25)", color: "#f87171" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "28px", marginBottom: 20 },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 4px", color: "white" },
  cardSub: { fontSize: 13, color: "#475569", margin: 0 },
  typeRow: { display: "flex", gap: 10, marginBottom: 24 },
  typeBtn: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px", borderRadius: 12, border: "1px solid", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" },
  typeBtnExpense: { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.35)", color: "#f87171" },
  typeBtnIncome: { background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.35)", color: "#4ade80" },
  typeBtnOff: { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)", color: "#334155" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  input: { width: "100%", padding: "12px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11, color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "all 0.2s", fontFamily: "inherit" },
  inputFocus: { borderColor: "rgba(99,102,241,0.45)", boxShadow: "0 0 0 3px rgba(99,102,241,0.1)", background: "rgba(99,102,241,0.05)" },
  inputErr: { borderColor: "rgba(239,68,68,0.4)", boxShadow: "0 0 0 3px rgba(239,68,68,0.07)" },
  prefix: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569", fontSize: 14, pointerEvents: "none" },
  goalHint: { color: "#22c55e", fontSize: 13, margin: "14px 0 0", display: "flex", alignItems: "center", gap: 6 },
  submitBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(99,102,241,0.3)" },
  secBtn: { width: "100%", padding: "12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" },
};

export default AddTransaction;
