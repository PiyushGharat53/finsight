import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

// ── Canvas: flowing financial data streams ─────────────────────────────────────
function DataStreamCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COLS = Math.floor(window.innerWidth / 28);
    const drops = Array.from({ length: COLS }, () => Math.random() * -100);
    const chars = "₹$€£¥0123456789.%+-×÷=∑∞▲▼◆●";
    const draw = () => {
      ctx.fillStyle = "rgba(4,2,16,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const progress = y / (canvas.height / 28);
        const alpha = Math.max(0, Math.min(0.15, progress * 0.035));
        ctx.fillStyle = `rgba(99,102,241,${alpha})`;
        ctx.font = "13px monospace";
        ctx.fillText(char, i * 28, y * 28);
        if (y * 28 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.4;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.55 }} />;
}

// ── Mouse parallax hook ────────────────────────────────────────────────────────
function useMouseParallax() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  useEffect(() => {
    const fn = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set((e.clientX - cx) / cx);
      mouseY.set((e.clientY - cy) / cy);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mouseX, mouseY]);

  return { springX, springY };
}

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          // ease out cubic
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

// ── Trust ticker ──────────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  "🔒 JWT encrypted",
  "🇮🇳 Built for India",
  "⚡ Real-time sync",
  "📊 AI-powered insights",
  "🎯 Goal tracking",
  "💸 ₹ native currency",
  "🛡️ Private by design",
  "🚀 Zero setup needed",
  "📱 Works everywhere",
  "✨ Always free",
];

function TrustTicker() {
  const doubled = [...TRUST_ITEMS, ...TRUST_ITEMS];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", position: "relative", zIndex: 10 }}>
      {/* fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(90deg,#040210,transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(270deg,#040210,transparent)", zIndex: 2, pointerEvents: "none" }} />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        style={{ display: "flex", gap: 48, whiteSpace: "nowrap", width: "max-content" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.28)", fontWeight: 600, letterSpacing: "0.02em" }}>{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      // Detect active section
      const sections = ["hero", "features", "how-it-works", "cta"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: scrolled ? "rgba(4,2,16,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div whileHover={{ rotate: 10, scale: 1.08 }} style={{ width: 38, height: 38, background: "linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </motion.div>
          <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.05em", background: "linear-gradient(135deg,#c7d2fe,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>FinSight</span>
        </div>
        {/* Nav links */}
        <div style={{ display: "flex", gap: 4 }}>
          {[["features", "Features"], ["how-it-works", "How it works"]].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 14px", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", borderRadius: 8, color: activeSection === id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", background: activeSection === id ? "rgba(255,255,255,0.06)" : "none", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <motion.button whileHover={{ color: "white" }}
            style={{ padding: "8px 18px", background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}>
            Sign In
          </motion.button>
        </Link>
        <Link to="/signup" style={{ textDecoration: "none" }}>
          <motion.button whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(99,102,241,0.5)" }} whileTap={{ scale: 0.97 }}
            style={{ padding: "8px 20px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "white", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
            Get Started
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Live animated dashboard mockup ─────────────────────────────────────────────
const MOCK_TRANSACTIONS = [
  { label: "Zomato Order",      cat: "Food",          amt: -349,  color: "#f87171", icon: "🍕" },
  { label: "Salary Credit",     cat: "Income",        amt: 52000, color: "#4ade80", icon: "💼" },
  { label: "Amazon Purchase",   cat: "Shopping",      amt: -1299, color: "#fb923c", icon: "📦" },
  { label: "Netflix Renewal",   cat: "Subscriptions", amt: -649,  color: "#a78bfa", icon: "🎬" },
  { label: "Electricity Bill",  cat: "Utilities",     amt: -870,  color: "#60a5fa", icon: "⚡" },
  { label: "Freelance Payment", cat: "Income",        amt: 8500,  color: "#4ade80", icon: "💻" },
];

const MOCK_BARS = [
  { month: "Aug", spend: 62, save: 38 },
  { month: "Sep", spend: 58, save: 42 },
  { month: "Oct", spend: 71, save: 29 },
  { month: "Nov", spend: 55, save: 45 },
  { month: "Dec", spend: 48, save: 52 },
  { month: "Jan", spend: 44, save: 56 },
];

function DashboardMockup() {
  const [visibleTx, setVisibleTx] = useState(0);
  const [animatedBars, setAnimatedBars] = useState(false);
  const [activeMockTab, setActiveMockTab] = useState("overview");

  useEffect(() => {
    const timers = MOCK_TRANSACTIONS.map((_, i) => setTimeout(() => setVisibleTx(i + 1), 600 + i * 320));
    setTimeout(() => setAnimatedBars(true), 400);
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "100%", maxWidth: 860, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", boxShadow: "0 80px 160px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.08), 0 0 120px rgba(99,102,241,0.08)", backdropFilter: "blur(20px)", position: "relative" }}>
      {/* Top shimmer */}
      <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(168,85,247,0.6),transparent)" }} />

      {/* Browser chrome */}
      <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#f87171","#fbbf24","#4ade80"].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 6, height: 24, marginInline: 12, display: "flex", alignItems: "center", paddingInline: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>finsight.app/dashboard</span>
        </div>
        {/* Mock tab bar */}
        <div style={{ display: "flex", gap: 2 }}>
          {["overview", "analytics"].map(tab => (
            <button key={tab} onClick={() => setActiveMockTab(tab)}
              style={{ padding: "3px 10px", fontSize: 10, fontWeight: 700, background: activeMockTab === tab ? "rgba(99,102,241,0.25)" : "none", border: "none", borderRadius: 5, color: activeMockTab === tab ? "#a5b4fc" : "rgba(255,255,255,0.2)", cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit", transition: "all 0.2s" }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard content */}
      <AnimatePresence mode="wait">
        {activeMockTab === "overview" ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
            {/* LEFT */}
            <div style={{ padding: "24px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                {[
                  { label: "This Month",  val: "₹14,220", sub: "spent",      color: "#f87171" },
                  { label: "Saved",       val: "₹8,780",  sub: "so far",     color: "#4ade80" },
                  { label: "Income",      val: "₹60,500", sub: "total",      color: "#818cf8" },
                  { label: "Budget Left", val: "61%",      sub: "remaining",  color: "#fb923c" },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                    style={{ padding: "12px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
                    <p style={{ margin: "0 0 4px", fontSize: 9.5, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.val}</p>
                    <p style={{ margin: 0, fontSize: 9.5, color: "rgba(255,255,255,0.25)" }}>{s.sub}</p>
                  </motion.div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>6-Month Spend vs Save</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                  {MOCK_BARS.map((b, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "flex-end" }}>
                        <motion.div initial={{ height: 0 }} animate={{ height: animatedBars ? `${b.spend * 0.7}px` : 0 }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }}
                          style={{ background: "rgba(248,113,113,0.5)", borderRadius: "4px 4px 0 0", width: "100%" }} />
                        <motion.div initial={{ height: 0 }} animate={{ height: animatedBars ? `${b.save * 0.7}px` : 0 }}
                          transition={{ delay: 0.6 + i * 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }}
                          style={{ background: "rgba(74,222,128,0.5)", borderRadius: "4px 4px 0 0", width: "100%" }} />
                      </div>
                      <span style={{ fontSize: 8.5, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>{b.month}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                  {[["#f87171","Spending"],["#4ade80","Savings"]].map(([c,l]) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c, opacity: 0.7 }} />
                      <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)" }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* RIGHT */}
            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recent Transactions</p>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 5, height: 5, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 6px #4ade80" }} />
                  <span style={{ fontSize: 9.5, color: "#4ade80", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
                </motion.div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <AnimatePresence>
                  {MOCK_TRANSACTIONS.slice(0, visibleTx).map((tx) => (
                    <motion.div key={tx.label}
                      initial={{ opacity: 0, x: 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{ fontSize: 16, flexShrink: 0 }}>{tx.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</p>
                        <p style={{ margin: 0, fontSize: 9.5, color: "rgba(255,255,255,0.3)" }}>{tx.cat}</p>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 800, color: tx.color, flexShrink: 0, fontFamily: "monospace" }}>
                        {tx.amt > 0 ? "+" : ""}₹{Math.abs(tx.amt).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {visibleTx < MOCK_TRANSACTIONS.length && (
                  <div style={{ padding: "9px 12px", borderRadius: 10, background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.05)" }}>
                    <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginBottom: 4, width: "60%" }} />
                        <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.04)", width: "35%" }} />
                      </div>
                      <div style={{ height: 8, width: 40, borderRadius: 4, background: "rgba(255,255,255,0.06)" }} />
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          // Analytics mock tab
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{ padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Donut chart mock */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: 16 }}>
                <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Expense Breakdown</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Fake donut */}
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="75 113" strokeDashoffset="28" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#a855f7" strokeWidth="12" strokeDasharray="40 148" strokeDashoffset="-47" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="25 163" strokeDashoffset="-87" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#f87171" strokeWidth="12" strokeDasharray="20 168" strokeDashoffset="-112" strokeLinecap="round" />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[["#6366f1","Rent","40%"],["#a855f7","Food","22%"],["#22c55e","Transport","14%"],["#f87171","Other","24%"]].map(([c,l,p]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{l}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: c, marginLeft: "auto" }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Savings trend */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 14, padding: 16 }}>
                <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Savings Trend</p>
                <svg width="100%" height="80" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,70 L33,55 L66,50 L100,40 L133,30 L166,22 L200,15" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M0,70 L33,55 L66,50 L100,40 L133,30 L166,22 L200,15 L200,80 L0,80 Z" fill="url(#sg)" />
                  {[[0,70],[100,40],[200,15]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#6366f1" />
                  ))}
                </svg>
                <p style={{ margin: "6px 0 0", fontSize: 9.5, color: "rgba(255,255,255,0.25)" }}>+18% vs last month</p>
              </div>
            </div>
            {/* AI insight row */}
            <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#4f46e5,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                💡 AI: Your rent is 40% of expenses. Consider shifting 5% to savings goal.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom AI bar */}
      <div style={{ padding: "14px 24px", background: "rgba(99,102,241,0.06)", borderTop: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#4f46e5,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
          style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
          💡 AI Insight: You spent 18% more on food this month. Want me to suggest a budget adjustment?
        </motion.p>
        <motion.div style={{ marginLeft: "auto", flexShrink: 0 }} animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}>
          <div style={{ width: 2, height: 14, background: "#818cf8", borderRadius: 1 }} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Floating chart decoration ──────────────────────────────────────────────────
function FloatingChart({ style, parallaxX = 0, parallaxY = 0 }) {
  const points = "20,80 60,55 100,65 140,30 180,45 220,15 260,35 300,20";
  return (
    <motion.div style={{ position: "absolute", pointerEvents: "none", ...style, x: parallaxX, y: parallaxY }}
      animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <svg width="320" height="100" viewBox="0 0 320 100" fill="none" style={{ opacity: 0.08 }}>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={"M" + points.replace(/ /g, " L")} stroke="url(#cg)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={"M20,80 " + points.slice(3) + " L300,100 L20,100 Z"} fill="url(#fg)" />
      </svg>
    </motion.div>
  );
}

// ── Stats section ──────────────────────────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: 2400000, prefix: "₹", suffix: "Cr+", label: "tracked by users", color: "#818cf8" },
    { value: 14000, prefix: "", suffix: "+", label: "active users", color: "#4ade80" },
    { value: 98, prefix: "", suffix: "%", label: "data accuracy", color: "#fb923c" },
    { value: 0, prefix: "₹", suffix: "", label: "cost forever", color: "#a78bfa" },
  ];

  return (
    <section style={{ position: "relative", zIndex: 10, padding: "0 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.05)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "32px 24px", background: "rgba(6,4,21,0.8)", textAlign: "center" }}>
              <p style={{ margin: "0 0 6px", fontSize: 32, fontWeight: 900, letterSpacing: "-0.05em", color: s.color }}>
                {s.prefix}<AnimatedCounter target={s.value} suffix={s.suffix} />
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
    color: "#6366f1", tag: "ANALYTICS", title: "Smart Analytics",
    desc: "Visual charts reveal your spending DNA — where every rupee flows, every pattern emerges.",
    stat: "360°", statLabel: "Financial view",
  },
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
    color: "#a855f7", tag: "REAL-TIME", title: "Instant Tracking",
    desc: "Every transaction captured and categorized the moment it happens. Zero lag. Full clarity.",
    stat: "<1s", statLabel: "Capture speed",
  },
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
    color: "#22c55e", tag: "GOALS", title: "Savings Goals",
    desc: "Set targets, visualize milestones, and watch your wealth compound toward the life you want.",
    stat: "Track", statLabel: "Every goal",
  },
  {
    icon: (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>),
    color: "#ec4899", tag: "AI POWERED", title: "AI Assistant",
    desc: "Your personal CFO in your pocket. Asks the right questions, finds the right answers.",
    stat: "24/7", statLabel: "AI guidance",
  },
];

const colorRgb = (hex) => {
  const m = { "#6366f1": "99,102,241", "#a855f7": "168,85,247", "#22c55e": "34,197,94", "#ec4899": "236,72,153" };
  return m[hex] || "99,102,241";
};

const STEPS = [
  { n: "01", title: "Add Your Transactions", desc: "Log income and expenses manually in seconds. Clean, fast, zero friction.", icon: "✏️" },
  { n: "02", title: "AI Categorizes Everything", desc: "Every entry is instantly sorted — food, travel, EMIs, subscriptions, income. No manual tagging.", icon: "🤖" },
  { n: "03", title: "See Your Whole Picture", desc: "Your dashboard surfaces trends, budget health, and insights automatically. Just open and understand.", icon: "📊" },
];

// ── Main ───────────────────────────────────────────────────────────────────────
function Welcome() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { springX, springY } = useMouseParallax();

  // Auto-cycle features every 3.5s, pause on hover
  useEffect(() => {
    if (isPaused) return;
    const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3500);
    return () => clearInterval(t);
  }, [isPaused]);

  const parallaxLeft = useTransform(springX, [-1, 1], [-18, 18]);
  const parallaxRight = useTransform(springX, [-1, 1], [18, -18]);
  const parallaxY1 = useTransform(springY, [-1, 1], [-10, 10]);
  const parallaxY2 = useTransform(springY, [-1, 1], [10, -10]);

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", background: "linear-gradient(160deg, #040210 0%, #06041a 30%, #09061f 60%, #050214 100%)", fontFamily: "'SF Pro Display','Helvetica Neue',system-ui,sans-serif", color: "white" }}>
      <DataStreamCanvas />

      {/* Ambient orbs — react to mouse */}
      {[
        { w:700, h:700, top:"-15%", left:"-10%", c:"rgba(99,102,241,0.15)",  dur:20, px: parallaxLeft,  py: parallaxY1 },
        { w:500, h:500, top:"40%",  left:"65%",  c:"rgba(168,85,247,0.12)", dur:25, px: parallaxRight, py: parallaxY2 },
        { w:400, h:400, top:"70%",  left:"-5%",  c:"rgba(34,197,94,0.08)",  dur:18, px: parallaxLeft,  py: parallaxY2 },
        { w:300, h:300, top:"20%",  left:"75%",  c:"rgba(236,72,153,0.07)", dur:22, px: parallaxRight, py: parallaxY1 },
      ].map((o, i) => (
        <motion.div key={i} style={{ position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0, width: o.w, height: o.h, top: o.top, left: o.left, background: `radial-gradient(circle,${o.c} 0%,transparent 70%)`, x: o.px, y: o.py }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", position: "relative", zIndex: 10, textAlign: "center" }}>
        <FloatingChart style={{ top: "18%", left: "4%" }} parallaxX={parallaxLeft} parallaxY={parallaxY1} />
        <FloatingChart style={{ top: "22%", right: "3%", transform: "scaleX(-1)" }} parallaxX={parallaxRight} parallaxY={parallaxY2} />

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.28)", borderRadius: 100, padding: "7px 20px", marginBottom: 36 }}>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI-Powered Finance Intelligence</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.0, margin: "0 0 8px", maxWidth: 900 }}>
          Your money,
        </motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1.0, margin: "0 0 32px", background: "linear-gradient(135deg, #818cf8 0%, #c084fc 45%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          finally obedient.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }}
          style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.38)", lineHeight: 1.75, margin: "0 0 52px", maxWidth: 560 }}>
          Track expenses, set goals, and unlock AI-powered insights —<br />all in one beautiful dashboard built for you.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.68 }}
          style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, boxShadow: "0 20px 60px rgba(99,102,241,0.6)" }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "17px 38px", fontSize: 15.5, fontWeight: 800, fontFamily: "inherit", background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #9333ea 100%)", color: "white", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 10px 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
              Get Started — It's Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </motion.button>
          </Link>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <motion.button whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.28)" }} whileTap={{ scale: 0.97 }}
              style={{ padding: "17px 38px", fontSize: 15.5, fontWeight: 700, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 14, cursor: "pointer", transition: "all 0.2s" }}>
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em", marginBottom: 72 }}>
          No credit card required &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; Secure & private
        </motion.p>

        <DashboardMockup />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} style={{ marginTop: 60 }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ TRUST TICKER ══════════════════════════════════════════════════════ */}
      <TrustTicker />

      {/* ══ STATS ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px 24px 0" }}>
        <StatsSection />
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>Everything you need</p>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
              Built different.{" "}
              <span style={{ background: "linear-gradient(135deg,#818cf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Priced free.</span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", margin: 0, maxWidth: 480, marginInline: "auto" }}>
              Four core pillars that give you total mastery over your financial life.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}
            onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FEATURES.map((f, i) => {
                const rgb = colorRgb(f.color);
                const isActive = activeFeature === i;
                return (
                  <motion.div key={i} onClick={() => setActiveFeature(i)} whileHover={{ x: 4 }}
                    initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    style={{ padding: "20px 24px", borderRadius: 16, cursor: "pointer", border: isActive ? `1px solid ${f.color}40` : "1px solid rgba(255,255,255,0.06)", background: isActive ? `rgba(${rgb},0.08)` : "rgba(255,255,255,0.02)", transition: "all 0.25s", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, background: `rgba(${rgb},0.15)`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: f.color }}>
                      {f.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: f.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{f.tag}</p>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: isActive ? "white" : "rgba(255,255,255,0.55)" }}>{f.title}</p>
                    </div>
                    {isActive && (
                      <div style={{ marginLeft: "auto", flexShrink: 0, color: f.color }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                    )}
                    {/* Auto-progress bar */}
                    {isActive && !isPaused && (
                      <motion.div style={{ position: "absolute", bottom: 0, left: 0, height: 2, background: f.color, borderRadius: 1 }}
                        initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "linear" }} />
                    )}
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${FEATURES[activeFeature].color}25`, borderRadius: 22, padding: "44px 40px", boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 60px rgba(${colorRgb(FEATURES[activeFeature].color)},0.12)`, position: "sticky", top: 100 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, marginBottom: 28, background: `rgba(${colorRgb(FEATURES[activeFeature].color)},0.15)`, border: `1px solid ${FEATURES[activeFeature].color}35`, display: "flex", alignItems: "center", justifyContent: "center", color: FEATURES[activeFeature].color }}>
                  {React.cloneElement(FEATURES[activeFeature].icon, { width: 30, height: 30 })}
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: FEATURES[activeFeature].color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{FEATURES[activeFeature].tag}</p>
                <h3 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>{FEATURES[activeFeature].title}</h3>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 36px" }}>{FEATURES[activeFeature].desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 24px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", color: FEATURES[activeFeature].color }}>{FEATURES[activeFeature].stat}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{FEATURES[activeFeature].statLabel}</p>
                  </div>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      style={{ padding: "10px 22px", background: FEATURES[activeFeature].color, color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Try it →
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>How it works</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", margin: 0 }}>
              Up and running in{" "}
              <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>60 seconds.</span>
            </h2>
          </motion.div>

          <div style={{ position: "relative" }}>
            {/* Connecting line */}
            <div style={{ position: "absolute", left: 59, top: 48, bottom: 48, width: 2, background: "linear-gradient(180deg, rgba(99,102,241,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4))", zIndex: 0 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {STEPS.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                  style={{ display: "flex", gap: 28, alignItems: "flex-start", padding: "28px 32px", borderRadius: 18, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
                  {/* Step number circle */}
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                    <span style={{ fontSize: 22 }}>{step.icon}</span>
                    <div style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "white" }}>
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                    <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section id="cta" style={{ position: "relative", zIndex: 10, padding: "0 24px 100px" }}>
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 780, margin: "0 auto", textAlign: "center", padding: "72px 48px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: 28, boxShadow: "0 0 120px rgba(99,102,241,0.12)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(168,85,247,0.7), transparent)" }} />
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ width: 60, height: 60, margin: "0 auto 28px", background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(99,102,241,0.5)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </motion.div>
          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
            Start for free.{" "}
            <span style={{ background: "linear-gradient(135deg,#818cf8,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Stay forever.</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", margin: "0 0 44px", lineHeight: 1.65 }}>
            Sign up, add your first transaction, and see your financial life get clearer immediately.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(99,102,241,0.65)" }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "17px 40px", fontSize: 16, fontWeight: 800, fontFamily: "inherit", background: "linear-gradient(135deg, #4338ca, #6d28d9, #9333ea)", color: "white", border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 10px 36px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                Create Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "17px 40px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, cursor: "pointer" }}>
                Sign In Instead
              </motion.button>
            </Link>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 24, letterSpacing: "0.03em" }}>
            🔒 JWT encrypted &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Your data stays yours
          </p>
        </motion.div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer style={{ position: "relative", zIndex: 10, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "-0.02em" }}>FinSight</span>
        </div>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.18)", margin: 0 }}>
          Built with ❤️ · Secure & private · Your data never leaves your account
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Security"].map(l => (
            <span key={l} style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", cursor: "default" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default Welcome;