import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 3 + 0.5, dur: Math.random() * 14 + 8, delay: Math.random() * 7,
  color: i % 3 === 0 ? "rgba(99,102,241,0.6)" : i % 3 === 1 ? "rgba(168,85,247,0.45)" : "rgba(34,197,94,0.35)",
}));

const features = [
  { icon: "📊", title: "Smart Analytics", desc: "Visual charts of your spending patterns and trends" },
  { icon: "⚡", title: "Instant Tracking", desc: "Every transaction captured and categorized in real-time" },
  { icon: "🎯", title: "Savings Goals", desc: "Set targets and watch your progress grow daily" },
  { icon: "🤖", title: "AI Assistant", desc: "Get personalized financial insights and advice" },
];

function Welcome() {
  return (
    <div style={s.page}>
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          style={{ ...s.particle, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [0, -55, 0], x: [0, p.id % 2 === 0 ? 10 : -10, 0], opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <motion.div style={{ ...s.blob, top: "-10%", left: "-5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 12, repeat: Infinity }} />
      <motion.div style={{ ...s.blob, bottom: "-10%", right: "-5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)" }}
        animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity }} />
      <div style={s.grid} />

      <div style={s.content}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={s.header}>
          <motion.div style={s.logoMark} animate={{ rotate: [0, 4, -4, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </motion.div>
          <span style={s.logoText}>FinSight</span>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={s.hero}>
          <motion.div style={s.badge} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
            <span style={{ marginRight: 6 }}>✦</span> Smart Finance Management
          </motion.div>

          <h1 style={s.heroTitle}>
            Take control of{" "}
            <span style={s.heroGrad}>your money</span>
          </h1>

          <motion.p style={s.heroSub} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Track expenses, set goals, and unlock AI-powered insights —<br />all in one beautiful dashboard built for you.
          </motion.p>

          <motion.div style={s.btnRow} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 16px 50px rgba(99,102,241,0.55)" }}
                whileTap={{ scale: 0.97 }} style={s.primaryBtn}>
                Get Started — It's Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.25)" }}
                whileTap={{ scale: 0.97 }} style={s.ghostBtn}>
                Sign In
              </motion.button>
            </Link>
          </motion.div>
          <motion.p style={s.heroNote} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
            No credit card required • Free forever • Secure & private
          </motion.p>
        </motion.div>

        {/* Feature cards */}
        <div style={s.features}>
          {features.map((f, i) => (
            <motion.div key={i} style={s.featureCard}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              whileHover={{ y: -6, borderColor: "rgba(99,102,241,0.35)", background: "rgba(255,255,255,0.07)" }}>
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} style={s.bottomNote}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>Sign Up free →</Link>
        </motion.p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(145deg, #06040f 0%, #0c0920 40%, #100b28 70%, #0a0718 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "white", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" },
  particle: { position: "fixed", borderRadius: "50%", pointerEvents: "none" },
  blob: { position: "fixed", borderRadius: "50%", pointerEvents: "none" },
  grid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(99,102,241,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.025) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" },
  content: { position: "relative", zIndex: 10, maxWidth: 960, width: "100%", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 64 },
  logoMark: { width: 44, height: 44, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" },
  logoText: { fontSize: 26, fontWeight: 900, background: "linear-gradient(135deg, #c7d2fe, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.04em" },
  hero: { textAlign: "center", marginBottom: 64 },
  badge: { display: "inline-flex", alignItems: "center", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, padding: "7px 18px", fontSize: 13, color: "#a5b4fc", marginBottom: 28, letterSpacing: "0.02em" },
  heroTitle: { fontSize: "clamp(38px, 7vw, 70px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 22px" },
  heroGrad: { background: "linear-gradient(135deg, #818cf8 0%, #a855f7 40%, #22c55e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: 18, color: "#64748b", lineHeight: 1.75, margin: "0 0 40px" },
  btnRow: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 },
  primaryBtn: { display: "flex", alignItems: "center", gap: 8, padding: "17px 34px", background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", color: "white", border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(99,102,241,0.35)" },
  ghostBtn: { padding: "17px 34px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" },
  heroNote: { fontSize: 13, color: "#334155", margin: 0 },
  features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, width: "100%", marginBottom: 52 },
  featureCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "26px 22px", transition: "all 0.3s ease", cursor: "default" },
  featureIcon: { fontSize: 30, marginBottom: 14 },
  featureTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "white" },
  featureDesc: { fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.65 },
  bottomNote: { color: "#334155", fontSize: 15, textAlign: "center" },
};

export default Welcome;
