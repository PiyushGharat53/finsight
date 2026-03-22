exports.askAI = async (req, res) => {
  try {
    const { question, transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        reply: "You don’t have any transactions yet."
      });
    }

    const now = new Date();
    const currentDay = now.getDate();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    let income = 0;
    let expense = 0;

    let currentMonthExpense = 0;
    let lastMonthExpense = 0;

    const categoryMap = {};

    transactions.forEach(t => {
      const d = new Date(t.date);

      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      // category
      if (t.type === "expense") {
        if (!categoryMap[t.category]) {
          categoryMap[t.category] = 0;
        }
        categoryMap[t.category] += t.amount;
      }

      // current month
      if (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      ) {
        if (t.type === "expense") currentMonthExpense += t.amount;
      }

      // last month
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);

      if (
        d.getMonth() === lastMonth.getMonth() &&
        d.getFullYear() === lastMonth.getFullYear()
      ) {
        if (t.type === "expense") lastMonthExpense += t.amount;
      }
    });

    const balance = income - expense;

    const savingsRate = income > 0
      ? ((balance / income) * 100).toFixed(1)
      : 0;

    // 🔥 TOP CATEGORY
    let topCategory = "";
    let max = 0;

    for (let cat in categoryMap) {
      if (categoryMap[cat] > max) {
        max = categoryMap[cat];
        topCategory = cat;
      }
    }

    const topPercent = expense > 0
      ? ((max / expense) * 100).toFixed(1)
      : 0;

    // 📊 TREND
    let trend = "";
    if (currentMonthExpense > lastMonthExpense) {
      trend = "📈 Your spending is increasing compared to last month.";
    } else if (currentMonthExpense < lastMonthExpense) {
      trend = "📉 Your spending decreased compared to last month.";
    } else {
      trend = "➡️ Your spending is similar to last month.";
    }

    // 🔮 PREDICTION LOGIC
    const dailyAvg = currentMonthExpense / currentDay;
    const predictedExpense = Math.round(dailyAvg * totalDays);

    let prediction = "";

    if (predictedExpense > currentMonthExpense) {
      prediction = `🔮 At this rate, you may spend around ₹${predictedExpense} this month.`;
    }

    // 🚨 RISK DETECTION
    let risk = "";
    if (predictedExpense > income) {
      risk = "🚨 You are likely to overspend this month!";
    }

    const q = question.toLowerCase();

    let reply = "";

    // 🧠 SMART RESPONSES

    if (q.includes("predict") || q.includes("future")) {
      reply = `
🔮 Prediction:
${prediction}
${risk}
`;
    }

    else if (q.includes("summary")) {
      reply = `
📊 Financial Summary:
- Income: ₹${income}
- Expense: ₹${expense}
- Balance: ₹${balance}
- Savings Rate: ${savingsRate}%
- Top Category: ${topCategory} (${topPercent}%)

${trend}
${prediction}
${risk}
`;
    }

    else if (q.includes("spending") || q.includes("most")) {
      reply = `🔥 You spend most on "${topCategory}" (${topPercent}% of your expenses).`;
    }

    else if (q.includes("saving")) {
      reply = `💡 Your savings rate is ${savingsRate}%. ${
        savingsRate < 20
          ? "Try reducing expenses."
          : "You're doing great!"
      }`;
    }

    else if (q.includes("trend") || q.includes("compare")) {
      reply = trend;
    }

    else {
      reply = `
🤖 Smart Insight:

Income: ₹${income}
Expense: ₹${expense}
Balance: ₹${balance}

Top category: ${topCategory} (${topPercent}%)

${trend}
${prediction}
${risk}

💡 Tip: ${
        expense > income
          ? "Reduce expenses immediately."
          : "Keep saving consistently."
      }
`;
    }

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "AI failed"
    });
  }
};