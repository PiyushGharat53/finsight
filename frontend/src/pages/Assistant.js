import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  { label: "Balance", query: "Show my balance" },
  { label: "Top spending", query: "Where do I spend most?" },
  { label: "Saving rate", query: "What's my saving rate?" },
  { label: "Monthly trend", query: "Show spending trend" },
  { label: "Prediction", query: "Predict my spending" },
  { label: "Full summary", query: "Give me a full financial summary" },
];

// ── Speech Recognition hook ───────────────────────────────────────────────────
function useSpeechRecognition({ onResult, onEnd }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    setSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      onResult(transcript, e.results[e.results.length - 1].isFinal);
    };
    rec.onend = () => { setListening(false); onEnd?.(); };
    rec.onerror = () => { setListening(false); };
    recognitionRef.current = rec;
  }, [onResult, onEnd]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setListening(true);
    recognitionRef.current.start();
  }, [listening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !listening) return;
    recognitionRef.current.stop();
    setListening(false);
  }, [listening]);

  return { listening, supported, startListening, stopListening };
}

// ── Text-to-Speech hook ───────────────────────────────────────────────────────
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = useCallback((text) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[₹*_#`]/g, "").substring(0, 500);
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "en-IN";
    utt.rate = 1.05;
    utt.pitch = 1;
    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Female"))
      || voices.find(v => v.lang.startsWith("en"))
      || voices[0];
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [supported]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, supported, speak, stopSpeaking };
}

// ── Mic button with animated rings ───────────────────────────────────────────
function MicButton({ listening, supported, onClick }) {
  if (!supported) return null;
  return (
    <motion.button onClick={onClick}
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
      title={listening ? "Stop listening" : "Speak your question"}
      style={{
        width: 52, height: 52, borderRadius: 14, border: "none", cursor: "pointer",
        background: listening
          ? "linear-gradient(135deg, #ef4444, #dc2626)"
          : "rgba(99,102,241,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", flexShrink: 0,
        boxShadow: listening ? "0 4px 20px rgba(239,68,68,0.4)" : "0 4px 14px rgba(99,102,241,0.15)",
        transition: "all 0.25s",
      }}>
      {/* Animated pulse rings when listening */}
      {listening && [1, 2, 3].map(i => (
        <motion.div key={i}
          style={{ position: "absolute", inset: 0, borderRadius: 14, border: "2px solid rgba(239,68,68,0.5)" }}
          animate={{ scale: [1, 1.4 + i * 0.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.2, delay: i * 0.22, repeat: Infinity, ease: "easeOut" }} />
      ))}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        stroke={listening ? "white" : "#818cf8"} strokeWidth="2" strokeLinecap="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    </motion.button>
  );
}

// ── Speaker toggle button ─────────────────────────────────────────────────────
function SpeakerButton({ speaking, voiceEnabled, onToggle, onStop, supported }) {
  if (!supported) return null;
  return (
    <motion.button
      onClick={speaking ? onStop : onToggle}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      title={speaking ? "Stop speaking" : voiceEnabled ? "Voice replies ON — click to mute" : "Voice replies OFF — click to enable"}
      style={{
        background: voiceEnabled ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${voiceEnabled ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 100, padding: "5px 12px",
        display: "flex", alignItems: "center", gap: 6,
        cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
      }}>
      {speaking ? (
        // Animated wave bars when speaking
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[0,1,2,3].map(i => (
            <motion.div key={i}
              style={{ width: 3, background: "#4ade80", borderRadius: 2 }}
              animate={{ height: [4, 12, 4] }}
              transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }} />
          ))}
        </div>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={voiceEnabled ? "#4ade80" : "#475569"} strokeWidth="2">
          {voiceEnabled ? (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </>
          ) : (
            <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </>
          )}
        </svg>
      )}
      <span style={{ fontSize: 11, fontWeight: 700, color: voiceEnabled ? "#4ade80" : "#475569", fontFamily: "inherit" }}>
        {speaking ? "Speaking..." : voiceEnabled ? "Voice ON" : "Voice OFF"}
      </span>
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Assistant() {
  const [transactions, setTransactions] = useState([]);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I'm your FinSight AI assistant. I can analyze your transactions and give you personalized financial insights. You can type or use the 🎤 mic button to speak your question!", time: new Date() }
  ]);
  const [typing, setTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [interimText, setInterimText] = useState("");
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Speech recognition — sets input text as user speaks
  const handleSpeechResult = useCallback((transcript, isFinal) => {
    if (isFinal) {
      setInput(transcript);
      setInterimText("");
      // Auto-send after a short pause
      setTimeout(() => {
        if (transcript.trim()) sendMessageRef.current?.(transcript.trim());
      }, 350);
    } else {
      setInterimText(transcript);
    }
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setInterimText("");
  }, []);

  const { listening, supported: micSupported, startListening, stopListening } =
    useSpeechRecognition({ onResult: handleSpeechResult, onEnd: handleSpeechEnd });

  const { speaking, supported: ttsSupported, speak, stopSpeaking } = useSpeech();

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
    stopSpeaking();
    const now = new Date();
    setMessages(prev => [...prev, { type: "user", text: text.trim(), time: now }]);
    setInput("");
    setInterimText("");
    setTyping(true);
    const reply = await generateReply(text.trim());
    setTyping(false);
    setMessages(prev => [...prev, { type: "bot", text: reply, time: new Date() }]);
    if (voiceEnabled) speak(reply);
    inputRef.current?.focus();
  };

  // Keep sendMessage accessible inside the speech callback via ref
  const sendMessageRef = useRef(sendMessage);
  useEffect(() => { sendMessageRef.current = sendMessage; });

  const handleMicClick = () => {
    if (listening) stopListening();
    else startListening();
  };

  const formatTime = (date) => date?.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const hasVoiceFeature = micSupported || ttsSupported;

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

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SpeakerButton
            speaking={speaking}
            voiceEnabled={voiceEnabled}
            onToggle={() => setVoiceEnabled(v => !v)}
            onStop={stopSpeaking}
            supported={ttsSupported}
          />
          <div style={s.txCount}>{transactions.length} transactions loaded</div>
        </div>
      </motion.div>

      {/* Voice status banner */}
      <AnimatePresence>
        {listening && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 10 }}>
            <div style={s.listeningBanner}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Animated mic wave */}
                {[0,1,2,3,4].map(i => (
                  <motion.div key={i} style={{ width: 3, background: "#f87171", borderRadius: 2 }}
                    animate={{ height: [4, 18, 4] }}
                    transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }} />
                ))}
                <span style={{ fontSize: 13, color: "#f87171", fontWeight: 700 }}>
                  {interimText ? `"${interimText}"` : "Listening... speak now"}
                </span>
              </div>
              <motion.button onClick={stopListening} whileHover={{ scale: 1.05 }}
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#f87171", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
                Stop
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

              <div style={{ ...s.bubble, ...(msg.type === "user" ? s.userBubble : s.botBubble), maxWidth: "75%", position: "relative" }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{msg.text}</p>
                {/* Speak this message button on bot messages */}
                {msg.type === "bot" && ttsSupported && (
                  <motion.button
                    onClick={() => speaking ? stopSpeaking() : speak(msg.text)}
                    whileHover={{ opacity: 1 }}
                    title="Read aloud"
                    style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", cursor: "pointer", opacity: 0.35, padding: 4, borderRadius: 6, color: "var(--text)", transition: "opacity 0.2s" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  </motion.button>
                )}
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
        <MicButton listening={listening} supported={micSupported} onClick={handleMicClick} />

        <div style={{ flex: 1, position: "relative" }}>
          <input ref={inputRef} value={interimText || input}
            onChange={e => { if (!listening) setInput(e.target.value); }}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && !listening && sendMessage(input)}
            placeholder={listening ? "Listening..." : "Ask about your finances, or tap 🎤 to speak..."}
            readOnly={listening}
            style={{
              ...s.inputBox,
              borderColor: listening ? "rgba(239,68,68,0.4)" : undefined,
              fontStyle: interimText ? "italic" : "normal",
            }} />
          {interimText && (
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#64748b" }}>
              processing...
            </span>
          )}
        </div>

        <motion.button onClick={() => sendMessage(input)} disabled={!input.trim() || typing || listening}
          whileHover={input.trim() && !typing && !listening ? { scale: 1.04, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" } : {}}
          whileTap={input.trim() && !typing && !listening ? { scale: 0.96 } : {}}
          style={{ ...s.sendBtn, opacity: !input.trim() || typing || listening ? 0.5 : 1, cursor: !input.trim() || typing || listening ? "not-allowed" : "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </motion.button>
      </motion.div>

      {/* Voice not supported notice */}
      {!hasVoiceFeature && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#334155", margin: "8px 0 0" }}>
          💡 Voice features work best in Chrome or Edge
        </p>
      )}
    </div>
  );
}

const s = {
  page: { padding: "28px", color: "var(--text)", fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 0px)", boxSizing: "border-box" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexShrink: 0 },
  botAvatar: { width: 50, height: 50, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)", borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(99,102,241,0.35)", flexShrink: 0 },
  title: { fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  onlineRow: { display: "flex", alignItems: "center", gap: 6, marginTop: 3 },
  onlineDot: { width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" },
  onlineText: { fontSize: 12, color: "#475569" },
  txCount: { background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "5px 12px", fontSize: 12, color: "#818cf8" },
  listeningBanner: { background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  chips: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, flexShrink: 0 },
  chip: { background: "var(--surface)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 100, padding: "7px 14px", color: "#94a3b8", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap" },
  chatArea: { flex: 1, overflowY: "auto", background: "var(--surface)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: "24px", marginBottom: 12, minHeight: 0 },
  botAvatarSm: { width: 22, height: 22, background: "linear-gradient(135deg, #4f46e5, #a855f7)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  bubble: { padding: "12px 16px", borderRadius: 14, wordBreak: "break-word" },
  botBubble: { background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text)", borderBottomLeftRadius: 4 },
  userBubble: { background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "white", borderBottomRightRadius: 4 },
  timeStamp: { fontSize: 10, color: "#334155", marginTop: 4, paddingLeft: 2 },
  typingDots: { display: "flex", gap: 4, padding: "4px 0", alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#64748b" },
  inputRow: { display: "flex", gap: 10, flexShrink: 0 },
  inputBox: { width: "100%", padding: "14px 18px", background: "var(--surface)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, color: "var(--text)", fontSize: 15, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s", boxSizing: "border-box" },
  sendBtn: { width: 52, height: 52, background: "linear-gradient(135deg, #4f46e5, #a855f7)", border: "none", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", flexShrink: 0 },
};

export default Assistant;