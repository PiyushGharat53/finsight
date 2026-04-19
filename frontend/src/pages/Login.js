import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Validation ────────────────────────────────────────────────────────────────
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim()) &&
  !email.trim().startsWith("@") &&
  email.trim().split("@")[1]?.includes(".");

// ── Floating orbs data ────────────────────────────────────────────────────────
const ORBS = [
  { w: 520, h: 520, top: "-12%", left: "-8%",  color: "rgba(99,102,241,0.18)", dur: 18, delay: 0 },
  { w: 400, h: 400, top: "55%",  left: "60%",  color: "rgba(168,85,247,0.14)", dur: 22, delay: 3 },
  { w: 280, h: 280, top: "30%",  left: "-5%",  color: "rgba(34,197,94,0.10)",  dur: 16, delay: 6 },
  { w: 350, h: 350, top: "-8%",  left: "65%",  color: "rgba(59,130,246,0.12)", dur: 20, delay: 2 },
  { w: 200, h: 200, top: "70%",  left: "20%",  color: "rgba(236,72,153,0.08)", dur: 14, delay: 8 },
];

// ── Ticker items ──────────────────────────────────────────────────────────────
const TICKERS = [
  { label: "Portfolio",  val: "+24.3%", up: true  },
  { label: "Savings",    val: "1.2L",   up: true  },
  { label: "Expenses",   val: "-8.1%",  up: false },
  { label: "Income",     val: "+45K",   up: true  },
  { label: "Net Worth",  val: "+19.7%", up: true  },
  { label: "Budget",     val: "92%",    up: true  },
];

// ── Mini sparkline SVG ────────────────────────────────────────────────────────
function Sparkline({ up }) {
  const points = up
    ? "0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,2"
    : "0,4  8,8  16,6  24,12 32,10 40,16 48,14 56,18";
  return (
    <svg width="56" height="20" viewBox="0 0 56 20" fill="none">
      <polyline points={points} stroke={up ? "#22c55e" : "#f87171"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Animated canvas background ────────────────────────────────────────────────
function CanvasBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animFrame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const NODES = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.4,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      NODES.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      NODES.forEach((a, i) => {
        NODES.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = "rgba(99,102,241," + (0.12 * (1 - dist / 130)) + ")";
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.35)";
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

// ── Left panel stat card ──────────────────────────────────────────────────────
function StatCard({ label, value, sub, up, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14, padding: "14px 18px", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}>{value}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: up ? "#4ade80" : "#f87171", fontWeight: 600 }}>{sub}</p>}
      </div>
      <Sparkline up={up} />
    </motion.div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 7, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            style={{ color: "#f87171", fontSize: 11.5, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f87171"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" /></svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Login component ──────────────────────────────────────────────────────
function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKERS.length), 2400);
    return () => clearInterval(t);
  }, []);

  const validate = () => {
    const e = {};
    if (!isLogin && !name.trim()) e.name = "Full name is required";
    if (!email.trim()) {
      e.email = "Email address is required";
    } else if (!isValidEmail(email)) {
      e.email = "Enter a valid email e.g. you@gmail.com";
    }
    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const url = isLogin
        ? "https://finsight-erku.onrender.com/api/auth/login"
        : "https://finsight-erku.onrender.com/api/auth/register";
      const body = isLogin
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ server: data.message || data.msg || "Something went wrong" });
        setLoading(false);
        return;
      }
      if (isLogin) {
        localStorage.setItem("token", data.token);
        if (data.user?.name) localStorage.setItem("userName", data.user.name);
        window.location.reload();
      } else {
        setErrors({ success: "Account created successfully! Please sign in." });
        setIsLogin(true);
        setName(""); setEmail(""); setPassword("");
      }
    } catch {
      setErrors({ server: "Server error. Please try again later." });
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setName(""); setEmail(""); setPassword(""); setErrors({});
  };

  const inputBase = {
    width: "100%", padding: "12px 14px 12px 40px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 11, color: "white", fontSize: 14,
    outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
    caretColor: "#818cf8",
  };
  const inputFocused = { borderColor: "rgba(99,102,241,0.6)", boxShadow: "0 0 0 3px rgba(99,102,241,0.13)", background: "rgba(99,102,241,0.07)" };
  const inputError   = { borderColor: "rgba(239,68,68,0.45)", boxShadow: "0 0 0 3px rgba(239,68,68,0.09)" };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", overflow: "hidden",
      background: "linear-gradient(155deg, #040210 0%, #07041a 35%, #0d0824 65%, #060318 100%)",
      fontFamily: "'SF Pro Display', 'Helvetica Neue', system-ui, sans-serif",
      position: "relative",
    }}>
      <CanvasBackground />

      {/* Gradient orbs */}
      {ORBS.map((o, i) => (
        <motion.div key={i}
          style={{
            position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0,
            width: o.w, height: o.h, top: o.top, left: o.left,
            background: "radial-gradient(circle, " + o.color + " 0%, transparent 68%)",
            filter: "blur(1px)",
          }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
          transition={{ duration: o.dur, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ══ LEFT PANEL ═══════════════════════════════════════════════════════ */}
      <div className="login-left" style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 64px", position: "relative", zIndex: 5,
        maxWidth: 560,
      }}>
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
          <div style={{
            width: 44, height: 44,
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 28px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </div>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: "-0.05em",
            background: "linear-gradient(135deg, #c7d2fe, #a5b4fc, #818cf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>FinSight</span>
        </motion.div>

        {/* Hero copy */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 16px" }}>
            Financial Intelligence
          </p>
          <h1 style={{
            fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 900, color: "white",
            margin: "0 0 20px", lineHeight: 1.08, letterSpacing: "-0.04em",
          }}>
            Your money,<br />
            <span style={{
              background: "linear-gradient(135deg, #818cf8 0%, #a855f7 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>crystal clear.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, margin: "0 0 48px", maxWidth: 400 }}>
            AI-powered insights that turn your transactions into a complete financial picture — in seconds.
          </p>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380 }}>
          <StatCard label="Portfolio Growth" value="+24.3%" sub="3.2% this week"  up={true}  delay={0.25} />
          <StatCard label="Monthly Savings"  value="1.2L"   sub="On track"        up={true}  delay={0.35} />
          <StatCard label="Expense Ratio"    value="8.1%"   sub="Under budget"    up={false} delay={0.45} />
        </div>

        {/* Live ticker strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{
            marginTop: 36, display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 100, padding: "8px 18px", width: "fit-content",
          }}>
          <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", boxShadow: "0 0 8px #22c55e", flexShrink: 0 }} />
          <AnimatePresence mode="wait">
            <motion.span key={tickerIdx}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
              {TICKERS[tickerIdx].label}:{" "}
              <span style={{ color: TICKERS[tickerIdx].up ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                {TICKERS[tickerIdx].val}
              </span>
            </motion.span>
          </AnimatePresence>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>LIVE</span>
        </motion.div>
      </div>

      {/* ══ DIVIDER ══════════════════════════════════════════════════════════ */}
      <div className="login-divider" style={{
        width: 1,
        background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.25) 30%, rgba(168,85,247,0.2) 70%, transparent)",
        position: "relative", zIndex: 5, flexShrink: 0, alignSelf: "stretch",
      }} />

      {/* ══ RIGHT PANEL ══════════════════════════════════════════════════════ */}
      <div className="login-right" style={{
        width: "min(500px, 46vw)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 48px", position: "relative", zIndex: 5, flexShrink: 0,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ width: "100%", maxWidth: 420 }}>

          <div style={{
            background: "rgba(255,255,255,0.035)",
            backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 26,
            padding: "44px 40px 38px",
            boxShadow: "0 60px 140px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.07), inset 0 1px 0 rgba(255,255,255,0.07)",
            position: "relative", overflow: "hidden",
          }}>

            {/* Top shimmer line */}
            <div style={{
              position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(168,85,247,0.7), transparent)",
            }} />

            {/* Corner glow */}
            <div style={{
              position: "absolute", top: -30, right: -30, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
              borderRadius: "50%", pointerEvents: "none",
            }} />

            {/* Mode tabs */}
            <div style={{
              display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 4,
              marginBottom: 32, border: "1px solid rgba(255,255,255,0.06)",
            }}>
              {["Sign In", "Sign Up"].map((label, i) => {
                const active = (i === 0) === isLogin;
                return (
                  <button key={label} onClick={() => { if ((i === 0) !== isLogin) switchMode(); }}
                    style={{
                      flex: 1, padding: "9px", borderRadius: 9, cursor: "pointer",
                      fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                      background: active ? "rgba(99,102,241,0.22)" : "transparent",
                      color: active ? "#a5b4fc" : "rgba(255,255,255,0.28)",
                      transition: "all 0.2s",
                      boxShadow: active ? "0 2px 12px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
                      border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.div key={isLogin ? "li" : "su"}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "white", margin: "0 0 6px", letterSpacing: "-0.04em" }}>
                  {isLogin ? "Welcome back" : "Create account"}
                </h2>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)", margin: 0, lineHeight: 1.5 }}>
                  {isLogin ? "Sign in to your FinSight dashboard" : "Start your financial journey today"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Banners */}
            <AnimatePresence>
              {errors.server && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden", marginBottom: 16 }}>
                  <div style={{
                    background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.22)",
                    borderRadius: 11, padding: "11px 14px", color: "#fca5a5", fontSize: 13,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span>⚠️</span> {errors.server}
                  </div>
                </motion.div>
              )}
              {errors.success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: "hidden", marginBottom: 16 }}>
                  <div style={{
                    background: "rgba(34,197,94,0.09)", border: "1px solid rgba(34,197,94,0.22)",
                    borderRadius: 11, padding: "11px 14px", color: "#86efac", fontSize: 13,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span>✅</span> {errors.success}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <div>
              {/* Name (signup only) */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}>
                    <Field label="Full Name" error={errors.name}>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                          </svg>
                        </span>
                        <input type="text" placeholder="Your full name" value={name}
                          onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                          onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: "" })); }}
                          style={{ ...inputBase, ...(errors.name ? inputError : focused === "name" ? inputFocused : {}) }} />
                      </div>
                    </Field>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <Field label="Email Address" error={errors.email}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input type="email" placeholder="you@gmail.com" value={email}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                    onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: "" })); }}
                    style={{ ...inputBase, ...(errors.email ? inputError : focused === "email" ? inputFocused : {}) }} />
                </div>
              </Field>

              {/* Password */}
              <Field label="Password" error={errors.password}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", display: "flex", pointerEvents: "none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input type={showPass ? "text" : "password"}
                    placeholder={isLogin ? "Your password" : "Min. 6 characters"} value={password}
                    onFocus={() => setFocused("pass")} onBlur={() => setFocused("")}
                    onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: "" })); }}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    style={{ ...inputBase, paddingRight: 44, ...(errors.password ? inputError : focused === "pass" ? inputFocused : {}) }} />
                  <button onClick={() => setShowPass(!showPass)} type="button"
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", color: "rgba(255,255,255,0.3)" }}>
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </Field>

              {/* Submit */}
              <motion.button onClick={handleSubmit} disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 16px 48px rgba(99,102,241,0.6)" } : {}}
                whileTap={!loading ? { scale: 0.985 } : {}}
                style={{
                  width: "100%", marginTop: 4, padding: "14px",
                  background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 45%, #9333ea 100%)",
                  color: "white", border: "none", borderRadius: 12,
                  fontSize: 14.5, fontWeight: 800, fontFamily: "inherit",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                  boxShadow: "0 8px 28px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                  transition: "all 0.2s", letterSpacing: "0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }} transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                      style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" }} />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </>
                )}
              </motion.button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 20px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            </div>

            {/* Switch mode */}
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13.5, margin: 0 }}>
              {isLogin ? "New to FinSight?" : "Already have an account?"}{" "}
              <motion.span
                whileHover={{ color: "#c4b5fd" }}
                onClick={switchMode}
                style={{ color: "#818cf8", fontWeight: 700, cursor: "pointer", transition: "color 0.2s" }}>
                {isLogin ? "Sign up free" : "Sign in"}
              </motion.span>
            </p>

            {/* Security badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 22 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.18)", letterSpacing: "0.04em" }}>
                256-bit JWT encrypted · Your data stays yours
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(10,6,30,0.98) inset !important;
          transition: background-color 9999s ease-in-out 0s;
        }
        * { box-sizing: border-box; }
        @media (max-width: 860px) {
          .login-left { display: none !important; }
          .login-divider { display: none !important; }
          .login-right { width: 100% !important; padding: 24px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default Login;
