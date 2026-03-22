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

  // 🔥 FETCH TRANSACTIONS FROM BACKEND
  const fetchData = () => {
    fetch("https://finsight-erku.onrender.com/api/transactions/history")
      .then(res => res.json())
      .then(data => {
        setTransactions(data || []);
      })
      .catch(err => console.log(err));
  };

  // 🔥 CORRECT AI CALL (BACKEND)
  const generateReply = async (question) => {
    try {
      const res = await fetch("https://finsight-erku.onrender.com/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          transactions
        })
      });

      const data = await res.json();

      return data.reply || "🤖 AI couldn't respond";

    } catch (err) {
      console.log("FRONTEND AI ERROR:", err);
      return "😅 Something went wrong";
    }
  };

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