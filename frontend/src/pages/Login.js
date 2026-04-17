import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async (e) => {
  e.preventDefault(); // 🔥 THIS LINE IS CRITICAL
    console.log("🔥 LOGIN CLICKED");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      console.log("📡 REQUEST SENT");

      const data = await res.json();

      console.log("📦 RESPONSE:", data);

if (res.ok) {
localStorage.setItem("token", data.token);
window.location.href = "/";
}else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.log("💥 ERROR:", err);
      alert("Server error");
    }
  };

  return (
    <div style={container}>
      <h1>🔐 Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={input}
      />

      <button type="button" onClick={handleLogin} style={btn}>
        Login
      </button>
    </div>
  );
}

export default Login;

// styles
const container = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  color: "white",
};

const input = {
  margin: "10px",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  width: "250px",
};

const btn = {
  padding: "10px",
  borderRadius: "10px",
  background: "#22c55e",
  border: "none",
  color: "white",
  cursor: "pointer",
};