import { HashRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Login from "./pages/Login";
import Assistant from "./pages/Assistant";
import Welcome from "./pages/Welcome";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    sync();
    window.addEventListener("loginSuccess", sync);
    window.addEventListener("logout", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("loginSuccess", sync);
      window.removeEventListener("logout", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Router>
      {!token ? (
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg, #080615 0%, #0f0c29 50%, #160d35 100%)" }}>
          <Sidebar onLogout={() => { localStorage.removeItem("token"); localStorage.removeItem("userName"); window.dispatchEvent(new Event("logout")); }} />
          <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", overflowY: "auto" }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddTransaction />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<History />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

function Sidebar({ onLogout }) {
  const userName = localStorage.getItem("userName") || "User";
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const links = [
    { to: "/", label: "Dashboard", icon: "⚡" },
    { to: "/add", label: "Add", icon: "＋" },
    { to: "/analytics", label: "Analytics", icon: "📊" },
    { to: "/history", label: "History", icon: "📜" },
    { to: "/assistant", label: "Assistant", icon: "🤖" },
  ];

  return (
    <motion.aside initial={{ x: -240 }} animate={{ x: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
      style={ss.sidebar}>
      {/* Logo */}
      <div style={ss.logoRow}>
        <div style={ss.logoIcon}>⚡</div>
        <span style={ss.logoText}>HydraBolt</span>
      </div>

      {/* User chip */}
      <div style={ss.userChip}>
        <div style={ss.avatar}>{initials}</div>
        <div>
          <p style={ss.userName}>{userName}</p>
          <p style={ss.userSub}>Finance Dashboard</p>
        </div>
      </div>

      <div style={ss.divider} />

      {/* Nav links */}
      <nav style={{ flex: 1 }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"}
            style={({ isActive }) => ({ ...ss.navLink, ...(isActive ? ss.navLinkActive : {}) })}>
            {({ isActive }) => (
              <>
                {isActive && <motion.div layoutId="activeIndicator" style={ss.activePill} />}
                <span style={ss.navIcon}>{link.icon}</span>
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <motion.button onClick={onLogout} whileHover={{ scale: 1.02, background: "rgba(239,68,68,0.18)" }}
        whileTap={{ scale: 0.97 }} style={ss.logoutBtn}>
        <span>🚪</span> Logout
      </motion.button>
    </motion.aside>
  );
}

const ss = {
  sidebar: { position: "fixed", top: 0, left: 0, width: 240, height: "100vh", background: "rgba(8,6,21,0.95)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "24px 16px", zIndex: 100, overflowY: "auto" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 28 },
  logoIcon: { width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  logoText: { fontSize: 18, fontWeight: 800, color: "white", letterSpacing: "-0.02em" },
  userChip: { display: "flex", alignItems: "center", gap: 10, padding: "12px", background: "rgba(255,255,255,0.04)", borderRadius: 12, marginBottom: 16 },
  avatar: { width: 36, height: 36, background: "linear-gradient(135deg, #6366f1, #22c55e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0 },
  userName: { fontSize: 14, fontWeight: 700, color: "white", margin: 0, textTransform: "capitalize" },
  userSub: { fontSize: 11, color: "#64748b", margin: "2px 0 0" },
  divider: { height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 16px" },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, color: "#64748b", textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 4, position: "relative", transition: "color 0.2s" },
  navLinkActive: { color: "white", background: "rgba(99,102,241,0.1)" },
  activePill: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, background: "linear-gradient(180deg, #6366f1, #a855f7)", borderRadius: 100 },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  logoutBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, color: "#f87171", cursor: "pointer", fontSize: 14, fontWeight: 600, marginTop: 8 },
};

export default App;
