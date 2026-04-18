import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      dur: Math.random() * 10 + 6,
      delay: Math.random() * 5,
    }))
  );

  const validate = () => {
    const e = {};
    if (!isLogin && !name.trim()) e.name = "Name is required";
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email (e.g. you@gmail.com)";
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
      const body = isLogin ? { email, password } : { name, email, password };
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
        setErrors({ success: "Account created! Please sign in." });
        setIsLogin(true);
        setName(""); setEmail(""); setPassword("");
      }
    } catch {
      setErrors({ server: "Server error. Please try again." });
    }
    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setName(""); setEmail(""); setPassword(""); setErrors({});
  };

  return (
    <div style={s.page}>
      {particles.map(p => (
        <motion.div key={p.id} style={{ ...s.particle, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity }} />
      ))}
      <div style={{ ...s.glow, top: "5%", left: "10%" }} />
      <div style={{ ...s.glow, bottom: "10%", right: "5%", background: "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={s.card}>

        <div style={s.logoRow}>
          <motion.div style={s.logoIcon} whileHover={{ rotate: 10, scale: 1.1 }}>⚡</motion.div>
          <span style={s.logoText}>HydraBolt</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={isLogin ? "l" : "s"}
            initial={{ opacity: 0, x: isLogin ? -15 : 15 }}
            animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>
            <h2 style={s.title}>{isLogin ? "Welcome back" : "Get started"}</h2>
            <p style={s.sub}>{isLogin ? "Sign in to your account" : "Create your free account"}</p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {errors.server && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={s.errBanner}>⚠️ {errors.server}</motion.div>}
          {errors.success && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={s.okBanner}>✅ {errors.success}</motion.div>}
        </AnimatePresence>

        <AnimatePresence>
          {!isLogin && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
              <InputField label="Full Name" error={errors.name}>
                <input placeholder="Your name" value={name}
                  onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: "" })); }}
                  style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }} />
              </InputField>
            </motion.div>
          )}
        </AnimatePresence>

        <InputField label="Email Address" error={errors.email}>
          <input type="email" placeholder="you@gmail.com" value={email}
            onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: "" })); }}
            style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }} />
        </InputField>

        <InputField label="Password" error={errors.password}>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"}
              placeholder={isLogin ? "Your password" : "At least 6 characters"} value={password}
              onChange={e => { setPassword(e.target.value); setErrors(v => ({ ...v, password: "" })); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ ...s.input, ...(errors.password ? s.inputErr : {}), paddingRight: 44 }} />
            <button onClick={() => setShowPass(!showPass)} style={s.eyeBtn} type="button">{showPass ? "🙈" : "👁️"}</button>
          </div>
        </InputField>

        <motion.button onClick={handleSubmit} disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(99,102,241,0.5)" }}
          whileTap={{ scale: 0.98 }} style={{ ...s.btn, opacity: loading ? 0.75 : 1 }}>
          {loading
            ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}>⟳</motion.span>
                {isLogin ? "Signing in..." : "Creating..."}
              </span>
            : isLogin ? "Sign In →" : "Create Account →"}
        </motion.button>

        <div style={s.divider}><div style={s.divLine} /><span style={s.divTxt}>or</span><div style={s.divLine} /></div>

        <p style={s.switchRow}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <motion.span whileHover={{ scale: 1.05 }} onClick={switchMode} style={s.switchLink}>
            {isLogin ? "Sign Up" : "Sign In"}
          </motion.span>
        </p>
      </motion.div>
    </div>
  );
}

function InputField({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</label>
      {children}
      <AnimatePresence>
        {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: "#f87171", fontSize: 12, margin: "4px 0 0" }}>⚠ {error}</motion.p>}
      </AnimatePresence>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #080615 0%, #0f0c29 45%, #160d35 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20, position: "relative", overflow: "hidden" },
  particle: { position: "fixed", borderRadius: "50%", background: "rgba(99,102,241,0.6)", pointerEvents: "none" },
  glow: { position: "fixed", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)", pointerEvents: "none" },
  card: { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "44px 48px", width: "100%", maxWidth: 420, boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)", position: "relative", zIndex: 10 },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
  logoIcon: { width: 40, height: 40, background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "default" },
  logoText: { fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.03em" },
  title: { fontSize: 28, fontWeight: 700, color: "white", margin: "0 0 6px", letterSpacing: "-0.02em" },
  sub: { fontSize: 14, color: "#64748b", margin: "0 0 24px" },
  errBanner: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", color: "#f87171", fontSize: 13, marginBottom: 16 },
  okBanner: { background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "10px 14px", color: "#4ade80", fontSize: 13, marginBottom: 16 },
  input: { width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 15, outline: "none", boxSizing: "border-box" },
  inputErr: { border: "1px solid rgba(239,68,68,0.5)" },
  eyeBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0 },
  btn: { width: "100%", marginTop: 8, padding: "14px", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em", transition: "opacity 0.2s" },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "24px 0 20px" },
  divLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.07)" },
  divTxt: { fontSize: 12, color: "#475569" },
  switchRow: { textAlign: "center", color: "#94a3b8", fontSize: 14, margin: 0 },
  switchLink: { color: "#818cf8", fontWeight: 700, cursor: "pointer" },
};

export default Login;
