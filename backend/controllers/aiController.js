console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY);

// ── TTS via ElevenLabs ────────────────────────────────────────────────────────
const speakTTS = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Clean the text for speech
    const clean = text
      .replace(/[₹*_#`]/g, "")
      .replace(/\n+/g, ". ")
      .substring(0, 1000);

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not set" });
    }

    // "Rachel" — ElevenLabs free voice, clear and natural
    // Voice ID: 21m00Tcm4TlvDq8ikWAM
    // You can change this to any voice from: https://elevenlabs.io/voice-library
    const VOICE_ID = "TYKLc7ViOIGE13dSZYlK";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_turbo_v2", // fastest + cheapest model
          voice_settings: {
            stability: 0.45,        // natural variation
            similarity_boost: 0.82, // stays true to voice
            style: 0.3,             // slight expressiveness
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("ElevenLabs error:", err);
      return res.status(502).json({ error: "TTS service error" });
    }

    // Stream audio directly back to client
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) { res.end(); return; }
      res.write(Buffer.from(value));
      await pump();
    };
    await pump();

  } catch (err) {
    console.error("TTS error:", err);
    res.status(500).json({ error: "TTS failed" });
  }
};

// ── AI Ask ────────────────────────────────────────────────────────────────────
const askAI = async (req, res) => {
  try {
    const { question, transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        reply: "You don't have any transactions yet. Add some transactions first and I'll be able to give you personalized insights!"
      });
    }

    let income = 0;
    let expense = 0;
    const categoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      if (t.type === "expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;

        const month = new Date(t.date || t.createdAt).toLocaleString("en-IN", { month: "short", year: "numeric" });
        monthlyMap[month] = (monthlyMap[month] || 0) + t.amount;
      }
    });

    const balance = income - expense;
    const savingRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;

    let topCategory = "";
    let max = 0;
    for (let cat in categoryMap) {
      if (categoryMap[cat] > max) {
        max = categoryMap[cat];
        topCategory = cat;
      }
    }

    const q = question.toLowerCase();

    // =========================
    // 🧠 LOGIC RESPONSES
    // =========================

    const wantsBalance =
      (q.includes("balance") || q.includes("my balance")) &&
      !q.includes("analysis") && !q.includes("summary") &&
      !q.includes("advice") && !q.includes("tip");

    if (wantsBalance) {
      return res.json({ reply: `💰 Your current balance is ₹${balance.toLocaleString("en-IN")}` });
    }

    const wantsIncome =
      (q === "income" || q.includes("my income") || q.includes("how much income") ||
       q.includes("total income") || q.includes("earned")) &&
      !q.includes("analysis") && !q.includes("summary") && !q.includes("advice");

    if (wantsIncome) {
      return res.json({ reply: `💵 Your total income is ₹${income.toLocaleString("en-IN")}` });
    }

    const wantsExpense =
      (q === "expense" || q === "expenses" || q === "spending" ||
       q.includes("how much did i spend") || q.includes("total expense") ||
       q.includes("total spending") || q.includes("how much have i spent")) &&
      !q.includes("analysis") && !q.includes("summary") && !q.includes("advice") &&
      !q.includes("where") && !q.includes("why") && !q.includes("give me");

    if (wantsExpense) {
      return res.json({ reply: `💸 Your total expenses are ₹${expense.toLocaleString("en-IN")}` });
    }

    const wantsMost =
      (q.includes("spend most") || q.includes("top category") || q.includes("biggest expense") ||
       q.includes("where do i spend most") || q.includes("where am i spending most")) &&
      !q.includes("analysis") && !q.includes("summary");

    if (wantsMost) {
      return res.json({
        reply: `🔥 You spend the most on "${topCategory}" — ₹${categoryMap[topCategory].toLocaleString("en-IN")}`
      });
    }

    const wantsSavingRate =
      q.includes("saving rate") || q.includes("savings rate") || q.includes("how much am i saving");

    if (wantsSavingRate) {
      return res.json({
        reply: `📊 Your saving rate is ${savingRate}%.\nYou earn ₹${income.toLocaleString("en-IN")} and spend ₹${expense.toLocaleString("en-IN")}, saving ₹${(income - expense).toLocaleString("en-IN")}.`
      });
    }

    // =========================
    // 🤖 AI FALLBACK
    // =========================

    const categoryBreakdown = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const monthlyBreakdown = Object.entries(monthlyMap)
      .map(([month, amt]) => `  - ${month}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const recentTransactions = transactions
      .slice(-10)
      .map(t => `  [${t.type.toUpperCase()}] ${t.category || "Uncategorized"}: ₹${t.amount} — ${t.description || "no note"} (${new Date(t.date || t.createdAt).toLocaleDateString("en-IN")})`)
      .join("\n");

    const financialContext = `
You are FinSight AI — a smart, friendly personal finance assistant.
You have FULL ACCESS to this user's real financial data. Do NOT say you can't see their accounts.

=== USER'S FINANCIAL SUMMARY ===
Total Income:   ₹${income.toLocaleString("en-IN")}
Total Expense:  ₹${expense.toLocaleString("en-IN")}
Current Balance: ₹${balance.toLocaleString("en-IN")}
Saving Rate:    ${savingRate}%
Total Transactions: ${transactions.length}

Top Spending Category: ${topCategory} (₹${(categoryMap[topCategory] || 0).toLocaleString("en-IN")})

=== EXPENSE BREAKDOWN BY CATEGORY ===
${categoryBreakdown || "  No expenses recorded"}

=== MONTHLY EXPENSE TREND ===
${monthlyBreakdown || "  No monthly data"}

=== LAST 10 TRANSACTIONS ===
${recentTransactions || "  No recent transactions"}
=================================

Use this data to give personalized, specific, helpful advice.
Refer to their actual numbers. Be concise and friendly. Use ₹ for amounts.
`.trim();

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: financialContext },
            { role: "user", content: question }
          ]
        })
      });

      const data = await response.json();
      console.log("AI RESPONSE:", data);

      const aiReply =
        data?.choices?.[0]?.message?.content ||
        "🤖 AI couldn't respond. Please try again.";

      return res.json({ reply: aiReply });

    } catch (err) {
      console.log("AI ERROR:", err);
      return res.json({
        reply: "🤖 AI is not available right now. Please try again in a moment."
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
};

module.exports = { askAI, speakTTS };