require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========================================================
// 🛡️ SENTINEL SMART TELEMETRY & ACTIVE DEFENSE SHIELD
// ========================================================
let totalRequests = 0;

// Memory storage for IP tracking
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const MAX_REQUESTS = 20; // Block IP if they exceed 20 requests in 10s

app.use((req, res, next) => {
    // Ignore Render's internal background health checks
    if (req.headers['user-agent'] && req.headers['user-agent'].includes('Render')) {
        return next();
    }

    // 1. THE OUTER HULL: Count EVERY single incoming request for the Sentinel global radar
    // Now Sentinel will see the true size of an attack, even if it gets blocked!
    totalRequests++;

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const currentTime = Date.now();

    // 2. IP Tracking Logic
    if (!ipRequestCounts.has(ip)) {
        ipRequestCounts.set(ip, { count: 1, startTime: currentTime });
    } else {
        const clientData = ipRequestCounts.get(ip);
        
        // Reset their count if 10 seconds have passed
        if (currentTime - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
            clientData.count = 1;
            clientData.startTime = currentTime;
        } else {
            clientData.count++;
            
            // 3. THE SHIELD: If this specific IP is spamming, block them instantly!
            if (clientData.count > MAX_REQUESTS) {
                console.log(`[DEFENSE ENGAGED] Blocked malicious traffic from IP: ${ip}`);
                return res.status(429).json({
                    error: "Sentinel Active Defense: Malicious traffic spike detected. Your IP has been temporarily isolated."
                });
            }
        }
    }

    next();
});

// Sentinel will secretly poll this endpoint every 2 seconds for global stats
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