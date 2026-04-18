import React, { useEffect, useState } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      const token = localStorage.getItem("token");

const res = await axios.get(
  "https://finsight-erku.onrender.com/api/transactions/history",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

setTransactions(res.data);

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      const data = await res.json();
      console.log("HISTORY:", data);

      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchHistory();

    // 🔥 THIS FIXES YOUR ISSUE
    window.addEventListener("transactionAdded", fetchHistory);

    return () => {
      window.removeEventListener("transactionAdded", fetchHistory);
    };
  }, []);

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>📜 History</h1>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        transactions.map((t) => (
          <div key={t._id} style={card}>
            <div>
              <strong>{t.category}</strong>
              <p>{new Date(t.date).toLocaleDateString()}</p>
            </div>

            <span style={{
              color: t.type === "income" ? "#22c55e" : "#ef4444"
            }}>
              ₹{t.amount}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default History;

const card = {
  marginTop: "10px",
  padding: "15px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.05)",
  display: "flex",
  justifyContent: "space-between"
};