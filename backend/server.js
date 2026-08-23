require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========================================================
// SENTINEL REAL-TIME TELEMETRY SENSOR
// ========================================================
let totalRequests = 0;

// This middleware runs on every single request and counts it
app.use((req, res, next) => {
    // We ignore Render's internal background health checks to keep data clean
    if (req.headers['user-agent'] && !req.headers['user-agent'].includes('Render')) {
        totalRequests++;
    }
    next();
});

// Sentinel will secretly poll this endpoint every 2 seconds
app.get("/metrics", (req, res) => {
    res.status(200).json({ 
        service: "FinSight API",
        total_requests: totalRequests,
        timestamp: new Date()
    });
});
// ========================================================

// Routes
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const planRoutes = require("./routes/planRoutes");

// Routes usage
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/plan", planRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// SENTINEL AIOps TELEMETRY (LIVE HEALTH CHECK)
app.get("/health", (req, res) => {
    const dbState = mongoose.connection.readyState === 1 ? 'healthy' : 'failed';
    const statusCode = dbState === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
        service: 'FinSight API',
        status: 'healthy',
        database: {
            name: 'HydraBolt Finance Cluster',
            status: dbState
        },
        timestamp: new Date()
    });
});

// Test Route
app.get("/", (req, res) => {
  res.send("HydraBolt Finance API Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
// TEST: Broken assignment syntax break
const sentinelCrashTest = ;
