require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// 1. IMPORT THE MIDDLEWARE HERE
const aiopsShieldMiddleware = require("./middleware/aiopsMiddleware"); 

const app = express();

// Routes
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const planRoutes = require("./routes/planRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// 2. ACTIVATE THE SHIELD HERE (Must be placed before your routes!)
app.use(aiopsShieldMiddleware); 

// Routes usage
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/plan", planRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Test Route
app.get("/", (req, res) => {
  res.send("HydraBolt Finance API Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});