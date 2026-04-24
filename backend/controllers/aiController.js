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
    // QUICK BUTTONS — only triggered by the exact __QUICK__ prefix from the UI.
    // Nothing the user types in the chat box can ever trigger these.
    // ─────────────────────────────────────────────────────────────────────────

    if (question.startsWith("__QUICK__")) {
      const cmd = question.replace("__QUICK__", "").trim();

      const monthlyIncome = {};
      const monthlyExpense = {};
      const allCategoryMap = {};
      let totalIncome = 0, totalExpense = 0;

      transactions.forEach(t => {
        const d = new Date(t.date || t.createdAt);
        const key = d.toLocaleString("en-IN", { month: "short", year: "numeric" });

        if (t.type === "income") {
          totalIncome += t.amount;
          monthlyIncome[key] = (monthlyIncome[key] || 0) + t.amount;
        } else {
          totalExpense += t.amount;
          monthlyExpense[key] = (monthlyExpense[key] || 0) + t.amount;
          allCategoryMap[t.category] = (allCategoryMap[t.category] || 0) + t.amount;
        }
      });

      const sortMonths = (obj) =>
        Object.entries(obj).sort((a, b) => new Date("01 " + a[0]) - new Date("01 " + b[0]));

      if (cmd === "INCOME_BY_MONTH") {
        const rows = sortMonths(monthlyIncome);
        if (!rows.length) return res.json({ reply: "📭 No income recorded yet." });
        const lines = rows.map(([m, v]) => `  ${m.padEnd(12)} ₹${v.toLocaleString("en-IN")}`).join("\n");
        return res.json({ reply: `💵 Income by month:\n\n${lines}\n\n💰 Total: ₹${totalIncome.toLocaleString("en-IN")}` });
      }

      if (cmd === "EXPENSE_BY_MONTH") {
        const rows = sortMonths(monthlyExpense);
        if (!rows.length) return res.json({ reply: "📭 No expenses recorded yet." });
        const lines = rows.map(([m, v]) => `  ${m.padEnd(12)} ₹${v.toLocaleString("en-IN")}`).join("\n");
        return res.json({ reply: `💸 Expenses by month:\n\n${lines}\n\n🔢 Total spent: ₹${totalExpense.toLocaleString("en-IN")}` });
      }

      if (cmd === "BALANCE") {
        const balance = totalIncome - totalExpense;
        const rate = totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0;
        return res.json({
          reply: `💰 Current balance: ₹${balance.toLocaleString("en-IN")}\n\n📥 Total earned:  ₹${totalIncome.toLocaleString("en-IN")}\n📤 Total spent:   ₹${totalExpense.toLocaleString("en-IN")}\n📊 Saving rate:   ${rate}%`
        });
      }

      if (cmd === "TOP_CATEGORIES") {
        const sorted = Object.entries(allCategoryMap).sort((a, b) => b[1] - a[1]);
        if (!sorted.length) return res.json({ reply: "📭 No expenses recorded yet." });
        const lines = sorted.map(([cat, amt], i) => {
          const pct = totalExpense > 0 ? ((amt / totalExpense) * 100).toFixed(1) : 0;
          return `  ${i + 1}. ${cat.padEnd(16)} ₹${amt.toLocaleString("en-IN")}  (${pct}%)`;
        }).join("\n");
        return res.json({ reply: `🏆 Top spending categories (all time):\n\n${lines}` });
      }

      return res.json({ reply: "Unknown quick command." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ALL OTHER QUESTIONS → pure AI. No keyword matching. No interception.
    // The AI sees the full financial context and answers whatever the user asks.
    // ─────────────────────────────────────────────────────────────────────────

    const q = question.toLowerCase();

    // Detect a specific month/year so we can pre-filter and highlight it for the AI
    const MONTHS = {
      jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
      apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
      aug: 7, august: 7, sep: 8, september: 8, oct: 9, october: 9,
      nov: 10, november: 10, dec: 11, december: 11
    };

    let filterMonth = null, filterYear = null;
    for (const [name, idx] of Object.entries(MONTHS)) {
      if (q.includes(name)) { filterMonth = idx; break; }
    }
    const yearMatch = q.match(/\b(20\d{2})\b/);
    if (yearMatch) filterYear = parseInt(yearMatch[1]);

    const now = new Date();
    if (filterMonth !== null && filterYear === null) {
      filterYear = now.getFullYear();
      if (filterMonth > now.getMonth()) filterYear--;
    }

    const isFiltered = filterMonth !== null;
    const filteredTransactions = isFiltered
      ? transactions.filter(t => {
          const d = new Date(t.date || t.createdAt);
          return d.getMonth() === filterMonth && (!filterYear || d.getFullYear() === filterYear);
        })
      : transactions;

    // All-time aggregates
    let allIncome = 0, allExpense = 0;
    const allCategoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      if (t.type === "income") allIncome += t.amount;
      else allExpense += t.amount;
      if (t.type === "expense") {
        allCategoryMap[t.category] = (allCategoryMap[t.category] || 0) + t.amount;
        const month = new Date(t.date || t.createdAt).toLocaleString("en-IN", { month: "short", year: "numeric" });
        monthlyMap[month] = (monthlyMap[month] || 0) + t.amount;
      }
    });

    // Period aggregates (same as all-time when no month detected)
    let pIncome = 0, pExpense = 0;
    const pCategoryMap = {};
    filteredTransactions.forEach(t => {
      if (t.type === "income") pIncome += t.amount;
      else pExpense += t.amount;
      if (t.type === "expense") pCategoryMap[t.category] = (pCategoryMap[t.category] || 0) + t.amount;
    });

    const allBalance = allIncome - allExpense;
    const allSavingRate = allIncome > 0 ? (((allIncome - allExpense) / allIncome) * 100).toFixed(1) : 0;
    const pSavingRate = pIncome > 0 ? (((pIncome - pExpense) / pIncome) * 100).toFixed(1) : 0;

    let allTimeTopCat = "", allMax = 0;
    for (const cat in allCategoryMap) {
      if (allCategoryMap[cat] > allMax) { allMax = allCategoryMap[cat]; allTimeTopCat = cat; }
    }

    const allCatBreakdown = Object.entries(allCategoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const monthlyBreakdown = Object.entries(monthlyMap)
      .map(([m, amt]) => `  - ${m}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const pCatBreakdown = Object.entries(pCategoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const recentTx = [...transactions]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 15)
      .map(t => `  [${t.type.toUpperCase()}] ${t.category || "Uncategorized"}: ₹${t.amount} — ${t.description || "no note"} (${new Date(t.date || t.createdAt).toLocaleDateString("en-IN")})`)
      .join("\n");

    const periodLabel = isFiltered
      ? new Date(filterYear, filterMonth).toLocaleString("en-IN", { month: "long", year: "numeric" })
      : null;

    const filteredTxList = isFiltered
      ? filteredTransactions
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .map(t => `  [${t.type.toUpperCase()}] ${t.category || "Uncategorized"}: ₹${t.amount} — ${t.description || "no note"} (${new Date(t.date || t.createdAt).toLocaleDateString("en-IN")})`)
          .join("\n")
      : null;

    const financialContext = `
You are FinSight AI — a smart, friendly personal finance assistant.
You have FULL ACCESS to this user's real financial data. Never say you can't see their accounts.
Always cite specific numbers from the data below. Be concise, warm, and helpful. Use ₹ for amounts.

=== ALL-TIME SUMMARY ===
Total Income:    ₹${allIncome.toLocaleString("en-IN")}
Total Expense:   ₹${allExpense.toLocaleString("en-IN")}
Current Balance: ₹${allBalance.toLocaleString("en-IN")}
Saving Rate:     ${allSavingRate}%
Transactions:    ${transactions.length}
Top Category:    ${allTimeTopCat} (₹${(allCategoryMap[allTimeTopCat] || 0).toLocaleString("en-IN")})

=== ALL-TIME EXPENSE BY CATEGORY ===
${allCatBreakdown || "  No expenses recorded"}

=== MONTHLY EXPENSE TREND ===
${monthlyBreakdown || "  No monthly data"}

${isFiltered ? `=== ${periodLabel.toUpperCase()} — FILTERED DATA ===
Income:       ₹${pIncome.toLocaleString("en-IN")}
Expense:      ₹${pExpense.toLocaleString("en-IN")}
Saved:        ₹${(pIncome - pExpense).toLocaleString("en-IN")}
Saving rate:  ${pSavingRate}%

Expense breakdown for ${periodLabel}:
${pCatBreakdown || "  No expenses this period"}

All transactions in ${periodLabel}:
${filteredTxList || "  None"}
` : ""}
=== MOST RECENT 15 TRANSACTIONS ===
${recentTx || "  None"}
===================================

${isFiltered
  ? `The user's question is about ${periodLabel}. Answer using that period's filtered data above unless they clearly ask for something else.`
  : "No specific month detected — answer using all-time data."}
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

      const aiReply = data?.choices?.[0]?.message?.content || "🤖 AI couldn't respond. Please try again.";
      return res.json({ reply: aiReply });

    } catch (err) {
      console.log("AI ERROR:", err);
      return res.json({ reply: "🤖 AI is not available right now. Please try again in a moment." });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
};

module.exports = { askAI };