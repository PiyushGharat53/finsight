const express = require("express");
const router = express.Router();

// ✅ IMPORT CORRECT NAMES
const { login, register } = require("../controllers/authController");

// ✅ USE SAME NAMES
router.post("/login", login);
router.post("/register", register);

module.exports = router;