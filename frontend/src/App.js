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


// ── Subtle animated canvas — nodes + connecting lines ─────────────────────────
// Elegant background: fewer nodes, lower opacity, slower than Login page.
function AppCanvas({ dark }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const NODES = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.4 + 0.3,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      NODES.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      const dotAlpha = dark ? 0.28 : 0.2;
      const lineBase = dark ? 0.09 : 0.06;
      NODES.forEach((a, i) => {
        NODES.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99,102,241,${lineBase * (1 - d / 140)})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        });
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${dotAlpha})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [dark]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

const API = "https://finsight-erku.onrender.com";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { to: "/add", label: "Add", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { to: "/analytics", label: "Analytics", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { to: "/history", label: "History", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { to: "/assistant", label: "Assistant", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
];

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function AvatarCircle({ src, initials, size = 34, fontSize = 13, style = {} }) {
  if (src) {
    return (
      <img src={src} alt="avatar"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(99,102,241,0.4)", ...style }}
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, background: "linear-gradient(135deg, #6366f1, #22c55e)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 800, color: "white", flexShrink: 0, ...style }}>
      {initials}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");

  // Apply theme to <html data-theme> so CSS vars work everywhere
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Also set on mount immediately
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved !== "light";
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

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
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", transition: "background 0.3s", position: "relative" }}>
          <AppCanvas dark={dark} />
          <Sidebar dark={dark} setDark={setDark} />
          <main style={{ flex: 1, marginLeft: 248, minHeight: "100vh", overflowY: "auto", position: "relative", zIndex: 1 }}>
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

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ dark, setDark }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(localStorage.getItem("userName") || "User");
  const [avatarSrc, setAvatarSrc] = useState(localStorage.getItem("userAvatar") || "");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "ok" });
  const panelRef = useRef(null);
  const fileRef = useRef(null);

  // Fetch profile from server on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.user?.name) { setDisplayName(d.user.name); localStorage.setItem("userName", d.user.name); }
        if (d?.user?.avatar) { setAvatarSrc(d.user.avatar); localStorage.setItem("userAvatar", d.user.avatar); }
      })
      .catch(() => {});
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const fn = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U";

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 2800);
  };

  // Save display name to DB
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
        showToast("✅ Name saved!", "ok");
      } else {
        showToast("❌ Failed to save", "err");
      }
    } catch { showToast("❌ Server error", "err"); }
    setSavingName(false);
    setEditingName(false);
  };

  // Upload avatar - triggered by file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Reset input so same file can be picked again
    e.target.value = "";

    if (file.size > 600000) { showToast("⚠️ Max 600KB — use a smaller image", "err"); return; }
    if (!file.type.startsWith("image/")) { showToast("⚠️ Please select an image file", "err"); return; }

    setUploadingPhoto(true);
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
          showToast("✅ Photo updated!", "ok");
        } else {
          showToast("❌ Upload failed", "err");
        }
      } catch { showToast("❌ Server error", "err"); }
      setUploadingPhoto(false);
    };
    reader.onerror = () => { showToast("❌ Couldn't read file", "err"); setUploadingPhoto(false); };
    reader.readAsDataURL(file);
  };

  const removeAvatar = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar: "" }),
      });
      if (res.ok) { setAvatarSrc(""); localStorage.setItem("userAvatar", ""); showToast("✅ Photo removed", "ok"); }
    } catch { showToast("❌ Failed", "err"); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userAvatar");
    window.dispatchEvent(new Event("logout"));
  };

  const toggleTheme = () => setDark(d => !d);

  return (
    <motion.aside initial={{ x: -248 }} animate={{ x: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={ss.sidebar}>

      {/* Hidden file input — single source of truth */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange} style={{ display: "none" }} />

      <div style={ss.topGlow} />

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
      <nav style={ss.nav}>
        {NAV_LINKS.map(link => (
          <NavLink key={link.to} to={link.to} end={link.to === "/"}
            style={({ isActive }) => ({ ...ss.navLink, background: isActive ? "rgba(99,102,241,0.12)" : "transparent" })}>
            {({ isActive }) => (
              <>
                {isActive && <motion.div layoutId="pill" style={ss.activePill} />}
                <span style={{ ...ss.navIcon, color: isActive ? "#a5b4fc" : "var(--text-secondary)" }}>{link.icon}</span>
                <span style={{ color: isActive ? "var(--text)" : "var(--text-secondary)", fontWeight: isActive ? 700 : 500 }}>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={ss.divider} />

      {/* Toast */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div initial={{ opacity: 0, y: 4, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", margin: "4px 0" }}>
            <div style={{ padding: "8px 12px", background: toast.type === "ok" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 8, fontSize: 12, color: toast.type === "ok" ? "#4ade80" : "#f87171", textAlign: "center" }}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile button */}
      <div ref={panelRef} style={{ position: "relative", flexShrink: 0 }}>
        <motion.button onClick={() => setProfileOpen(p => !p)}
          whileHover={{ background: "var(--surface-hover)" }}
          style={ss.profileBtn}>
          <AvatarCircle src={avatarSrc} initials={initials} size={34} />
          <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize" }}>{displayName}</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>View profile</p>
          </div>
          <motion.span animate={{ rotate: profileOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </motion.span>
        </motion.button>

        {/* Profile panel — opens UPWARD */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }} transition={{ duration: 0.18 }}
              style={ss.profilePanel}>

              {/* Avatar + name section */}
              <div style={{ padding: "20px 18px 16px", textAlign: "center" }}>
                {/* Big avatar with upload overlay */}
                <div style={{ position: "relative", display: "inline-block", marginBottom: 14 }}>
                  {uploadingPhoto ? (
                    <div style={{ width: 68, height: 68, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        style={{ width: 24, height: 24, border: "2px solid rgba(99,102,241,0.3)", borderTop: "2px solid #6366f1", borderRadius: "50%" }} />
                    </div>
                  ) : (
                    <AvatarCircle src={avatarSrc} initials={initials} size={68} fontSize={24} />
                  )}
                  {/* Pencil button triggers file picker */}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => fileRef.current?.click()}
                    title="Change profile photo"
                    style={{ position: "absolute", bottom: 0, right: -2, width: 24, height: 24, background: "#6366f1", border: `2px solid var(--panel-bg)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </motion.button>
                </div>

                {/* Name edit */}
                {editingName ? (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                      autoFocus
                      placeholder="Your name"
                      style={{
                        flex: 1, padding: "8px 10px",
                        background: "var(--input-bg)",
                        border: "1.5px solid rgba(99,102,241,0.5)",
                        borderRadius: 9, color: "var(--text)", fontSize: 13,
                        outline: "none", fontFamily: "inherit", minWidth: 0,
                      }}
                    />
                    <motion.button onClick={saveName} disabled={savingName}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      style={{ padding: "8px 12px", background: "#6366f1", border: "none", borderRadius: 9, color: "white", cursor: savingName ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", opacity: savingName ? 0.65 : 1, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {savingName ? "..." : "Save"}
                    </motion.button>
                    <button onClick={() => setEditingName(false)}
                      style={{ padding: "8px 10px", background: "none", border: "1px solid var(--border-strong)", borderRadius: 9, color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px", textTransform: "capitalize" }}>{displayName}</p>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => { setEditingName(true); setNameInput(displayName); }} style={ss.chip}>✏️ Edit name</button>
                      <button onClick={() => fileRef.current?.click()} style={ss.chip}>📷 Change photo</button>
                      {avatarSrc && <button onClick={removeAvatar} style={{ ...ss.chip, borderColor: "rgba(239,68,68,0.3)", color: "#f87171" }}>🗑️ Remove</button>}
                    </div>
                  </div>
                )}
              </div>

              <div style={ss.panelDivider} />

              {/* Settings */}
              <div style={{ padding: "8px 10px" }}>

                {/* Dark / Light mode */}
                <div style={ss.settingRow}>
                  <span style={{ fontSize: 16 }}>{dark ? "🌙" : "☀️"}</span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>{dark ? "Dark mode" : "Light mode"}</span>
                  <motion.div onClick={toggleTheme}
                    style={{ width: 44, height: 26, borderRadius: 100, background: dark ? "#6366f1" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", flexShrink: 0 }}
                    whileTap={{ scale: 0.95 }}>
                    <motion.div animate={{ x: dark ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{ width: 20, height: 20, background: "white", borderRadius: "50%", position: "absolute", top: 3, boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
                  </motion.div>
                </div>

                <div style={ss.settingRow}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>Security</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>JWT protected</span>
                </div>

                <div style={ss.settingRow}>
                  <span style={{ fontSize: 16 }}>🛡️</span>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>Data privacy</span>
                  <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>Private</span>
                </div>
              </div>

              <div style={ss.panelDivider} />

              {/* Sign out */}
              <div style={{ padding: "8px 10px 10px" }}>
                <motion.button onClick={logout} whileHover={{ background: "rgba(239,68,68,0.15)" }}
                  style={ss.logoutBtn}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
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
  sidebar: {
    position: "fixed", top: 0, left: 0, width: 248, height: "100vh",
    background: "var(--sidebar-bg)",
    backdropFilter: "blur(24px)",
    borderRight: "1px solid var(--sidebar-border)",
    display: "flex", flexDirection: "column",
    padding: "20px 14px 16px",
    zIndex: 100, boxSizing: "border-box", overflow: "hidden",
    transition: "background 0.3s, border-color 0.3s",
  },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)", pointerEvents: "none" },
  logoRow: { display: "flex", alignItems: "center", gap: 10, padding: "0 8px", marginBottom: 18, flexShrink: 0 },
  logoMark: { width: 36, height: 36, background: "linear-gradient(135deg,#4f46e5,#7c3aed,#a855f7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", flexShrink: 0 },
  logoText: { fontSize: 19, fontWeight: 900, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#818cf8,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  divider: { height: 1, background: "var(--border)", margin: "6px 0", flexShrink: 0 },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", minHeight: 0 },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 500, marginBottom: 1, position: "relative", transition: "background 0.2s" },
  activePill: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 22, background: "linear-gradient(180deg,#6366f1,#a855f7)", borderRadius: 100 },
  navIcon: { width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  profileBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, cursor: "pointer", transition: "background 0.2s", flexShrink: 0 },
  profilePanel: {
    position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
    background: "var(--panel-bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: 16,
    boxShadow: "0 -24px 60px rgba(0,0,0,0.35), 0 4px 20px rgba(0,0,0,0.15)",
    zIndex: 200,
    maxHeight: "calc(100vh - 130px)",
    overflowY: "auto",
    transition: "background 0.3s",
  },
  panelDivider: { height: 1, background: "var(--border)", margin: "2px 0" },
  chip: { background: "none", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, color: "#818cf8", fontSize: 11, cursor: "pointer", padding: "4px 10px", fontFamily: "inherit", transition: "all 0.15s" },
  settingRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderRadius: 8 },
  logoutBtn: { display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 10, color: "#f87171", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", transition: "background 0.2s" },
};

export default App;