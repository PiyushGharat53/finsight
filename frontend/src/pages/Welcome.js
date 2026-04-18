import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  { icon: "📊", title: "Smart Analytics", desc: "Visualize your spending patterns with beautiful charts" },
  { icon: "⚡", title: "Real-time Tracking", desc: "Every transaction captured and categorized instantly" },
  { icon: "🎯", title: "Savings Goals", desc: "Set targets and watch your progress grow" },
  { icon: "🤖", title: "AI Assistant", desc: "Get personalized financial insights and advice" },
];

function Welcome() {
  const [particles] = useState(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 4 + 1, dur: Math.random() * 12 + 8, delay: Math.random() * 6,
    }))
  );

  return (
    <div style={s.page}>
      {particles.map(p => (
        <motion.div key={p.id}
          style={{ ...s.particle, left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -50, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity }} />
      ))}

      <div style={{ ...s.blob, top: "0%", left: "-5%" }} />
      <div style={{ ...s.blob, bottom: "0%", right: "-5%", background: "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)" }} />
      <div style={{ ...s.blob, top: "40%", left: "40%", width: 300, height: 300, background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)" }} />

      <div style={s.content}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={s.header}>
          <motion.div style={s.logoIcon} animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>⚡</motion.div>
          <span style={s.logoText}>HydraBolt</span>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={s.hero}>
          <motion.div style={s.badge} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            ✨ Smart Finance Management
          </motion.div>

          <h1 style={s.heroTitle}>
            Take control of{" "}
            <span style={s.gradient}>your money</span>
          </h1>

          <p style={s.heroSub}>
            Track expenses, set goals, and get AI-powered insights —<br />
            all in one beautiful dashboard.
          </p>

          <div style={s.btnRow}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(99,102,241,0.5)" }}
                whileTap={{ scale: 0.97 }} style={s.primaryBtn}>
                Get Started — It's Free →
              </motion.button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.97 }} style={s.secondaryBtn}>
                Sign In
              </motion.button>
            </Link>
          </div>

          <p style={s.heroNote}>No credit card required • Free forever</p>
        </motion.div>

        {/* Feature cards */}
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} style={s.features}>
          {features.map((f, i) => (
            <motion.div key={i} style={s.featureCard}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              whileHover={{ y: -5, background: "rgba(255,255,255,0.08)", borderColor: "rgba(99,102,241,0.4)" }}>
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={s.bottomNote}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#818cf8", fontWeight: 700, textDecoration: "none" }}>
            Sign Up for free
          </Link>
        </motion.p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #080615 0%, #0f0c29 50%, #160d35 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "white", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" },
  particle: { position: "fixed", borderRadius: "50%", background: "rgba(99,102,241,0.4)", pointerEvents: "none" },
  blob: { position: "fixed", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)", pointerEvents: "none" },
  content: { position: "relative", zIndex: 10, maxWidth: 900, width: "100%", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center" },
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 60 },
  logoIcon: { width: 44, height: 44, background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  logoText: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" },
  hero: { textAlign: "center", marginBottom: 60 },
  badge: { display: "inline-block", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "#a5b4fc", marginBottom: 24, letterSpacing: "0.02em" },
  heroTitle: { fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 20px" },
  gradient: { background: "linear-gradient(135deg, #818cf8, #a855f7, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: 18, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 36px" },
  btnRow: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 },
  primaryBtn: { padding: "16px 32px", background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em" },
  secondaryBtn: { padding: "16px 32px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" },
  heroNote: { fontSize: 13, color: "#475569", margin: 0 },
  features: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, width: "100%", marginBottom: 48 },
  featureCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "24px 20px", transition: "all 0.3s ease", cursor: "default" },
  featureIcon: { fontSize: 28, marginBottom: 12 },
  featureTitle: { fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "white" },
  featureDesc: { fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 },
  bottomNote: { color: "#64748b", fontSize: 15, textAlign: "center" },
};

export default Welcome;
