import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#ef4444", "#a855f7"];

function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch("http://localhost:5000/api/transactions/dashboard", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => setData(data));
  };

  if (!data) return <h2 style={{ color: "white" }}>Loading...</h2>;

  const { allTransactions, totalExpense } = data;

  // 🧠 CATEGORY NORMALIZATION
  const normalizeCategory = (cat) => {
    if (!cat) return "other";
    cat = cat.toLowerCase().trim();

    if (cat.includes("food")) return "food";
    if (cat.includes("travel") || cat.includes("uber")) return "travel";
    if (cat.includes("tech")) return "tech";
    if (cat.includes("bill")) return "bills";

    return cat;
  };

  // 📊 PIE DATA
  let categoryMap = {};

  allTransactions.forEach((t) => {
    if (t.type === "expense") {
      const cat = normalizeCategory(t.category);
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += t.amount;
    }
  });

  const pieData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key]
  }));

  // 📈 MONTHLY TREND
  let monthlyMap = {};

  allTransactions.forEach((t) => {
    const date = new Date(t.date);
    const month = date.toLocaleString("default", { month: "short" });

    if (!monthlyMap[month]) {
      monthlyMap[month] = { month, income: 0, expense: 0 };
    }

    if (t.type === "income") {
      monthlyMap[month].income += t.amount;
    } else {
      monthlyMap[month].expense += t.amount;
    }
  });

  const lineData = Object.values(monthlyMap);

  // 🧠 AI INSIGHTS
  let insights = [];

  let topCategory = "";
  let max = 0;

  for (let cat in categoryMap) {
    if (categoryMap[cat] > max) {
      max = categoryMap[cat];
      topCategory = cat;
    }
  }

  const percent =
    totalExpense > 0 ? ((max / totalExpense) * 100).toFixed(1) : 0;

  if (topCategory) {
    insights.push(`💸 ${percent}% spent on ${topCategory}`);
  }

  if (lineData.length >= 2) {
    const last = lineData[lineData.length - 1].expense;
    const prev = lineData[lineData.length - 2].expense;

    if (last > prev) insights.push("📈 Spending increased this month");
    else insights.push("📉 Spending decreased this month");
  }

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <h1>📊 Analytics</h1>

      {/* 🥧 PIE */}
      <motion.div style={card}>
        <h3>💸 Category Distribution</h3>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 📈 LINE */}
      <motion.div style={card}>
        <h3>📈 Monthly Trend</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />

            <Line type="monotone" dataKey="income" stroke="#22c55e" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 🤖 INSIGHTS */}
      <motion.div style={card}>
        <h3>🤖 Smart Insights</h3>

        {insights.map((item, i) => (
          <div key={i} style={insight}>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// 🎨 STYLES
const card = {
  marginTop: "30px",
  padding: "20px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.05)"
};

const insight = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.08)"
};

export default Analytics;