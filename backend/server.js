require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Routes
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const aiRoutes = require("./routes/aiRoutes");
const planRoutes = require("./routes/planRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes usage
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/plan", planRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Sentinel Live Telemetry Heartbeat
app.get("/health", (req, res) => {
    // mongoose.connection.readyState returns 1 if successfully connected to Atlas
    const dbState = mongoose.connection.readyState === 1 ? 'healthy' : 'failed';
    
    res.status(200).json({
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
// Sentinel AIOps Health Check Endpoint
app.get('/health', (req, res) => {
    // We are forcing a 503 Service Unavailable error to trigger Sentinel's telemetry
    res.status(503).json({
        status: "degraded",
        error: "CRITICAL: Gateway Timeout. Resource exhaustion detected."
    });
});