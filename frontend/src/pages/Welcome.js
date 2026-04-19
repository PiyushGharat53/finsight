import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";

// ── Canvas: flowing financial data streams ────────────────────────────────────
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

    // Streams of data particles falling like matrix rain but financial
    const COLS = Math.floor(window.innerWidth / 28);
    const drops = Array.from({ length: COLS }, () => Math.random() * -100);
    const chars = "₹$€£¥0123456789.%+-×÷=∑∞αβ▲▼◆●";

    const draw = () => {
      ctx.fillStyle = "rgba(4,2,16,0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const progress = y / (canvas.height / 28);
        const alpha = Math.max(0, Math.min(0.18, progress * 0.04));
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
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.6 }} />;
}

// ── Animated SVG chart decoration ─────────────────────────────────────────────
function FloatingChart({ style }) {
  const points = "20,80 60,55 100,65 140,30 180,45 220,15 260,35 300,20";
  return (
    <motion.div style={{ position: "absolute", pointerEvents: "none", ...style }}
      animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <svg width="320" height="100" viewBox="0 0 320 100" fill="none" style={{ opacity: 0.12 }}>
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
        {points.split(" ").map((pt, i) => {
          const [x, y] = pt.split(",");
          return <circle key={i} cx={x} cy={y} r="3.5" fill="#6366f1" opacity="0.7" />;
        })}
      </svg>
    </motion.div>
  );
}

// ── Ticker bar ─────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { sym: "NIFTY", val: "22,147.90", chg: "+1.24%", up: true },
  { sym: "SENSEX", val: "73,088.33", chg: "+0.98%", up: true },
  { sym: "GOLD", val: "₹71,450", chg: "+0.43%", up: true },
  { sym: "BTC", val: "$64,820", chg: "-1.12%", up: false },
  { sym: "USD/INR", val: "83.42", chg: "+0.08%", up: true },
  { sym: "RELIANCE", val: "₹2,918", chg: "+2.31%", up: true },
  { sym: "ETH", val: "$3,142", chg: "-0.74%", up: false },
  { sym: "INFOSYS", val: "₹1,487", chg: "+1.55%", up: true },
];

function TickerBar() {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(4,2,16,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(99,102,241,0.12)",
      height: 36, overflow: "hidden", display: "flex", alignItems: "center",
    }}>
      <motion.div
        style={{ display: "flex", gap: 48, whiteSpace: "nowrap", alignItems: "center" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, fontFamily: "monospace" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.06em" }}>{t.sym}</span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{t.val}</span>
            <span style={{ color: t.up ? "#4ade80" : "#f87171", fontWeight: 700 }}>{t.chg}</span>
            <span style={{ color: "rgba(255,255,255,0.08)" }}>│</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{
        position: "fixed", top: 36, left: 0, right: 0, zIndex: 90,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
        background: scrolled ? "rgba(4,2,16,0.8)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s",
      }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div whileHover={{ rotate: 10, scale: 1.08 }} style={{
          width: 38, height: 38, background: "linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)",
          borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
          </svg>
        </motion.div>
        <span style={{
          fontSize: 20, fontWeight: 900, letterSpacing: "-0.05em",
          background: "linear-gradient(135deg,#c7d2fe,#a5b4fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>FinSight</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {["Features", "Analytics", "Security"].map(label => (
          <motion.span key={label} whileHover={{ color: "#a5b4fc" }}
            style={{ padding: "6px 14px", fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.45)", cursor: "default", borderRadius: 8, transition: "color 0.2s" }}>
            {label}
          </motion.span>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <motion.button whileHover={{ color: "white" }}
            style={{ padding: "8px 18px", background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "color 0.2s" }}>
            Sign In
          </motion.button>
        </Link>
        <Link to="/signup" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 28px rgba(99,102,241,0.5)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "8px 20px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              color: "white", border: "none", borderRadius: 10, fontSize: 13.5, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}>
            Get Started
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  );
}

// ── Stats counter ─────────────────────────────────────────────────────────────
function CountUp({ to, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = null;
    const dur = 2000;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.floor(ease * to));
      if (p < 1) requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { requestAnimationFrame(step); obs.disconnect(); }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    color: "#6366f1", glow: "rgba(99,102,241,0.25)",
    tag: "ANALYTICS",
    title: "Smart Analytics",
    desc: "Visual charts reveal your spending DNA — where every rupee flows, every pattern emerges.",
    stat: "360°", statLabel: "Financial view",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    color: "#a855f7", glow: "rgba(168,85,247,0.25)",
    tag: "REAL-TIME",
    title: "Instant Tracking",
    desc: "Every transaction captured and categorized the moment it happens. Zero lag. Full clarity.",
    stat: "<1s", statLabel: "Capture speed",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    color: "#22c55e", glow: "rgba(34,197,94,0.2)",
    tag: "GOALS",
    title: "Savings Goals",
    desc: "Set targets, visualize milestones, and watch your wealth compound toward the life you want.",
    stat: "3×", statLabel: "Faster savings",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    color: "#ec4899", glow: "rgba(236,72,153,0.2)",
    tag: "AI POWERED",
    title: "AI Assistant",
    desc: "Your personal CFO in your pocket. Asks the right questions, finds the right answers.",
    stat: "24/7", statLabel: "AI guidance",
  },
];

// ── How it works steps ────────────────────────────────────────────────────────
const STEPS = [
  { n: "01", title: "Connect & Import", desc: "Add transactions manually or let our smart parser do the heavy lifting in seconds." },
  { n: "02", title: "Categorize Instantly", desc: "AI maps every expense to the right category — groceries, EMIs, entertainment, investments." },
  { n: "03", title: "Unlock Insights", desc: "Your personalized dashboard surfaces trends, warnings, and opportunities automatically." },
];

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Arjun M.", role: "Software Engineer, Pune", text: "Finally a finance app that doesn't feel like a spreadsheet. The AI advisor saved me ₹18,000 last month alone.", avatar: "AM" },
  { name: "Priya S.", role: "Freelancer, Bengaluru", text: "Tracking was always a nightmare for me. FinSight makes it feel effortless. I actually look forward to checking it.", avatar: "PS" },
  { name: "Rohan K.", role: "MBA Student, Mumbai", text: "The analytics are insane. I found ₹6K in subscriptions I'd completely forgotten about within 5 minutes.", avatar: "RK" },
];

// ── Main Welcome ──────────────────────────────────────────────────────────────
function Welcome() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div style={{
      minHeight: "100vh", overflowX: "hidden",
      background: "linear-gradient(160deg, #040210 0%, #06041a 30%, #09061f 60%, #050214 100%)",
      fontFamily: "'SF Pro Display','Helvetica Neue',system-ui,sans-serif",
      color: "white",
    }}>
      <DataStreamCanvas />

      {/* Ambient orbs */}
      {[
        { w:700, h:700, top:"-15%", left:"-10%", c:"rgba(99,102,241,0.15)", dur:20 },
        { w:500, h:500, top:"40%",  left:"65%",  c:"rgba(168,85,247,0.12)", dur:25 },
        { w:400, h:400, top:"70%",  left:"-5%",  c:"rgba(34,197,94,0.08)",  dur:18 },
        { w:300, h:300, top:"20%",  left:"75%",  c:"rgba(236,72,153,0.07)", dur:22 },
      ].map((o,i) => (
        <motion.div key={i} style={{
          position: "fixed", borderRadius: "50%", pointerEvents: "none", zIndex: 0,
          width: o.w, height: o.h, top: o.top, left: o.left,
          background: `radial-gradient(circle,${o.c} 0%,transparent 70%)`,
        }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, i%2===0?10:-10, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <TickerBar />
      <Navbar />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "160px 24px 80px", position: "relative", zIndex: 10, textAlign: "center",
      }}>
        {/* Floating chart decorations */}
        <FloatingChart style={{ top: "18%", left: "4%", opacity: 1 }} />
        <FloatingChart style={{ top: "22%", right: "3%", opacity: 1, transform: "scaleX(-1)" }} />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.28)",
            borderRadius: 100, padding: "7px 20px", marginBottom: 36,
          }}>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", boxShadow: "0 0 8px #4ade80" }} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#a5b4fc", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            AI-Powered Finance Intelligence
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16,1,0.3,1] }}
          style={{
            fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 900,
            letterSpacing: "-0.05em", lineHeight: 1.0, margin: "0 0 8px",
            maxWidth: 900,
          }}>
          Your money,
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.42, ease: [0.16,1,0.3,1] }}
          style={{
            fontSize: "clamp(44px, 8vw, 88px)", fontWeight: 900,
            letterSpacing: "-0.05em", lineHeight: 1.0, margin: "0 0 32px",
            background: "linear-gradient(135deg, #818cf8 0%, #c084fc 45%, #34d399 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
          finally obedient.
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.38)", lineHeight: 1.75, margin: "0 0 52px", maxWidth: 560 }}>
          Track expenses, set goals, and unlock AI-powered insights —<br />all in one beautiful dashboard built for you.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.68 }}
          style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
          <Link to="/signup" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 20px 60px rgba(99,102,241,0.6)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "17px 38px", fontSize: 15.5, fontWeight: 800, fontFamily: "inherit",
                background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #9333ea 100%)",
                color: "white", border: "none", borderRadius: 14, cursor: "pointer",
                boxShadow: "0 10px 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>
              Get Started — It's Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </motion.button>
          </Link>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.28)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "17px 38px", fontSize: 15.5, fontWeight: 700, fontFamily: "inherit",
                background: "rgba(255,255,255,0.05)", color: "white",
                border: "1px solid rgba(255,255,255,0.13)", borderRadius: 14, cursor: "pointer",
                transition: "all 0.2s",
              }}>
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          style={{ fontSize: 12.5, color: "rgba(255,255,255,0.2)", letterSpacing: "0.03em" }}>
          No credit card required &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; Secure & private
        </motion.p>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)" }}>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 100px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{
            maxWidth: 900, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1,
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)",
            borderRadius: 22, overflow: "hidden",
          }}>
          {[
            { val: 12000, suffix: "+", label: "Transactions tracked" },
            { val: 98, suffix: "%", label: "Accuracy rate" },
            { val: 4200, suffix: "+", label: "Active users" },
            { val: 2.8, suffix: "M", prefix: "₹", label: "Saved by users" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "36px 28px", textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              borderRight: i < 3 ? "1px solid rgba(99,102,241,0.1)" : "none",
            }}>
              <p style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.04em",
                background: "linear-gradient(135deg,#c7d2fe,#a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                <CountUp to={s.val} suffix={s.suffix} prefix={s.prefix || ""} />
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Section heading */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>Everything you need</p>
            <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
              Built different.{" "}
              <span style={{ background: "linear-gradient(135deg,#818cf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Priced free.
              </span>
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", margin: 0, maxWidth: 480, marginInline: "auto" }}>
              Four core pillars that give you total mastery over your financial life.
            </p>
          </motion.div>

          {/* Feature selector + detail */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
            {/* Left: feature tabs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FEATURES.map((f, i) => (
                <motion.div key={i}
                  onClick={() => setActiveFeature(i)}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{
                    padding: "20px 24px", borderRadius: 16, cursor: "pointer",
                    border: activeFeature === i ? `1px solid ${f.color}40` : "1px solid rgba(255,255,255,0.06)",
                    background: activeFeature === i ? `rgba(${f.color === "#6366f1" ? "99,102,241" : f.color === "#a855f7" ? "168,85,247" : f.color === "#22c55e" ? "34,197,94" : "236,72,153"},0.08)` : "rgba(255,255,255,0.02)",
                    transition: "all 0.25s",
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                    background: `rgba(${f.color === "#6366f1" ? "99,102,241" : f.color === "#a855f7" ? "168,85,247" : f.color === "#22c55e" ? "34,197,94" : "236,72,153"},0.15)`,
                    border: `1px solid ${f.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.color,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: f.color, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{f.tag}</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: activeFeature === i ? "white" : "rgba(255,255,255,0.55)" }}>{f.title}</p>
                  </div>
                  {activeFeature === i && (
                    <div style={{ marginLeft: "auto", flexShrink: 0, color: f.color }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right: feature detail card */}
            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}
                style={{
                  background: "rgba(255,255,255,0.03)", border: `1px solid ${FEATURES[activeFeature].color}25`,
                  borderRadius: 22, padding: "44px 40px",
                  boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 60px ${FEATURES[activeFeature].glow}`,
                  position: "sticky", top: 120,
                }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, marginBottom: 28,
                  background: `rgba(${FEATURES[activeFeature].color === "#6366f1" ? "99,102,241" : FEATURES[activeFeature].color === "#a855f7" ? "168,85,247" : FEATURES[activeFeature].color === "#22c55e" ? "34,197,94" : "236,72,153"},0.15)`,
                  border: `1px solid ${FEATURES[activeFeature].color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: FEATURES[activeFeature].color,
                }}>
                  {React.cloneElement(FEATURES[activeFeature].icon, { width: 30, height: 30 })}
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: FEATURES[activeFeature].color, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  {FEATURES[activeFeature].tag}
                </p>
                <h3 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
                  {FEATURES[activeFeature].title}
                </h3>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, margin: "0 0 36px" }}>
                  {FEATURES[activeFeature].desc}
                </p>
                <div style={{
                  display: "flex", alignItems: "center", gap: 20,
                  padding: "20px 24px", borderRadius: 14,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", color: FEATURES[activeFeature].color }}>
                      {FEATURES[activeFeature].stat}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
                      {FEATURES[activeFeature].statLabel}
                    </p>
                  </div>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                  <Link to="/signup" style={{ textDecoration: "none" }}>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                      style={{
                        padding: "10px 22px", background: FEATURES[activeFeature].color,
                        color: "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: `0 6px 20px ${FEATURES[activeFeature].glow}`,
                      }}>
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
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#a855f7", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>How it works</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", margin: 0 }}>
              Up and running in{" "}
              <span style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                60 seconds.
              </span>
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {STEPS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                style={{
                  display: "flex", gap: 28, alignItems: "flex-start",
                  padding: "32px 36px", borderRadius: 18,
                  background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
                  position: "relative", overflow: "hidden",
                }}>
                {/* Number */}
                <div style={{
                  fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.06em",
                  color: "rgba(99,102,241,0.15)", flexShrink: 0, fontVariantNumeric: "tabular-nums",
                  minWidth: 64,
                }}>
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.38)", margin: 0, lineHeight: 1.65 }}>{step.desc}</p>
                </div>
                {/* Connector */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", bottom: -2, left: 60, width: 1, height: 4,
                    background: "linear-gradient(180deg, rgba(99,102,241,0.4), transparent)",
                  }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 120px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 14px" }}>Real users. Real results.</p>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.04em", margin: 0 }}>
              People love FinSight.
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                whileHover={{ y: -4, borderColor: "rgba(99,102,241,0.3)" }}
                style={{
                  padding: "28px 26px", borderRadius: 20,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  transition: "all 0.25s",
                }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, margin: "0 0 22px", fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: "white",
                  }}>{t.avatar}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "white" }}>{t.name}</p>
                    <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.3)" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 10, padding: "0 24px 100px" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{
            maxWidth: 780, margin: "0 auto", textAlign: "center",
            padding: "72px 48px",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.18)",
            borderRadius: 28,
            boxShadow: "0 0 120px rgba(99,102,241,0.12)",
            position: "relative", overflow: "hidden",
          }}>
          {/* Top shimmer */}
          <div style={{
            position: "absolute", top: 0, left: "20%", right: "20%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(168,85,247,0.7), transparent)",
          }} />

          <motion.div
            animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              width: 60, height: 60, margin: "0 auto 28px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)",
              borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 12px 40px rgba(99,102,241,0.5)",
            }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
            </svg>
          </motion.div>

          <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: "0 0 16px" }}>
            Start for free.{" "}
            <span style={{ background: "linear-gradient(135deg,#818cf8,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Stay forever.
            </span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", margin: "0 0 44px", lineHeight: 1.65 }}>
            Join thousands of people who finally have clarity over their finances.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(99,102,241,0.65)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "17px 40px", fontSize: 16, fontWeight: 800, fontFamily: "inherit",
                  background: "linear-gradient(135deg, #4338ca, #6d28d9, #9333ea)",
                  color: "white", border: "none", borderRadius: 14, cursor: "pointer",
                  boxShadow: "0 10px 36px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}>
                Create Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
            </Link>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: "17px 40px", fontSize: 16, fontWeight: 700, fontFamily: "inherit",
                  background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, cursor: "pointer",
                }}>
                Sign In Instead
              </motion.button>
            </Link>
          </div>

          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 24, letterSpacing: "0.03em" }}>
            🔒 256-bit encrypted &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
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