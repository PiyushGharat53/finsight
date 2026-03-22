import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

function Assistant() {
  const [transactions, setTransactions] = useState([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "👋 Hey! I can analyze your finances. Try tapping a suggestion 👇" }
  ]);
  const [typing, setTyping] = useState(false);

  const chatRef = useRef(null);

  const suggestions = [
    "Show my balance",
    "Where do I spend most?",
    "Saving rate",
    "Spending trend",
    "Predict spending",
    "Full summary"
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, typing]);

  const fetchData = () => {
    fetch("https://finsight-erku.onrender.com/api/ai", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.allTransactions || []);
      })
      .catch(err => console.log(err));
  };

  // 🔥 HYBRID AI FUNCTION
  const generateReply = async (question) => {
    const q = question.toLowerCase();

    if (!transactions.length) {
      return "😅 No data yet bro, add some transactions first!";
    }

    let income = 0;
    let expense = 0;
    let categoryMap = {};

    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      if (t.type === "expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const balance = income - expense;

    let topCategory = "N/A";
    let max = 0;

    for (let cat in categoryMap) {
      if (categoryMap[cat] > max) {
        max = categoryMap[cat];
        topCategory = cat;
      }
    }

    // ✅ LOGIC PART FIRST
    if (q.match(/balance|money|left/)) {
      const replies = [
        `💰 You have ₹${balance} left`,
        `📊 Your balance is ₹${balance}`,
        balance < 0
          ? `⚠️ You're overspending! ₹${balance}`
          : `🔥 Nice! ₹${balance} remaining`
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    if (q.match(/income|earn/)) {
      return `💵 Your total income is ₹${income}`;
    }

    if (q.match(/expense|spend/)) {
      return `💸 You spent ₹${expense}`;
    }

    if (q.match(/most|category/)) {
      return `🔥 You spend most on "${topCategory}"`;
    }

    // 🤖 AI FALLBACK
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: "Bearer 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",
          "Content-Type": "application/json"
        },
body: JSON.stringify({
  model: "openrouter/auto",
  messages: [
    {
      role: "system",
      content: "You are a smart finance assistant. Give helpful, short answers."
    },
    {
      role: "user",
      content: question
    }
  ]
})
      });

      const data = await res.json();

      return data?.choices?.[0]?.message?.content || "🤖 AI couldn't respond";

    } catch (err) {
      console.log(err);

      const fallback = [
        "🤔 Try asking about balance or spending",
        "💡 Ask me something about your money",
        "😅 Something went wrong, try again"
      ];

      return fallback[Math.floor(Math.random() * fallback.length)];
    }
  };

  // 🔥 IMPORTANT FIX (ASYNC)
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { type: "user", text }]);
    setInput("");
    setTyping(true);

    const reply = await generateReply(text);

    setTyping(false);
    setMessages(prev => [...prev, { type: "bot", text: reply }]);
  };

  const handleAsk = () => {
    sendMessage(input);
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>🤖 AI Assistant</h1>

      <div style={suggestionContainer}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => handleSuggestion(s)} style={suggestionBtn}>
            {s}
          </button>
        ))}
      </div>

      <div
        ref={chatRef}
        style={{
          height: "420px",
          overflowY: "auto",
          padding: "20px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.05)"
        }}
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
              marginBottom: "10px"
            }}
          >
            <div style={{
              padding: "10px 15px",
              borderRadius: "15px",
              maxWidth: "60%",
              background: msg.type === "user" ? "#3b82f6" : "rgba(255,255,255,0.1)"
            }}>
              {msg.text}
            </div>
          </motion.div>
        ))}

        {typing && (
          <div style={{ marginTop: "10px" }}>
            <div style={{
              padding: "10px",
              borderRadius: "15px",
              background: "rgba(255,255,255,0.1)"
            }}>
              Typing...
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", marginTop: "20px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "none"
          }}
        />

        <button
          onClick={handleAsk}
          style={{
            marginLeft: "10px",
            padding: "12px 20px",
            borderRadius: "10px",
            background: "#22c55e",
            border: "none",
            color: "white"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Assistant;

const suggestionContainer = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "15px"
};

const suggestionBtn = {
  background: "#1e293b",
  color: "#cbd5f5",
  border: "1px solid #334155",
  padding: "8px 12px",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "13px"
};