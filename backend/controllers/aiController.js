import fetch from "node-fetch";

export const chatWithAI = async (req, res) => {
  try {
    const { message, data } = req.body;

    const prompt = `
You are a smart finance assistant.

User financial data:
${JSON.stringify(data)}

User question:
${message}

Give a helpful, short, and clear answer.
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // 🔥 IMPORTANT
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    const result = await response.json();

    const reply = result.choices?.[0]?.message?.content || "AI couldn't respond";

    res.json({ reply });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ reply: "Something went wrong" });
  }
};