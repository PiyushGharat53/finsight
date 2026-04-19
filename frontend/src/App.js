import { HashRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(145deg, #06040f 0%, #0c0920 40%, #100b28 100%)" }}>
          <Sidebar />
          <main style={{ flex: 1, marginLeft: 248, minHeight: "100vh", overflowY: "auto" }}>
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

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: "/add", label: "Add", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { to: "/analytics", label: "Analytics", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { to: "/history", label: "History", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { to: "/assistant", label: "Assistant", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

function Sidebar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(localStorage.getItem("userName") || "User");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setDisplayName(trimmed);
      localStorage.setItem("userName", trimmed);
    }
    setEditingName(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.dispatchEvent(new Event("logout"));
  };

  return (
    <motion.aside initial={{ x: -248 }} animate={{ x: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={ss.sidebar}>

      {/* Top glow */}
      <div style={ss.sidebarGlow} />

      {/* Logo */}
      <div style={ss.logoRow}>
        <div style={ss.logoMark}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
          </svg>
        </div>
        <span style={ss.logoText}>FinSight</span>
      </div>

      <div style={ss.divider} />

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_LINKS.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"}
            style={({ isActive }) => ({ ...ss.navLink, ...(isActive ? ss.navLinkActive : {}) })}>
            {({ isActive }) => (
              <>
                {isActive && <motion.div layoutId="activePill" style={ss.activePill} />}
                <span style={{ ...ss.navIcon, color: isActive ? "#a5b4fc" : "#475569" }}>{link.icon}</span>
                <span style={{ color: isActive ? "white" : "#64748b" }}>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={ss.divider} />

      {/* Profile section */}
      <div ref={panelRef} style={{ position: "relative" }}>
        <motion.button onClick={() => setProfileOpen(!profileOpen)}
          whileHover={{ background: "rgba(255,255,255,0.07)" }}
          style={ss.profileBtn}>
          <div style={ss.avatar}>{initials}</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <p style={ss.userName}>{displayName}</p>
            <p style={ss.userSub}>View profile</p>
          </div>
          <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }} transition={{ duration: 0.2 }}
              style={ss.profilePanel}>

              {/* Avatar display */}
              <div style={{ textAlign: "center", padding: "20px 20px 16px" }}>
                <div style={{ ...ss.avatar, width: 56, height: 56, fontSize: 20, margin: "0 auto 12px" }}>{initials}</div>
                {editingName ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveName()}
                      autoFocus
                      style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 8, padding: "7px 10px", color: "white", fontSize: 13, outline: "none" }} />
                    <button onClick={saveName} style={{ background: "#6366f1", border: "none", borderRadius: 8, color: "white", padding: "7px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Save</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 2px" }}>{displayName}</p>
                    <button onClick={() => { setEditingName(true); setNameInput(displayName); }}
                      style={{ background: "none", border: "none", color: "#818cf8", fontSize: 12, cursor: "pointer", padding: 0 }}>
                      ✏️ Change display name
                    </button>
                  </div>
                )}
              </div>

              <div style={ss.profileDivider} />

              {/* Profile options */}
              <div style={{ padding: "8px" }}>
                {[
                  { icon: "🌙", label: "Dark Mode", note: "Always on" },
                  { icon: "🔒", label: "Security", note: "JWT protected" },
                  { icon: "📊", label: "Your data", note: "Private & secure" },
                ].map((item, i) => (
                  <div key={i} style={ss.profileRow}>
                    <span>{item.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, color: "#94a3b8" }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: "#334155" }}>{item.note}</span>
                  </div>
                ))}
              </div>

              <div style={ss.profileDivider} />

              <div style={{ padding: "8px" }}>
                <motion.button onClick={logout} whileHover={{ background: "rgba(239,68,68,0.15)" }}
                  style={ss.logoutBtn}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

const ss = {
  sidebar: { position: "fixed", top: 0, left: 0, width: 248, height: "100vh", background: "rgba(6,4,15,0.98)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", padding: "22px 14px 20px", zIndex: 100, overflowY: "auto" },
  sidebarGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 22 },
  logoMark: { width: 36, height: 36, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", flexShrink: 0 },
  logoText: { fontSize: 19, fontWeight: 900, background: "linear-gradient(135deg, #c7d2fe, #a5b4fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-0.04em" },
  divider: { height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, marginBottom: 1, position: "relative", transition: "background 0.2s" },
  navLinkActive: { background: "rgba(99,102,241,0.1)" },
  activePill: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "linear-gradient(180deg, #6366f1, #a855f7)", borderRadius: 100 },
  navIcon: { width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, cursor: "pointer", transition: "background 0.2s" },
  avatar: { width: 34, height: 34, background: "linear-gradient(135deg, #6366f1, #22c55e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 700, color: "white", margin: 0, textTransform: "capitalize" },
  userSub: { fontSize: 11, color: "#334155", margin: "2px 0 0" },
  profilePanel: { position: "absolute", bottom: "calc(100% + 10px)", left: 0, right: 0, background: "#0d0b1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, boxShadow: "0 -20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)", zIndex: 200, overflow: "hidden" },
  profileDivider: { height: 1, background: "rgba(255,255,255,0.05)" },
  profileRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "background 0.2s" },
};

export default App;
