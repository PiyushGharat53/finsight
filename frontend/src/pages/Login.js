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
            <img src="data:image/png;base64,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" alt="FinSight" style={{width:38,height:38,objectFit:"contain",borderRadius:6}}/>
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