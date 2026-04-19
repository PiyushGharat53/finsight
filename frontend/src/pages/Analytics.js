import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart, ReferenceLine
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

const PALETTE = [
  "#6366f1","#22c55e","#f59e0b","#ef4444","#a855f7",
  "#3b82f6","#ec4899","#14b8a6","#f97316","#84cc16",
  "#06b6d4","#8b5cf6","#e11d48","#10b981","#fbbf24"
];

const fmt = (n) => `₹${Math.abs(n || 0).toLocaleString("en-IN")}`;

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Custom tooltip for charts
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--dropdown-bg)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      {label && <p style={{ color: "#94a3b8", margin: "0 0 6px", fontWeight: 600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0", fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div style={{ background: "var(--dropdown-bg)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      <p style={{ color: p.payload.fill, margin: 0, fontWeight: 700 }}>{p.name}</p>
      <p style={{ color: "var(--text)", margin: "4px 0 0", fontWeight: 600 }}>{fmt(p.value)}</p>
      <p style={{ color: "#64748b", margin: "2px 0 0", fontSize: 12 }}>{p.payload.pct}% of expenses</p>
    </div>
  );
}

function Analytics() {
  const [allTx, setAllTx] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pie filter
  const [pieYear, setPieYear] = useState("all");
  const [pieMonth, setPieMonth] = useState("all");

  // Trend view
  const [trendYear, setTrendYear] = useState("all");

  useEffect(() => {
    setLoading(true);
    fetch("https://finsight-erku.onrender.com/api/transactions/dashboard", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => { if (res.status === 401) { localStorage.removeItem("token"); window.location.reload(); } return res.json(); })
      .then(d => { if (d?.allTransactions) setAllTx(d.allTransactions); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Derive available years from data
  const availableYears = useMemo(() => {
    const years = [...new Set(allTx.map(t => new Date(t.date).getFullYear()))].sort();
    return years;
  }, [allTx]);

  // ─── PIE DATA ────────────────────────────────────────────
  const pieData = useMemo(() => {
    let filtered = allTx.filter(t => t.type === "expense");
    if (pieYear !== "all") filtered = filtered.filter(t => new Date(t.date).getFullYear() === Number(pieYear));
    if (pieMonth !== "all") filtered = filtered.filter(t => new Date(t.date).getMonth() === Number(pieMonth));

    const map = {};
    filtered.forEach(t => {
      const cat = t.category?.toLowerCase() || "other";
      map[cat] = (map[cat] || 0) + t.amount;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        pct: total > 0 ? ((value / total) * 100).toFixed(1) : 0,
      }));
  }, [allTx, pieYear, pieMonth]);

  const pieTotalExpense = pieData.reduce((a, b) => a + b.value, 0);

  // ─── MONTHLY TREND (per-month, NOT cumulative) ────────────────────────────
  const trendData = useMemo(() => {
    let filtered = allTx;
    if (trendYear !== "all") filtered = filtered.filter(t => new Date(t.date).getFullYear() === Number(trendYear));

    const map = {};
    filtered.forEach(t => {
      const d = new Date(t.date);
      const y = d.getFullYear();
      const m = d.getMonth();
      const key = `${y}-${String(m).padStart(2,"0")}`;
      if (!map[key]) map[key] = { key, year: y, month: m, label: `${MONTH_NAMES[m]} ${trendYear === "all" ? y : ""}`.trim(), income: 0, expense: 0 };
      if (t.type === "income") map[key].income += t.amount;
      else map[key].expense += t.amount;
    });

    return Object.values(map)
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
      .map(d => ({ ...d, saving: d.income - d.expense }));
  }, [allTx, trendYear]);

  // ─── CUMULATIVE BALANCE (running total over time) ──────────────────────────
  const balanceData = useMemo(() => {
    let running = 0;
    return trendData.map(d => {
      running += d.saving;
      return { label: d.label, balance: running };
    });
  }, [trendData]);

  // ─── SMART INSIGHTS ──────────────────────────────────────
  const insights = useMemo(() => {
    const expenses = allTx.filter(t => t.type === "expense");
    const incomes = allTx.filter(t => t.type === "income");
    const totalExp = expenses.reduce((a, t) => a + t.amount, 0);
    const totalInc = incomes.reduce((a, t) => a + t.amount, 0);

    const catMap = {};
    expenses.forEach(t => { const c = t.category?.toLowerCase() || "other"; catMap[c] = (catMap[c] || 0) + t.amount; });
    const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

    const now = new Date();
    const thisMonth = expenses.filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = expenses.filter(t => { const d = new Date(t.date); return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear(); });
    const thisTotal = thisMonth.reduce((a, t) => a + t.amount, 0);
    const lastTotal = lastMonth.reduce((a, t) => a + t.amount, 0);
    const spendChange = lastTotal > 0 ? (((thisTotal - lastTotal) / lastTotal) * 100).toFixed(1) : null;

    const avgMonthlyExp = trendData.length > 0 ? (totalExp / trendData.length).toFixed(0) : 0;
    const savingRate = totalInc > 0 ? (((totalInc - totalExp) / totalInc) * 100).toFixed(1) : 0;

    const res = [];
    if (topCat) res.push({ icon: "🔥", label: "Top expense category", value: `${topCat[0].charAt(0).toUpperCase()+topCat[0].slice(1)} — ${fmt(topCat[1])} total`, color: "#f97316" });
    res.push({ icon: "📊", label: "Overall saving rate", value: `${savingRate}%${Number(savingRate) >= 20 ? " — Great!" : Number(savingRate) >= 0 ? " — Healthy" : " — Overspending!"}`, color: Number(savingRate) >= 0 ? "#22c55e" : "#ef4444" });
    res.push({ icon: "📅", label: "Avg. monthly expense", value: fmt(Number(avgMonthlyExp)), color: "#818cf8" });
    if (spendChange !== null) res.push({ icon: spendChange > 0 ? "📈" : "📉", label: "vs last month", value: `${Math.abs(spendChange)}% ${spendChange > 0 ? "more" : "less"} spending this month`, color: spendChange > 0 ? "#ef4444" : "#22c55e" });
    res.push({ icon: "💰", label: "Total income tracked", value: fmt(totalInc), color: "#22c55e" });
    res.push({ icon: "💸", label: "Total expenses tracked", value: fmt(totalExp), color: "#ef4444" });
    return res;
  }, [allTx, trendData]);

  // ─── TOP CATEGORIES BAR DATA ──────────────────────────────
  const topCatBar = useMemo(() => {
    const map = {};
    allTx.filter(t => t.type === "expense").forEach(t => {
      const c = t.category?.toLowerCase() || "other";
      map[c] = (map[c] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.charAt(0).toUpperCase()+name.slice(1), value }));
  }, [allTx]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", flexDirection: "column", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,0.2)", borderTop: "3px solid #6366f1", borderRadius: "50%" }} />
      <p style={{ color: "#334155", fontSize: 14, fontFamily: "inherit" }}>Loading analytics...</p>
    </div>
  );

  if (allTx.length === 0) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 52 }}>📊</div>
      <p style={{ color: "var(--text)", fontSize: 18, fontWeight: 700 }}>No data yet</p>
      <p style={{ color: "#475569", fontSize: 14 }}>Add some transactions to see your analytics</p>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Analytics</h1>
          <p style={s.pageSub}>{allTx.length} transactions across {availableYears.length} year{availableYears.length !== 1 ? "s" : ""}</p>
        </div>
      </motion.div>

      {/* ─── SMART INSIGHTS ROW ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={s.insightGrid}>
        {insights.map((ins, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}
            whileHover={{ y: -3 }} style={s.insightCard}>
            <span style={{ fontSize: 22 }}>{ins.icon}</span>
            <div>
              <p style={s.insightLabel}>{ins.label}</p>
              <p style={{ ...s.insightValue, color: ins.color }}>{ins.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── PIE CHART ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h2 style={s.cardTitle}>Expense Breakdown</h2>
            <p style={s.cardSub}>Where your money goes</p>
          </div>
          <div style={s.filterRow}>
            <select value={pieYear} onChange={e => { setPieYear(e.target.value); setPieMonth("all"); }} style={s.select}>
              <option value="all">All Years</option>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {pieYear !== "all" && (
              <select value={pieMonth} onChange={e => setPieMonth(e.target.value)} style={s.select}>
                <option value="all">All Months</option>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            )}
          </div>
        </div>

        {pieData.length === 0 ? (
          <div style={s.empty}>No expense data for this period</div>
        ) : (
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 300px" }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={110} innerRadius={55}
                    paddingAngle={2} strokeWidth={0}>
                    {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom legend */}
            <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Total: {fmt(pieTotalExpense)}</p>
              {pieData.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{fmt(d.value)}</span>
                  <span style={{ fontSize: 11, color: "#475569", minWidth: 36, textAlign: "right" }}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ─── MONTHLY INCOME vs EXPENSE BAR CHART ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h2 style={s.cardTitle}>Monthly Income vs Expense</h2>
            <p style={s.cardSub}>Each month's actual numbers — not cumulative</p>
          </div>
          <select value={trendYear} onChange={e => setTrendYear(e.target.value)} style={s.select}>
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {trendData.length === 0 ? <div style={s.empty}>No data for this period</div> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ─── MONTHLY SAVING TREND ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h2 style={s.cardTitle}>Monthly Savings</h2>
            <p style={s.cardSub}>Net savings per month (Income − Expense)</p>
          </div>
        </div>
        {trendData.length === 0 ? <div style={s.empty}>No data</div> : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              <Bar dataKey="saving" name="Net Saving" radius={[4,4,0,0]}
                fill="#6366f1"
                label={false}>
                {trendData.map((d, i) => (
                  <Cell key={i} fill={d.saving >= 0 ? "#6366f1" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
        <p style={{ color: "#475569", fontSize: 12, marginTop: 8 }}>
          Purple = positive savings &nbsp;•&nbsp; Red = spent more than earned that month
        </p>
      </motion.div>

      {/* ─── CUMULATIVE BALANCE ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h2 style={s.cardTitle}>Running Balance</h2>
            <p style={s.cardSub}>How your total savings have grown over time</p>
          </div>
        </div>
        {balanceData.length === 0 ? <div style={s.empty}>No data</div> : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={balanceData}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              <Area type="monotone" dataKey="balance" name="Balance" stroke="#6366f1" strokeWidth={2.5} fill="url(#balGrad)" dot={{ fill: "#6366f1", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ─── TOP CATEGORIES BAR ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={s.card}>
        <div style={s.cardHeader}>
          <div>
            <h2 style={s.cardTitle}>Top Expense Categories</h2>
            <p style={s.cardSub}>All-time biggest spending areas</p>
          </div>
        </div>
        {topCatBar.length === 0 ? <div style={s.empty}>No expense data</div> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCatBar} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 13 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" name="Total Spent" radius={[0,4,4,0]}>
                {topCatBar.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}

const s = {
  page: { padding: "32px 28px", color: "var(--text)", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 1040, margin: "0 auto" },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.03em" },
  pageSub: { fontSize: 14, color: "#475569", margin: 0 },
  insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 20 },
  insightCard: { background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "default" },
  insightLabel: { fontSize: 11, color: "#64748b", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 },
  insightValue: { fontSize: 14, fontWeight: 700, margin: 0 },
  card: { background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 18, padding: "26px 28px", marginBottom: 18 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.01em" },
  cardSub: { fontSize: 13, color: "#475569", margin: 0 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  select: { padding: "8px 14px", background: "var(--dropdown-bg)", border: "1px solid var(--border-strong)", borderRadius: 9, color: "var(--text)", fontSize: 13, outline: "none", cursor: "pointer", colorScheme: "dark" },
  empty: { color: "#334155", textAlign: "center", padding: "40px 0", fontSize: 14 },
};

export default Analytics;
