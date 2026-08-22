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

// 💥 Chaos Testing Flag
let isSimulatedCrash = false;

// 💥 Chaos Trigger Endpoint
app.get("/crash", (req, res) => {
    isSimulatedCrash = true;
    res.status(500).send("💥 FinSight backend has crashed! Health checks will now fail.");
});

// Sentinel Live Telemetry Heartbeat (Upgraded with Chaos Support)
app.get("/health", (req, res) => {
    if (isSimulatedCrash) {
        return res.status(500).json({ 
            status: "failed", 
            error: "Internal Server Outage Simulated" 
        });
    }

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