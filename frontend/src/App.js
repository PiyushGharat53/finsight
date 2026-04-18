import { HashRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Login from "./pages/Login";
import Assistant from "./pages/Assistant";
import Welcome from "./pages/Welcome";

function App() {
  const token = localStorage.getItem("token");

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
        <div>

          {/* SIDEBAR */}
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "220px",
            height: "100vh",
            background: "#020617",
            color: "white",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <h2>HydraBolt</h2>

              <div style={{ marginTop: "30px" }}>
                <Link to="/" style={linkStyle}>Dashboard</Link>
                <Link to="/add" style={linkStyle}>Add</Link>
                <Link to="/analytics" style={linkStyle}>Analytics</Link>
                <Link to="/history" style={linkStyle}>History</Link>
                <Link to="/assistant" style={linkStyle}>Assistant</Link>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/#/";
              }}
              style={logoutStyle}
            >
              Logout
            </button>
          </div>

          {/* MAIN */}
          <div style={{
            marginLeft: "220px",
            minHeight: "100vh",
            padding: "20px",
            background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)"
          }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddTransaction />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<History />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

        </div>
      )}
    </Router>
  );
}

const linkStyle = {
  display: "block",
  margin: "12px 0",
  color: "#cbd5f5",
  textDecoration: "none",
  fontWeight: "500"
};

const logoutStyle = {
  padding: "10px",
  border: "none",
  background: "#ef4444",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer"
};

export default App;