import React, { useEffect, useState } from "react";

function History() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchHistory();

    const handleUpdate = () => fetchHistory();
    window.addEventListener("transactionAdded", handleUpdate);

    return () => {
      window.removeEventListener("transactionAdded", handleUpdate);
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("https://finsight-erku.onrender.com/api/transactions/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.log(err);
      setTransactions([]);
    }
  };

  const categories = [
    "all",
    ...new Set(transactions.map(t => t.category))
  ];

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

  // ✅ FIXED DELETE (with token)
  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(
        `https://finsight-erku.onrender.com/api/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (res.ok) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      } else {
        console.log("Delete failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ FIXED EDIT (with token)
  const editTransaction = async (t) => {
    const newAmount = prompt("Enter new amount", t.amount);
    if (!newAmount) return;

    try {
      await fetch(
        `https://finsight-erku.onrender.com/api/transactions/${t._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            ...t,
            amount: Number(newAmount),
          }),
        }
      );

      fetchHistory();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>📜 History</h1>

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

// styles same as before