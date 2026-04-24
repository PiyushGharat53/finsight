console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY);

const askAI = async (req, res) => {
  try {
    const { question, transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        reply: "You don't have any transactions yet. Add some transactions first and I'll be able to give you personalized insights!"
      });
    }

    // ── Build a detailed per-transaction list for the AI ──────────────────────
    // We do NOT pre-aggregate. The AI receives raw transactions so it can
    // filter by month, category, or date range itself based on what the user asks.

    const transactionList = transactions
      .map(t => {
        const date = new Date(t.date || t.createdAt);
        const dateStr = date.toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric"
        });
        const monthYear = date.toLocaleString("en-IN", { month: "long", year: "numeric" });
        const sign = t.type === "income" ? "+" : "-";
        return `[${t.type.toUpperCase()}] ${dateStr} (${monthYear}) | ${t.category || "Uncategorized"} | ${sign}₹${t.amount} | ${t.description || "no note"}`;
      })
      .join("\n");

    // ── Also compute a simple overall summary just to orient the AI ──────────
    let totalIncome = 0, totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });
    const totalBalance = totalIncome - totalExpense;
    const savingRate = totalIncome > 0
      ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
      : 0;

    // ── Current month name for context ────────────────────────────────────────
    const now = new Date();
    const currentMonth = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

    // ── System prompt ─────────────────────────────────────────────────────────
    const systemPrompt = `
You are FinSight AI — a smart, friendly personal finance assistant for an Indian user.
You have FULL ACCESS to this user's complete transaction history below.
Today's date is ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}.
The current month is ${currentMonth}.

IMPORTANT RULES:
1. When the user asks about a SPECIFIC MONTH (e.g. "April", "March", "last month"), filter and calculate ONLY for that month's transactions. Do NOT mix in other months.
2. When the user asks a GENERAL question with no month specified (e.g. "where does my money go", "what's my top expense"), answer for ALL TIME but clearly mention it's an overall/lifetime view. Then optionally mention the current month's figures too for context.
3. When asked about "income", always clarify whether it's for a specific month or overall. People usually earn month by month — so if no month is mentioned, give current month income first, then overall.
4. Never make up numbers. Calculate directly from the transactions listed below.
5. Be concise, specific, and friendly. Use ₹ for amounts. Use bullet points for breakdowns.
6. If the user's question is ambiguous (e.g. they just say "income" without a month), tell them the current month's income AND ask if they want a different month or the overall total.

=== OVERALL SUMMARY (all-time) ===
Total Income:    ₹${totalIncome.toLocaleString("en-IN")}
Total Expenses:  ₹${totalExpense.toLocaleString("en-IN")}
Current Balance: ₹${totalBalance.toLocaleString("en-IN")}
Saving Rate:     ${savingRate}%
Total Transactions: ${transactions.length}

=== COMPLETE TRANSACTION HISTORY ===
${transactionList}
=====================================

Use the transaction history above to answer ANY question. Always calculate from the raw data.
`.trim();

    // ── Call OpenRouter AI ────────────────────────────────────────────────────
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
            { role: "system", content: systemPrompt },
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

module.exports = { askAI };