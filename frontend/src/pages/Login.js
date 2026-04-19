import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Strict email: must have proper TLD like .com .in .org etc, min 2 chars after dot
const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim()) &&
    !email.trim().startsWith("@") &&
    email.trim().split("@")[1]?.includes(".");
};

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  dur: Math.random() * 14 + 8,
  delay: Math.random() * 8,
  color: i % 3 === 0 ? "rgba(99,102,241,0.7)" : i % 3 === 1 ? "rgba(168,85,247,0.5)" : "rgba(34,197,94,0.4)",
}));

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");

  const validate = () => {
    const e = {};
    if (!isLogin && !name.trim()) e.name = "Full name is required";
    if (!email.trim()) {
      e.email = "Email address is required";
    } else if (!isValidEmail(email)) {
      e.email = "Enter a valid email — e.g. you@gmail.com or you@domain.in";
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
      const body = isLogin ? { email: email.trim(), password } : { name: name.trim(), email: email.trim(), password };
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

  return (
    <div style={s.page}>
      {/* Animated particles */}
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          style={{ ...s.particle, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -60, 0], x: [0, (p.id % 2 === 0 ? 15 : -15), 0], opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Background glow blobs */}
      <motion.div style={{ ...s.blob, top: "-10%", left: "-10%", width: 700, height: 700, background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 5, 0] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div style={{ ...s.blob, bottom: "-15%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }} transition={{ duration: 15, repeat: Infinity }} />
      <motion.div style={{ ...s.blob, top: "40%", left: "50%", width: 300, height: 300, background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} />

      {/* Grid overlay */}
      <div style={s.grid} />

      <motion.div initial={{ opacity: 0, y: 60, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={s.card}>

        {/* Top glow line */}
        <div style={s.cardTopGlow} />

        {/* Logo */}
        <div style={s.logoRow}>
          <motion.div style={s.logoMark} whileHover={{ scale: 1.08, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </motion.div>
          <span style={s.logoText}>FinSight</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={isLogin ? "login-head" : "signup-head"}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
            <h2 style={s.title}>{isLogin ? "Welcome back" : "Create account"}</h2>
            <p style={s.sub}>{isLogin ? "Sign in to your FinSight dashboard" : "Start your financial journey today"}</p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {errors.server && (
            <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} style={s.errBanner}>
              <span style={{ fontSize: 15 }}>⚠️</span> {errors.server}
            </motion.div>
          )}
          {errors.success && (
            <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} style={s.okBanner}>
              <span style={{ fontSize: 15 }}>✅</span> {errors.success}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={s.form}>
          <AnimatePresence>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <Field label="Full Name" error={errors.name} focused={focused === "name"}>
                  <input placeholder="Your full name" value={name}
                    onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                    onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: "" })); }}
                    style={{ ...s.input, ...(errors.name ? s.inputErr : focused === "name" ? s.inputFocus : {}) }} />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <Field label="Email Address" error={errors.email} focused={focused === "email"}>
            <div style={{ position: "relative" }}>
              <span style={s.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/>
                </svg>
              </span>
              <input type="email" placeholder="you@gmail.com" value={email}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: "" })); }}
                style={{ ...s.input, ...s.inputWithIcon, ...(errors.email ? s.inputErr : focused === "email" ? s.inputFocus : {}) }} />
            </div>
          </Field>

          <Field label="Password" error={errors.password} focused={focused === "pass"}>
            <div style={{ position: "relative" }}>
              <span style={s.inputIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </span>
              <input type={showPass ? "text" : "password"}
                placeholder={isLogin ? "Your password" : "Min. 6 characters"} value={password}
                onFocus={() => setFocused("pass")} onBlur={() => setFocused("")}
                onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: "" })); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ ...s.input, ...s.inputWithIcon, ...(errors.password ? s.inputErr : focused === "pass" ? s.inputFocus : {}), paddingRight: 44 }} />
              <button onClick={() => setShowPass(!showPass)} style={s.eyeBtn} type="button">
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </Field>

          <motion.button onClick={handleSubmit} disabled={loading}
            whileHover={!loading ? { scale: 1.02, boxShadow: "0 12px 40px rgba(99,102,241,0.55)" } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{ ...s.submitBtn, opacity: loading ? 0.8 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            <span style={s.btnInner}>
              {loading ? (
                <>
                  <motion.div style={s.spinner} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              )}
            </span>
          </motion.button>
        </div>

        <div style={s.divider}><div style={s.divLine} /><span style={s.divTxt}>or continue with</span><div style={s.divLine} /></div>

        <p style={s.switchRow}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          {" "}
          <motion.span whileHover={{ color: "#a5b4fc" }} onClick={switchMode} style={s.switchLink}>
            {isLogin ? "Sign Up for free" : "Sign In"}
          </motion.span>
        </p>

        <p style={s.secureNote}>🔒 Secured with JWT encryption</p>
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, letterSpacing: "0.09em", textTransform: "uppercase" }}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}>
            <p style={{ color: "#f87171", fontSize: 12, margin: "5px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#f87171"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2"/></svg>
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(145deg, #06040f 0%, #0c0920 40%, #100b28 70%, #0a0718 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "20px", position: "relative", overflow: "hidden" },
  particle: { position: "fixed", borderRadius: "50%", pointerEvents: "none" },
  blob: { position: "fixed", borderRadius: "50%", pointerEvents: "none" },
  grid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  card: { background: "rgba(255,255,255,0.03)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 28, padding: "48px 52px", width: "100%", maxWidth: 440, boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.06)", position: "relative", zIndex: 10 },
  cardTopGlow: { position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.6), transparent)", borderRadius: 100 },
  logoRow: { display: "flex", alignItems: "center", gap: 11, marginBottom: 36 },
  logoMark: { width: 42, height: 42, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)", cursor: "default" },
  logoText: { fontSize: 22, fontWeight: 900, background: "linear-gradient(135deg, #c7d2fe, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.04em" },
  title: { fontSize: 30, fontWeight: 800, color: "white", margin: "0 0 7px", letterSpacing: "-0.03em" },
  sub: { fontSize: 14, color: "#475569", margin: "0 0 28px", lineHeight: 1.5 },
  errBanner: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "11px 15px", color: "#fca5a5", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" },
  okBanner: { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "11px 15px", color: "#86efac", fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" },
  form: { display: "flex", flexDirection: "column" },
  input: { width: "100%", padding: "13px 15px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s" },
  inputWithIcon: { paddingLeft: 40 },
  inputFocus: { borderColor: "rgba(99,102,241,0.5)", boxShadow: "0 0 0 3px rgba(99,102,241,0.12)", background: "rgba(99,102,241,0.06)" },
  inputErr: { borderColor: "rgba(239,68,68,0.4)", boxShadow: "0 0 0 3px rgba(239,68,68,0.08)" },
  inputIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" },
  eyeBtn: { position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" },
  submitBtn: { marginTop: 6, padding: "15px", background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, boxShadow: "0 6px 20px rgba(99,102,241,0.35)", transition: "all 0.2s" },
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  spinner: { width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%" },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "26px 0 22px" },
  divLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.06)" },
  divTxt: { fontSize: 11, color: "#334155", letterSpacing: "0.04em", whiteSpace: "nowrap" },
  switchRow: { textAlign: "center", color: "#64748b", fontSize: 14, margin: 0 },
  switchLink: { color: "#818cf8", fontWeight: 700, cursor: "pointer", transition: "color 0.2s" },
  secureNote: { textAlign: "center", color: "#1e293b", fontSize: 11, marginTop: 20, marginBottom: 0 },
};

export default Login;
