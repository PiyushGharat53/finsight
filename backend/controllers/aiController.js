console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY);

const askAI = async (req, res) => {
  try {
    const { question, transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        reply: "You don't have any transactions yet. Add some transactions first and I'll be able to give you personalized insights!"
      });
    }

    // ─────────────────────────────────────────────
    // STEP 1: Detect if the question mentions a specific month/year
    // ─────────────────────────────────────────────
    const q = question.toLowerCase();

    const MONTHS = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11
    };

    let filterMonth = null; // 0–11
    let filterYear = null;  // e.g. 2026

    // Detect month name in question
    for (const [name, idx] of Object.entries(MONTHS)) {
      if (q.includes(name)) {
        filterMonth = idx;
        break;
      }
    }

    // Detect year in question (4-digit)
    const yearMatch = q.match(/\b(20\d{2})\b/);
    if (yearMatch) filterYear = parseInt(yearMatch[1]);

    // If no year specified but month found, default to the most recent occurrence of that month
    const now = new Date();
    if (filterMonth !== null && filterYear === null) {
      // Use current year; if that month hasn't started yet, use previous year
      filterYear = now.getFullYear();
      if (filterMonth > now.getMonth()) filterYear--;
    }

    // ─────────────────────────────────────────────
    // STEP 2: Filter transactions for the detected period (or use all)
    // ─────────────────────────────────────────────
    const isFiltered = filterMonth !== null;

    const filteredTransactions = isFiltered
      ? transactions.filter(t => {
          const d = new Date(t.date || t.createdAt);
          return d.getMonth() === filterMonth &&
                 (!filterYear || d.getFullYear() === filterYear);
        })
      : transactions;

    // ─────────────────────────────────────────────
    // STEP 3: Compute stats on the FILTERED set
    // ─────────────────────────────────────────────
    let income = 0;
    let expense = 0;
    const categoryMap = {};

    filteredTransactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      if (t.type === "expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    // Also compute ALL-TIME stats separately (for context)
    let allIncome = 0, allExpense = 0;
    const allCategoryMap = {};
    const monthlyMap = {};

    transactions.forEach(t => {
      if (t.type === "income") allIncome += t.amount;
      else allExpense += t.amount;

      if (t.type === "expense") {
        allCategoryMap[t.category] = (allCategoryMap[t.category] || 0) + t.amount;

        const month = new Date(t.date || t.createdAt).toLocaleString("en-IN", {
          month: "short", year: "numeric"
        });
        monthlyMap[month] = (monthlyMap[month] || 0) + t.amount;
      }
    });

    const balance = allIncome - allExpense; // balance is always all-time
    const savingRate = income > 0 ? (((income - expense) / income) * 100).toFixed(1) : 0;
    const allTimeSavingRate = allIncome > 0
      ? (((allIncome - allExpense) / allIncome) * 100).toFixed(1)
      : 0;

    let topCategory = "";
    let max = 0;
    for (let cat in categoryMap) {
      if (categoryMap[cat] > max) {
        max = categoryMap[cat];
        topCategory = cat;
      }
    }

    let allTimeTopCategory = "";
    let allMax = 0;
    for (let cat in allCategoryMap) {
      if (allCategoryMap[cat] > allMax) {
        allMax = allCategoryMap[cat];
        allTimeTopCategory = cat;
      }
    }

    // ─────────────────────────────────────────────
    // STEP 4: Quick hardcoded replies (use FILTERED stats)
    // ─────────────────────────────────────────────

    const periodLabel = isFiltered
      ? `${new Date(filterYear, filterMonth).toLocaleString("en-IN", { month: "long", year: "numeric" })}`
      : "all time";

    const wantsBalance =
      (q.includes("balance") || q.includes("my balance")) &&
      !q.includes("analysis") && !q.includes("summary") && !q.includes("advice") && !q.includes("tip");

    if (wantsBalance && !isFiltered) {
      return res.json({ reply: `💰 Your current balance is ₹${balance.toLocaleString("en-IN")}` });
    }

    const wantsIncome =
      (q === "income" || q.includes("my income") || q.includes("how much income") ||
       q.includes("total income") || q.includes("earned")) &&
      !q.includes("analysis") && !q.includes("summary") && !q.includes("advice");

    if (wantsIncome) {
      return res.json({
        reply: `💵 Your total income for ${periodLabel} is ₹${income.toLocaleString("en-IN")}`
      });
    }

    const wantsExpense =
      (q === "expense" || q === "expenses" || q === "spending" ||
       q.includes("how much did i spend") || q.includes("total expense") ||
       q.includes("total spending") || q.includes("how much have i spent")) &&
      !q.includes("analysis") && !q.includes("summary") && !q.includes("advice") &&
      !q.includes("where") && !q.includes("why") && !q.includes("give me");

    if (wantsExpense) {
      return res.json({
        reply: `💸 Your total expenses for ${periodLabel} are ₹${expense.toLocaleString("en-IN")}`
      });
    }

    const wantsMost =
      (q.includes("spend most") || q.includes("top category") || q.includes("biggest expense") ||
       q.includes("where do i spend most") || q.includes("where am i spending most")) &&
      !q.includes("analysis") && !q.includes("summary");

    if (wantsMost) {
      if (!topCategory) {
        return res.json({ reply: `🔍 No expenses found for ${periodLabel}.` });
      }
      return res.json({
        reply: `🔥 For ${periodLabel}, you spend the most on "${topCategory}" — ₹${categoryMap[topCategory].toLocaleString("en-IN")}`
      });
    }

    const wantsSavingRate =
      q.includes("saving rate") || q.includes("savings rate") || q.includes("how much am i saving");

    if (wantsSavingRate) {
      const si = isFiltered ? income : allIncome;
      const se = isFiltered ? expense : allExpense;
      const sr = isFiltered ? savingRate : allTimeSavingRate;
      return res.json({
        reply: `📊 Your saving rate for ${periodLabel} is ${sr}%.\nYou earned ₹${si.toLocaleString("en-IN")} and spent ₹${se.toLocaleString("en-IN")}, saving ₹${(si - se).toLocaleString("en-IN")}.`
      });
    }

    // ─────────────────────────────────────────────
    // STEP 5: AI fallback — inject BOTH filtered + all-time context
    // ─────────────────────────────────────────────

    const filteredCategoryBreakdown = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const allCategoryBreakdown = Object.entries(allCategoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    const monthlyBreakdown = Object.entries(monthlyMap)
      .map(([month, amt]) => `  - ${month}: ₹${amt.toLocaleString("en-IN")}`)
      .join("\n");

    // Sort all transactions by date descending, take most recent 15
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 15)
      .map(t =>
        `  [${t.type.toUpperCase()}] ${t.category || "Uncategorized"}: ₹${t.amount} — ${t.description || "no note"} (${new Date(t.date || t.createdAt).toLocaleDateString("en-IN")})`
      )
      .join("\n");

    // If filtered, also show the filtered transactions specifically
    const filteredTxList = isFiltered
      ? filteredTransactions
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .map(t =>
            `  [${t.type.toUpperCase()}] ${t.category || "Uncategorized"}: ₹${t.amount} — ${t.description || "no note"} (${new Date(t.date || t.createdAt).toLocaleDateString("en-IN")})`
          )
          .join("\n")
      : null;

    const financialContext = `
You are FinSight AI — a smart, friendly personal finance assistant.
You have FULL ACCESS to this user's real financial data. Do NOT say you can't see their accounts.
Always refer to specific numbers from the data. Be concise, clear, and friendly. Use ₹ for amounts.

=== ALL-TIME FINANCIAL SUMMARY ===
Total Income:    ₹${allIncome.toLocaleString("en-IN")}
Total Expense:   ₹${allExpense.toLocaleString("en-IN")}
Current Balance: ₹${balance.toLocaleString("en-IN")}
Saving Rate:     ${allTimeSavingRate}%
Total Transactions: ${transactions.length}

Top Spending Category (all time): ${allTimeTopCategory} (₹${(allCategoryMap[allTimeTopCategory] || 0).toLocaleString("en-IN")})

=== ALL-TIME EXPENSE BREAKDOWN BY CATEGORY ===
${allCategoryBreakdown || "  No expenses recorded"}

=== MONTHLY EXPENSE TREND ===
${monthlyBreakdown || "  No monthly data"}

${isFiltered ? `=== ${periodLabel.toUpperCase()} — FILTERED SUMMARY ===
Income this period:  ₹${income.toLocaleString("en-IN")}
Expense this period: ₹${expense.toLocaleString("en-IN")}
Savings this period: ₹${(income - expense).toLocaleString("en-IN")}
Saving rate:         ${savingRate}%
Top category:        ${topCategory || "N/A"} (₹${(categoryMap[topCategory] || 0).toLocaleString("en-IN")})

=== ${periodLabel.toUpperCase()} — EXPENSE BREAKDOWN ===
${filteredCategoryBreakdown || "  No expenses in this period"}

=== ${periodLabel.toUpperCase()} — ALL TRANSACTIONS ===
${filteredTxList || "  No transactions in this period"}
` : ""}
=== MOST RECENT 15 TRANSACTIONS (ALL TIME) ===
${recentTransactions || "  No recent transactions"}
=================================

IMPORTANT: The user's question may be about a specific period (${isFiltered ? `"${periodLabel}"` : "no specific period detected — use all-time data"}).
Answer based on the ${isFiltered ? `"${periodLabel}" filtered data` : "all-time data"} unless the user clearly asks for something else.
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
            {
              role: "system",
              content: financialContext
            },
            {
              role: "user",
              content: question
            }
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