import React, { useEffect, useState } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

useEffect(() => {
  fetchHistory();

  // 🔥 listen for new transaction
  const handleUpdate = () => fetchHistory();
  window.addEventListener("transactionAdded", handleUpdate);

  return () => {
    window.removeEventListener("transactionAdded", handleUpdate);
  };
}, []);

const fetchHistory = async () => {
  try {
    const res = await fetch("https://finsight-erku.onrender.com/api/transactions/history");
    const data = await res.json();

    console.log("HISTORY DATA:", data);

    if (Array.isArray(data)) {
      setTransactions([...data]);
    } else {
      setTransactions([]);
    }
  } catch (err) {
    console.log(err);
    setTransactions([]);
  }
};

  // 🔥 UNIQUE CATEGORIES
  const categories = [
    "all",
    ...new Set(transactions.map(t => t.category))
  ];

  // 🔥 FILTER LOGIC
const filtered = transactions.filter((t) => {
  const matchSearch =
    search === "" ||
    (t.category && t.category.toLowerCase().includes(search.toLowerCase()));

  const matchType =
    typeFilter === "all" || t.type === typeFilter;

  const matchCategory =
    categoryFilter === "all" || t.category === categoryFilter;

  return matchSearch && matchType && matchCategory;
});

  // 🔥 DELETE (safe)
  const deleteTransaction = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
      });

      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 EDIT (safe)
  const editTransaction = async (t) => {
    const newAmount = prompt("Enter new amount", t.amount);
    if (!newAmount) return;

    try {
      await fetch(`http://localhost:5000/api/transactions/${t._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...t,
          amount: Number(newAmount),
        }),
      });

      fetchHistory();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>📜 History</h1>

      {/* 🔍 FILTER BAR */}
      <div style={filterBar}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={input}>
          <option value="all">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={input}>
          {categories.map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {filtered.map((t) => (
        <div key={t._id} style={card}>
          <div>
            <strong>{t.category}</strong>
            <p>{new Date(t.date).toLocaleDateString()}</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{
              color: t.type === "income" ? "#22c55e" : "#ef4444"
            }}>
              ₹{t.amount}
            </span>

            <button onClick={() => editTransaction(t)} style={editBtn}>✏️</button>
            <button onClick={() => deleteTransaction(t._id)} style={deleteBtn}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default History;

// 🎨 STYLES
const filterBar = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
  flexWrap: "wrap"
};

const input = {
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#1e1b4b",
  color: "white"
};

const card = {
  marginTop: "10px",
  padding: "15px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.05)",
  display: "flex",
  justifyContent: "space-between"
};

const editBtn = {
  background: "#3b82f6",
  border: "none",
  padding: "4px 8px",
  borderRadius: "6px",
  color: "white",
  fontSize: "12px",
  cursor: "pointer"
};

const deleteBtn = {
  background: "#ef4444",
  border: "none",
  padding: "4px 8px",
  borderRadius: "6px",
  color: "white",
  fontSize: "12px",
  cursor: "pointer"
};