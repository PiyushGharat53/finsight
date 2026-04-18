import React, { useState } from "react";

function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

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

      console.log("AUTH RESPONSE:", data);

      // ✅ HANDLE BOTH msg AND message
      if (!res.ok) {
        alert(data.message || data.msg || "Something went wrong");
        setLoading(false);
        return;
      }

      // ✅ LOGIN FLOW
      if (isLogin) {
        if (!data.token) {
          alert("Token not received from server");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);

        console.log("TOKEN SAVED:", data.token);

        // 🔥 HARD REDIRECT (fixes routing issues)
        window.dispatchEvent(new Event("loginSuccess"));
      }

      // ✅ SIGNUP FLOW
      else {
        alert("Account created successfully ✅ Now login");

        setIsLogin(true);
        setName("");
        setEmail("");
        setPassword("");
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={container}>
      <h1>🚀 FinSight</h1>

      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

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

      <button onClick={handleSubmit} style={button} disabled={loading}>
        {loading
          ? "Please wait..."
          : isLogin
          ? "Login"
          : "Create Account"}
      </button>

      <p
        style={{ marginTop: "10px", cursor: "pointer" }}
        onClick={() => {
          setIsLogin(!isLogin);
          setName("");
          setEmail("");
          setPassword("");
        }}
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