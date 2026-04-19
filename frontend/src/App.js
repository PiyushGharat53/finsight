import { HashRouter as Router, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Login from "./pages/Login";
import Assistant from "./pages/Assistant";
import Welcome from "./pages/Welcome";

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ dark: true, toggle: () => {} });

const DARK = {
  bg: "linear-gradient(145deg, #06040f 0%, #0c0920 40%, #100b28 100%)",
  sidebar: "rgba(6,4,15,0.98)",
  sidebarBorder: "rgba(255,255,255,0.05)",
  panel: "#0d0b1e",
  panelBorder: "rgba(255,255,255,0.08)",
  navActive: "rgba(99,102,241,0.1)",
  text: "white",
  subText: "#64748b",
  divider: "rgba(255,255,255,0.05)",
  navInactive: "#64748b",
};

const LIGHT = {
  bg: "linear-gradient(145deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)",
  sidebar: "rgba(255,255,255,0.97)",
  sidebarBorder: "rgba(99,102,241,0.12)",
  panel: "#ffffff",
  panelBorder: "rgba(99,102,241,0.12)",
  navActive: "rgba(99,102,241,0.08)",
  text: "#0f0c29",
  subText: "#94a3b8",
  divider: "rgba(0,0,0,0.06)",
  navInactive: "#94a3b8",
};

const API = "https://finsight-erku.onrender.com";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: "/add", label: "Add", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { to: "/analytics", label: "Analytics", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { to: "/history", label: "History", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { to: "/assistant", label: "Assistant", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");

  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

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

  const theme = dark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ dark, toggle: toggleTheme, theme }}>
      <Router>
        {!token ? (
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, transition: "background 0.3s" }}>
            <Sidebar theme={theme} dark={dark} toggleTheme={toggleTheme} />
            <main style={{ flex: 1, marginLeft: 248, minHeight: "100vh", overflowY: "auto", transition: "background 0.3s" }}>
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
    </ThemeContext.Provider>
  );
}

// ─── AVATAR CIRCLE ────────────────────────────────────────────────────────────
function Avatar({ src, initials, size = 34, fontSize = 13 }) {
  if (src) {
    return <img src={src} alt="avatar" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(99,102,241,0.4)" }} />;
  }
  return (
    <div style={{ width: size, height: size, background: "linear-gradient(135deg, #6366f1, #22c55e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 800, color: "white", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ theme, dark, toggleTheme }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(localStorage.getItem("userName") || "User");
  const [avatarSrc, setAvatarSrc] = useState(localStorage.getItem("userAvatar") || "");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [savingName, setSavingName] = useState(false);
  const [toast, setToast] = useState("");
  const panelRef = useRef(null);
  const fileRef = useRef(null);

  // On mount, fetch fresh profile from server so name is always up to date
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.user?.name) {
          setDisplayName(d.user.name);
          localStorage.setItem("userName", d.user.name);
        }
        if (d.user?.avatar) {
          setAvatarSrc(d.user.avatar);
          localStorage.setItem("userAvatar", d.user.avatar);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Save name to DB + localStorage
  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setDisplayName(data.user.name);
        localStorage.setItem("userName", data.user.name);
        showToast("✅ Name updated!");
      } else {
        showToast("❌ Failed to save");
      }
    } catch {
      showToast("❌ Server error");
    }
    setSavingName(false);
    setEditingName(false);
  };

  // Handle avatar image upload (base64, stored in DB)
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { showToast("⚠️ Image must be under 500KB"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/auth/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (res.ok) {
          setAvatarSrc(base64);
          localStorage.setItem("userAvatar", base64);
          showToast("✅ Photo updated!");
        }
      } catch { showToast("❌ Upload failed"); }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: "" }),
      });
      setAvatarSrc("");
      localStorage.setItem("userAvatar", "");
      showToast("✅ Photo removed");
    } catch { showToast("❌ Failed"); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
    window.dispatchEvent(new Event("logout"));
  };

  const t = theme; // shorthand

  return (
    <motion.aside initial={{ x: -248 }} animate={{ x: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ ...ss.sidebar, background: t.sidebar, borderColor: t.sidebarBorder }}>

      <div style={{ ...ss.sidebarGlow, opacity: dark ? 1 : 0.4 }} />

      {/* Logo */}
      <div style={ss.logoRow}>
        <div style={ss.logoMark}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.09 12.11a1 1 0 00.82 1.63h6.18L4 22l16.91-11.11A1 1 0 0020.09 9.26H13.91L20 2H13z" fill="white" />
          </svg>
        </div>
        <span style={{ ...ss.logoText, background: dark ? "linear-gradient(135deg,#c7d2fe,#a5b4fc)" : "linear-gradient(135deg,#4f46e5,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>FinSight</span>
      </div>

      <div style={{ ...ss.divider, background: t.divider }} />

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", minHeight: 0 }}>
        {NAV_LINKS.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"}
            style={({ isActive }) => ({
              ...ss.navLink,
              background: isActive ? t.navActive : "transparent",
            })}>
            {({ isActive }) => (
              <>
                {isActive && <motion.div layoutId="activePill" style={ss.activePill} />}
                <span style={{ ...ss.navIcon, color: isActive ? "#a5b4fc" : t.navInactive }}>{link.icon}</span>
                <span style={{ color: isActive ? t.text : t.navInactive, fontWeight: isActive ? 700 : 500 }}>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ ...ss.divider, background: t.divider, marginTop: 8 }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ margin: "6px 0", padding: "8px 12px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, fontSize: 12, color: "#a5b4fc", textAlign: "center" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile button + panel */}
      <div ref={panelRef} style={{ position: "relative", flexShrink: 0 }}>
        <motion.button onClick={() => setProfileOpen(!profileOpen)}
          whileHover={{ background: dark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.06)" }}
          style={{ ...ss.profileBtn, background: dark ? "rgba(255,255,255,0.03)" : "rgba(99,102,241,0.04)", border: `1px solid ${t.sidebarBorder}` }}>
          <Avatar src={avatarSrc} initials={initials} size={34} />
          <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
            <p style={{ ...ss.userName, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
            <p style={{ ...ss.userSub, color: t.subText }}>View profile</p>
          </div>
          <motion.div animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.subText} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {profileOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }} transition={{ duration: 0.2 }}
              style={{ ...ss.profilePanel, background: t.panel, borderColor: t.panelBorder }}>

              {/* Avatar section */}
              <div style={{ padding: "20px 20px 16px", textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
                  <Avatar src={avatarSrc} initials={initials} size={64} fontSize={22} />
                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => fileRef.current?.click()}
                    style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, background: "#6366f1", border: "2px solid" + (dark ? "#0d0b1e" : "white"), borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </motion.button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />

                {editingName ? (
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveName()} autoFocus
                      style={{ flex: 1, background: dark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 8, padding: "7px 10px", color: t.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                    <button onClick={saveName} disabled={savingName}
                      style={{ background: "#6366f1", border: "none", borderRadius: 8, color: "white", padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700, opacity: savingName ? 0.6 : 1 }}>
                      {savingName ? "..." : "Save"}
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => { setEditingName(true); setNameInput(displayName); }}
                        style={chipBtn}>✏️ Edit name</button>
                      <button onClick={() => fileRef.current?.click()} style={chipBtn}>📷 Change photo</button>
                      {avatarSrc && <button onClick={removeAvatar} style={{ ...chipBtn, color: "#f87171" }}>🗑️ Remove</button>}
                    </div>
                  </>
                )}
              </div>

              <div style={{ height: 1, background: t.divider }} />

              {/* Settings rows */}
              <div style={{ padding: "10px 10px 6px" }}>

                {/* Dark / Light mode toggle */}
                <div style={profileRowStyle}>
                  <span style={{ fontSize: 16 }}>{dark ? "🌙" : "☀️"}</span>
                  <span style={{ flex: 1, fontSize: 13, color: t.subText }}>{dark ? "Dark mode" : "Light mode"}</span>
                  <motion.button onClick={toggleTheme}
                    style={{ width: 42, height: 24, borderRadius: 100, background: dark ? "#6366f1" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", padding: 0, flexShrink: 0 }}
                    whileTap={{ scale: 0.95 }}>
                    <motion.div animate={{ x: dark ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ width: 18, height: 18, background: "white", borderRadius: "50%", position: "absolute", top: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                  </motion.button>
                </div>

                {/* Joined date */}
                <div style={profileRowStyle}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <span style={{ flex: 1, fontSize: 13, color: t.subText }}>Member since</span>
                  <span style={{ fontSize: 11, color: dark ? "#334155" : "#94a3b8" }}>2026</span>
                </div>

                {/* Security */}
                <div style={profileRowStyle}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <span style={{ flex: 1, fontSize: 13, color: t.subText }}>Security</span>
                  <span style={{ fontSize: 11, color: dark ? "#334155" : "#94a3b8" }}>JWT protected</span>
                </div>

                {/* Data */}
                <div style={profileRowStyle}>
                  <span style={{ fontSize: 16 }}>🛡️</span>
                  <span style={{ flex: 1, fontSize: 13, color: t.subText }}>Data privacy</span>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>Private</span>
                </div>
              </div>

              <div style={{ height: 1, background: t.divider }} />

              <div style={{ padding: "8px 10px 10px" }}>
                <motion.button onClick={logout} whileHover={{ background: "rgba(239,68,68,0.15)" }}
                  style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 10, color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "background 0.2s" }}>
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

const chipBtn = {
  background: "none", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 100,
  color: "#818cf8", fontSize: 11, cursor: "pointer", padding: "4px 10px", fontFamily: "inherit",
};

const profileRowStyle = {
  display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderRadius: 8,
};

const ss = {
  sidebar: {
    position: "fixed", top: 0, left: 0, width: 248, height: "100vh",
    backdropFilter: "blur(24px)", borderRight: "1px solid",
    display: "flex", flexDirection: "column",
    padding: "20px 14px 16px",
    zIndex: 100,
    // Ensure it never overflows the viewport
    boxSizing: "border-box",
    overflow: "hidden",
  },
  sidebarGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)", pointerEvents: "none" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 18, flexShrink: 0 },
  logoMark: { width: 36, height: 36, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", flexShrink: 0 },
  logoText: { fontSize: 19, fontWeight: 900, letterSpacing: "-0.04em" },
  divider: { height: 1, margin: "6px 0", flexShrink: 0 },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 500, marginBottom: 1, position: "relative", transition: "background 0.2s", flexShrink: 0 },
  activePill: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "linear-gradient(180deg, #6366f1, #a855f7)", borderRadius: 100 },
  navIcon: { width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 12, cursor: "pointer", transition: "background 0.2s", flexShrink: 0 },
  userName: { fontSize: 13, fontWeight: 700, margin: 0, textTransform: "capitalize" },
  userSub: { fontSize: 11, margin: "2px 0 0" },
  profilePanel: {
    position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
    border: "1px solid", borderRadius: 16,
    boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
    zIndex: 200, overflow: "hidden",
    // Max height so it doesn't go off screen
    maxHeight: "calc(100vh - 120px)",
    overflowY: "auto",
  },
};

export default App;
