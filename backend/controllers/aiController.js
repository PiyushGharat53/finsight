console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY);

const askAI = async (req, res) => {
  try {
    const { question, transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        reply: "You don't have any transactions yet. Add some transactions first and I'll be able to give you personalized insights!"
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRE-CALCULATE EVERYTHING SERVER-SIDE
    // The AI must never do math — it only reads these pre-computed facts.
    // ─────────────────────────────────────────────────────────────────────────

    const getMonthKey = (t) => {
      const d = new Date(t.date || t.createdAt);
      return d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    };

    // Per-month stats
    const monthlyStats = {};

    transactions.forEach(t => {
      const key = getMonthKey(t);
      if (!monthlyStats[key]) {
        monthlyStats[key] = { income: 0, expense: 0, categories: {}, incomeCategories: {}, txList: [] };
      }
      const m = monthlyStats[key];

      if (t.type === "income") {
        m.income += t.amount;
        m.incomeCategories[t.category] = (m.incomeCategories[t.category] || 0) + t.amount;
      } else {
        m.expense += t.amount;
        m.categories[t.category] = (m.categories[t.category] || 0) + t.amount;
      }

      const d = new Date(t.date || t.createdAt);
      m.txList.push(
        `  • [${t.type.toUpperCase()}] ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} | ${t.category} | ${t.type === "income" ? "+" : "-"}₹${t.amount.toLocaleString("en-IN")}${t.description ? ` (${t.description})` : ""}`
      );
    });

    // All-time totals
    let allTimeIncome = 0, allTimeExpense = 0;
    const allTimeCats = {};
    transactions.forEach(t => {
      if (t.type === "income") allTimeIncome += t.amount;
      else {
        allTimeExpense += t.amount;
        allTimeCats[t.category] = (allTimeCats[t.category] || 0) + t.amount;
      }
    });
    const allTimeBalance = allTimeIncome - allTimeExpense;
    const allTimeSavingRate = allTimeIncome > 0
      ? (((allTimeIncome - allTimeExpense) / allTimeIncome) * 100).toFixed(1)
      : "0.0";

    const formatCats = (cats) =>
      Object.entries(cats)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amt]) => `    - ${cat}: ₹${amt.toLocaleString("en-IN")}`)
        .join("\n") || "    (none)";

    const monthBlocks = Object.entries(monthlyStats)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([month, m]) => {
        const balance = m.income - m.expense;
        const rate = m.income > 0 ? (((m.income - m.expense) / m.income) * 100).toFixed(1) : "0.0";
        const topCat = Object.entries(m.categories).sort((a, b) => b[1] - a[1])[0];
        return `
--- ${month} ---
  Income:   ₹${m.income.toLocaleString("en-IN")}
  Expenses: ₹${m.expense.toLocaleString("en-IN")}
  Balance:  ₹${balance.toLocaleString("en-IN")}
  Saving Rate: ${rate}%
  Top Expense Category: ${topCat ? `${topCat[0]} (₹${topCat[1].toLocaleString("en-IN")})` : "none"}
  Expense Breakdown:
${formatCats(m.categories)}
  Income Sources:
${formatCats(m.incomeCategories)}
  All Transactions:
${m.txList.join("\n")}`;
      })
      .join("\n");

    const allTimeCatsText = formatCats(allTimeCats);

    const now = new Date();
    const currentMonth = now.toLocaleString("en-IN", { month: "long", year: "numeric" });

    const systemPrompt = `
You are FinSight AI — a friendly, smart personal finance assistant for an Indian user.
Today is ${now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}.
The current month is ${currentMonth}.

CRITICAL RULES — follow these strictly:
1. NEVER calculate or do math yourself. All numbers are PRE-CALCULATED below. Just read and report them.
2. When the user asks about a SPECIFIC MONTH, use ONLY that month's pre-calculated data.
3. When the user asks a GENERAL question (no month specified), answer for the CURRENT MONTH (${currentMonth}) first, then mention all-time if relevant.
4. Always make it clear whether you're reporting a specific month or all-time figures.
5. Be concise, friendly, and specific. Use ₹ for Indian Rupees.
6. Do NOT re-calculate, add, or modify any number — just read and present what is written below.

══════════════════════════════════════════
ALL-TIME SUMMARY (lifetime total across all months)
══════════════════════════════════════════
Total Income:    ₹${allTimeIncome.toLocaleString("en-IN")}
Total Expenses:  ₹${allTimeExpense.toLocaleString("en-IN")}
Net Balance:     ₹${allTimeBalance.toLocaleString("en-IN")}
Overall Saving Rate: ${allTimeSavingRate}%

All-Time Expense Categories:
${allTimeCatsText}

══════════════════════════════════════════
MONTHLY BREAKDOWN (use these exact pre-calculated numbers, do not recalculate)
══════════════════════════════════════════
${monthBlocks}
══════════════════════════════════════════

Answer the user's question using ONLY the data above. Never guess or calculate on your own.
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