import { Link } from "react-router-dom";

function Welcome() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "#0f0c29",
      color: "white"
    }}>
      <h1>🚀 Welcome to Finsight</h1>

      <div style={{ marginTop: "20px" }}>
        <Link to="/login">
          <button style={btn}>Login</button>
        </Link>

        <Link to="/signup">
          <button style={btn}>Sign Up</button>
        </Link>
      </div>
    </div>
  );
}

const btn = {
  margin: "10px",
  padding: "10px 20px",
  border: "none",
  borderRadius: "8px",
  background: "#6366f1",
  color: "white",
  cursor: "pointer"
};

export default Welcome;