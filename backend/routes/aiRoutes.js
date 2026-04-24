const express = require("express");
const router = express.Router();
const { askAI, speakTTS } = require("../controllers/aiController");

router.post("/ask", askAI);
router.post("/speak", speakTTS);

module.exports = router;