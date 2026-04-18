import React, { useState } from "react";

function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSubmit = async () => {
  try {
    const url = isLogin
      ? "https://finsight-erku.onrender.com/api/auth/login"
      : "https://finsight-erku.onrender.com/api/auth/register";

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data); // debug

    if (!res.ok) {
      alert(data.message || "Error");
      return;
    }

    if (isLogin) {
      localStorage.setItem("token", data.token);

      console.log("TOKEN SAVED:", localStorage.getItem("token"));

      // ✅ IMPORTANT FIX
      window.location.href = "/#/";
    } else {
      alert("Account created ✅ Now login");
      setIsLogin(true);
    }

  } catch (err) {
    console.log(err);
    alert("Server error");
  }
};

  return (
    <div style={container}>
      <h1>🚀 FinSight</h1>

      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      {/* SIGNUP ONLY */}
      {!isLogin && (
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={input}
      />

      <button onClick={handleSubmit} style={button}>
        {isLogin ? "Login" : "Create Account"}
      </button>

      <p
        style={{ marginTop: "10px", cursor: "pointer" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </p>
    </div>
  );
}

export default Login;

// styles
const container = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  color: "white"
};

const input = {
  margin: "10px",
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  width: "250px"
};

const button = {
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  background: "#22c55e",
  color: "white",
  cursor: "pointer"
};