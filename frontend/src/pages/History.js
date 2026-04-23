import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Custom dropdown to avoid native OS white popup inside modals
function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={cs.trigger}>
        <span style={{ color: "var(--text)", fontSize: 14 }}>{selected ? selected.label : ""}</span>
        <span style={{ color: "#64748b", fontSize: 11, marginLeft: "auto" }}>{open ? "▲" : "▼"}</span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={cs.dropdown}
          >
            {options.map(o => (
              <div
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  ...cs.option,
                  background: o.value === value ? "rgba(99,102,241,0.18)" : "transparent",
                  color: o.value === value ? "#818cf8" : "var(--text)",
                }}
                onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.background = "transparent"; }}
              >
                {o.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const cs = {
  trigger: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px",
    background: "var(--surface-hover)",
    border: "1px solid var(--border-strong)",
    borderRadius: 10,
    cursor: "pointer",
    userSelect: "none",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
    background: "var(--panel-bg, #1e1e2e)",
    border: "1px solid var(--border-strong)",
    borderRadius: 10,
    zIndex: 9999,
    overflow: "hidden",
    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
    maxHeight: 220,
    overflowY: "auto",
  },
  option: {
    padding: "10px 14px",
    fontSize: 14,
    cursor: "pointer",
    transition: "background 0.1s",
  },
};

function History() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", type: "" });

  const showToast = (text, type = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: "", type: "" }), 3000);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://finsight-erku.onrender.com/api/transactions/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem("token"); window.location.reload(); return; }
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch { setTransactions([]); }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
    window.addEventListener("transactionAdded", fetchHistory);
    return () => window.removeEventListener("transactionAdded", fetchHistory);
  }, []);

  const handleDelete = async () => {
    if (!deleteTx) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://finsight-erku.onrender.com/api/transactions/${deleteTx._id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("🗑️ Transaction deleted");
        setDeleteTx(null);
        fetchHistory();
        window.dispatchEvent(new Event("transactionAdded"));
      }
    } catch { showToast("❌ Failed to delete", "error"); }
    setActionLoading(false);
  };

  const handleEdit = async () => {
    if (!editTx) return;
    if (!editForm.amount || Number(editForm.amount) <= 0) { showToast("⚠️ Enter valid amount", "error"); return; }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://finsight-erku.onrender.com/api/transactions/${editTx._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, amount: Number(editForm.amount), date: new Date(editForm.date).toISOString() }),
      });
      if (res.ok) {
        showToast("✅ Transaction updated");
        setEditTx(null);
        fetchHistory();
        window.dispatchEvent(new Event("transactionAdded"));
      }
    } catch { showToast("❌ Failed to update", "error"); }
    setActionLoading(false);
  };

  const openEdit = (tx) => {
    setEditTx(tx);
    setEditForm({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      date: new Date(tx.date).toISOString().split("T")[0],
      note: tx.note || "",
    });
  };

  const filtered = transactions.filter(t => {
    const matchSearch = search === "" || t.category.toLowerCase().includes(search.toLowerCase()) || (t.note || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    const matchCat = catFilter === "all" || t.category.toLowerCase() === catFilter;
    return matchSearch && matchType && matchCat;
  });

  const totalIncome = filtered.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);

  const categoryOptions = [
    ...new Set(transactions.map(t => t.category.toLowerCase()))
  ].sort().map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));

  const typeOptions = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
  ];

  return (
    <div style={s.page}>
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={s.pageTitle}>
        📜 History
      </motion.h1>

      <AnimatePresence>
        {toast.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ ...s.toast, ...(toast.type === "error" ? s.toastErr : s.toastOk) }}>
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={s.filters}>
        <div style={{ position: "relative", flex: 2, minWidth: 180 }}>
          <span style={s.searchIcon}>🔍</span>
          <input placeholder="Search by category or note..." value={search}
            onChange={e => setSearch(e.target.value)} style={s.searchInput} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={s.select}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={s.select}>
          <option value="all">All Categories</option>
          {[...new Set(transactions.map(t => t.category.toLowerCase()))].sort().map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </motion.div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.summaryBar}>
          <span style={s.summaryItem}>{filtered.length} transactions</span>
          <span style={{ ...s.summaryItem, color: "#22c55e" }}>+₹{totalIncome.toLocaleString()}</span>
          <span style={{ ...s.summaryItem, color: "#ef4444" }}>-₹{totalExpense.toLocaleString()}</span>
          <span style={{ ...s.summaryItem, color: "#818cf8" }}>Net: ₹{(totalIncome - totalExpense).toLocaleString()}</span>
        </motion.div>
      )}

      {/* Transaction list */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: 36, height: 36, border: "3px solid rgba(99,102,241,0.3)", borderTop: "3px solid #6366f1", borderRadius: "50%" }} />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={s.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ color: "#64748b", fontSize: 16 }}>{transactions.length === 0 ? "No transactions yet. Add your first one!" : "No results match your filters."}</p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AnimatePresence>
            {filtered.map((t, i) => (
              <motion.div key={t._id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.005, background: "var(--surface-hover)" }}
                style={s.txCard}>
                <div style={{ ...s.typeBadge, background: t.type === "income" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", borderColor: t.type === "income" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>
                  <span style={{ color: t.type === "income" ? "#4ade80" : "#f87171", fontSize: 12, fontWeight: 700 }}>
                    {t.type === "income" ? "↑" : "↓"} {t.type.toUpperCase()}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={s.txCat}>{t.category.charAt(0).toUpperCase() + t.category.slice(1)}</p>
                  {t.note && <p style={s.txNote}>{t.note}</p>}
                  <p style={s.txDate}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>

                <span style={{ ...s.txAmount, color: t.type === "income" ? "#22c55e" : "#ef4444" }}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </span>

                <div style={s.actionBtns}>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(t)} style={s.editBtn} title="Edit">✏️</motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDeleteTx(t)} style={s.deleteBtn} title="Delete">🗑️</motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editTx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.overlay} onClick={() => setEditTx(null)}>
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()} style={s.modal}>
              <h3 style={s.modalTitle}>✏️ Edit Transaction</h3>

              <div style={s.modalForm}>
                <label style={s.label}>Type</label>
                <CustomSelect
                  value={editForm.type}
                  onChange={val => setEditForm(f => ({ ...f, type: val }))}
                  options={typeOptions}
                />

                <label style={s.label}>Amount (₹)</label>
                <input type="number" min="0" value={editForm.amount}
                  onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} style={s.modalInput} />

                <label style={s.label}>Category</label>
                <CustomSelect
                  value={editForm.category}
                  onChange={val => setEditForm(f => ({ ...f, category: val }))}
                  options={categoryOptions}
                />

                <label style={s.label}>Date</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={{ ...s.modalInput, colorScheme: "dark" }} />

                <label style={s.label}>Note</label>
                <input placeholder="Optional note..." value={editForm.note} onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))} style={s.modalInput} />
              </div>

              <div style={s.modalBtns}>
                <button onClick={() => setEditTx(null)} style={s.cancelBtn}>Cancel</button>
                <motion.button onClick={handleEdit} disabled={actionLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={s.confirmBtn}>
                  {actionLoading ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTx && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={s.overlay} onClick={() => setDeleteTx(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} style={{ ...s.modal, maxWidth: 380 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🗑️</div>
                <h3 style={s.modalTitle}>Delete Transaction?</h3>
                <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
                  This will permanently delete <strong style={{ color: "var(--text)" }}>₹{deleteTx.amount} ({deleteTx.category})</strong>. This action cannot be undone.
                </p>
              </div>
              <div style={s.modalBtns}>
                <button onClick={() => setDeleteTx(null)} style={s.cancelBtn}>Cancel</button>
                <motion.button onClick={handleDelete} disabled={actionLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ ...s.confirmBtn, background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                  {actionLoading ? "Deleting..." : "Yes, Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  page: { padding: "32px 24px", color: "var(--text)", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 900, margin: "0 auto" },
  pageTitle: { fontSize: 26, fontWeight: 800, margin: "0 0 24px", letterSpacing: "-0.02em" },
  toast: { borderRadius: 12, padding: "12px 18px", marginBottom: 16, fontSize: 14, fontWeight: 600 },
  toastOk: { background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" },
  toastErr: { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" },
  filters: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" },
  searchInput: { width: "100%", padding: "11px 14px 11px 36px", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 10, color: "var(--text)", fontSize: 14, outline: "none", boxSizing: "border-box" },
  select: { padding: "11px 14px", background: "var(--dropdown-bg)", border: "1px solid var(--border-strong)", borderRadius: 10, color: "var(--text)", fontSize: 14, outline: "none", cursor: "pointer", minWidth: 130, colorScheme: "dark", WebkitAppearance: "none", appearance: "none" },
  summaryBar: { display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 16px", background: "var(--surface)", borderRadius: 12, marginBottom: 16 },
  summaryItem: { fontSize: 13, fontWeight: 600, color: "#94a3b8" },
  empty: { textAlign: "center", padding: "60px 20px" },
  txCard: { display: "flex", alignItems: "center", gap: 14, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "14px 18px", transition: "all 0.2s" },
  typeBadge: { padding: "5px 10px", borderRadius: 8, border: "1px solid", flexShrink: 0 },
  txCat: { fontSize: 15, fontWeight: 600, margin: 0, color: "var(--text)" },
  txNote: { fontSize: 12, color: "#64748b", margin: "2px 0 0" },
  txDate: { fontSize: 12, color: "#475569", margin: "3px 0 0" },
  txAmount: { fontSize: 16, fontWeight: 800, flexShrink: 0, letterSpacing: "-0.01em" },
  actionBtns: { display: "flex", gap: 6, flexShrink: 0 },
  editBtn: { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, cursor: "pointer", padding: "6px 10px", fontSize: 14 },
  deleteBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, cursor: "pointer", padding: "6px 10px", fontSize: 14 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  modal: { background: "var(--panel-bg)", border: "1px solid var(--border-strong)", borderRadius: 20, padding: "32px", maxWidth: 480, width: "100%", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" },
  modalTitle: { fontSize: 20, fontWeight: 700, color: "var(--text)", margin: "0 0 20px", textAlign: "center" },
  modalForm: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 },
  modalInput: { padding: "10px 14px", background: "var(--surface-hover)", border: "1px solid var(--border-strong)", borderRadius: 10, color: "var(--text)", fontSize: 14, outline: "none", colorScheme: "dark", fontFamily: "inherit" },
  modalBtns: { display: "flex", gap: 10 },
  cancelBtn: { flex: 1, padding: "12px", background: "var(--surface-hover)", border: "1px solid var(--border-strong)", borderRadius: 10, color: "var(--text)", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  confirmBtn: { flex: 1, padding: "12px", background: "linear-gradient(135deg, #6366f1, #a855f7)", border: "none", borderRadius: 10, color: "var(--text)", cursor: "pointer", fontSize: 14, fontWeight: 700 },
  label: { fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" },
};

export default History;