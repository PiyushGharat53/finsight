import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  { label: "Balance", query: "Show my balance" },
  { label: "Top spending", query: "Where do I spend most?" },
  { label: "Saving rate", query: "What's my saving rate?" },
  { label: "Monthly trend", query: "Show spending trend" },
  { label: "Prediction", query: "Predict my spending" },
  { label: "Full summary", query: "Give me a full financial summary" },
];

function Assistant() {
  const [transactions, setTransactions] = useState([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I'm your FinSight AI assistant. I can analyze your transactions and give you personalized financial insights. Try one of the suggestions below or ask me anything.", time: new Date() }
  ]);
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const fetchData = () => {
    fetch("https://finsight-erku.onrender.com/api/transactions/history", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const generateReply = async (question) => {
    try {
      const res = await fetch("https://finsight-erku.onrender.com/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, transactions }),
      });
      const data = await res.json();
      return data.reply || "I couldn't generate a response. Please try again.";
    } catch {
      return "Something went wrong. Please check your connection and try again.";
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const now = new Date();
    setMessages(prev => [...prev, { type: "user", text: text.trim(), time: now }]);
    setInput("");
    setTyping(true);
    const reply = await generateReply(text.trim());
    setTyping(false);
    setMessages(prev => [...prev, { type: "bot", text: reply, time: new Date() }]);
    inputRef.current?.focus();
  };

  const formatTime = (date) => date?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={s.page}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={s.botAvatar}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2z"/>
              <circle cx="9" cy="13" r="1.5" fill="white" stroke="none"/>
              <circle cx="15" cy="13" r="1.5" fill="white" stroke="none"/>
              <path d="M9 17s1 1.5 3 1.5 3-1.5 3-1.5"/>
              <path d="M12 2v2M8 2h8"/>
            </svg>
          </div>
          <div>
            <h1 style={s.title}>AI Assistant</h1>
            <div style={s.onlineRow}>
              <div style={s.onlineDot} />
              <span style={s.onlineText}>Online • Powered by FinSight AI</span>
            </div>
          </div>
        </div>
        <div style={s.txCount}>{transactions.length} transactions loaded</div>
      </motion.div>

      {/* Suggestion chips */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={s.chips}>
        {SUGGESTIONS.map((s_item, i) => (
          <motion.button key={i} onClick={() => sendMessage(s_item.query)}
            whileHover={{ scale: 1.04, borderColor: "rgba(99,102,241,0.5)", background: "rgba(99,102,241,0.12)" }}
            whileTap={{ scale: 0.97 }}
            style={s.chip}>
            {s_item.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Chat area */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        ref={chatRef} style={s.chatArea}>

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", alignItems: msg.type === "user" ? "flex-end" : "flex-start", marginBottom: 18 }}>

              {msg.type === "bot" && (
                <div style={s.botAvatarSm}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2z"/>
                  </svg>
                </div>
              )}

              <div style={{ ...s.bubble, ...(msg.type === "user" ? s.userBubble : s.botBubble), maxWidth: "75%" }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{msg.text}</p>
              </div>
              <span style={s.timeStamp}>{formatTime(msg.time)}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={s.botAvatarSm}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2z"/>
              </svg>
            </div>
            <div style={{ ...s.bubble, ...s.botBubble }}>
              <div style={s.typingDots}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} style={s.dot}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Input row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={s.inputRow}>
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about your finances..."
          style={s.inputBox} />
        <motion.button onClick={() => sendMessage(input)} disabled={!input.trim() || typing}
          whileHover={input.trim() && !typing ? { scale: 1.04, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" } : {}}
          whileTap={input.trim() && !typing ? { scale: 0.96 } : {}}
          style={{ ...s.sendBtn, opacity: !input.trim() || typing ? 0.5 : 1, cursor: !input.trim() || typing ? "not-allowed" : "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

const s = {
  page: { padding: "28px", color: "white", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 0px)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 },
  botAvatar: { width: 50, height: 50, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.35)", flexShrink: 0 },
  title: { fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  onlineRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" },
  onlineText: { fontSize: 12, color: "#475569" },
  txCount: { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "5px 12px", fontSize: 12, color: "#818cf8" },
  chips: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, flexShrink: 0 },
  chip: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 100, padding: "7px 14px", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap" },
  chatArea: { flex: 1, overflowY: "auto", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: "24px", marginBottom: 14, minHeight: 0 },
  botAvatarSm: { width: 22, height: 22, background: "linear-gradient(135deg, #4f46e5, #a855f7)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  bubble: { padding: "12px 16px", borderRadius: 14, wordBreak: "break-word" },
  botBubble: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0", borderBottomLeftRadius: 4 },
  userBubble: { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white", borderBottomRightRadius: 4 },
  timeStamp: { fontSize: 10, color: "#334155", marginTop: 4, paddingLeft: 2 },
  typingDots: { display: "flex", gap: 4, padding: "4px 0", alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#64748b" },
  inputRow: { display: "flex", gap: 10, flexShrink: 0 },
  inputBox: { flex: 1, padding: "14px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, color: "white", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" },
  sendBtn: { width: 52, height: 52, background: "linear-gradient(135deg, #4f46e5, #a855f7)", border: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", flexShrink: 0 },
};

export default Assistant;
