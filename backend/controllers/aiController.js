console.log("KEY CHECK:", process.env.OPENROUTER_API_KEY);

const askAI = async (req, res) => {
  try {
    const { question, transactions } = req.body;

    if (!transactions || transactions.length === 0) {
      return res.json({
        reply: "You don’t have any transactions yet."
      });
    }

    const now = new Date();
    let income = 0;
    let expense = 0;
    const categoryMap = {};

    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;

      if (t.type === "expense") {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      }
    });

    const balance = income - expense;

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

    if (q.includes("balance")) {
      return res.json({ reply: `💰 Your balance is ₹${balance}` });
    }

    if (q.includes("income")) {
      return res.json({ reply: `💵 Your income is ₹${income}` });
    }

    if (q.includes("expense") || q.includes("spend")) {
      return res.json({ reply: `💸 You spent ₹${expense}` });
    }

    if (q.includes("most")) {
      return res.json({
        reply: `🔥 You spend most on "${topCategory}"`
      });
    }

    // =========================
    // 🤖 AI FALLBACK (REAL AI)
    // =========================

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
              content: "You are a smart and friendly finance assistant helping a student manage money."
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
        "🤖 AI couldn't respond";

      return res.json({ reply: aiReply });

    } catch (err) {
      console.log("AI ERROR:", err);

      return res.json({
        reply: "🤖 AI not available right now, try again later."
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI failed" });
  }
};

module.exports = { askAI };