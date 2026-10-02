global.crypto = require("crypto"); // Fixes MongoDB SCRAM auth in Node Alpine containers
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.set("trust proxy", 1);

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
// Sentinel secretly polls this endpoint every 2 seconds for deep SRE metrics
app.get("/metrics", (req, res) => {
    const mem = process.memoryUsage();
    
    res.status(200).json({ 
        service: "FinSight API",
        status: "UP",
        uptime_seconds: Math.floor(process.uptime()),
        total_requests: totalRequests,
        memory: {
            heapUsedMB: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
            heapTotalMB: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
            rssMB: Number((mem.rss / 1024 / 1024).toFixed(2))
        },
        database: {
            status: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED",
            readyState: mongoose.connection.readyState
        },
        timestamp: new Date().toISOString()
    });
});

// ========================================================
// 🛡️ SRE ENTERPRISE HEALTH & READINESS PROBES
// ========================================================

// Liveness Probe: Verifies HTTP process responsiveness
app.get("/healthz", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Readiness Probe: Verifies active MongoDB connection
app.get("/readyz", (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
        return res.status(200).json({
            status: "READY",
            database: "CONNECTED",
            timestamp: new Date().toISOString()
        });
    }

    return res.status(530).json({
        status: "NOT_READY",
        database: "DISCONNECTED",
        timestamp: new Date().toISOString()
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

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// ========================================================
// 🛑 GRACEFUL SHUTDOWN HANDLER (SIGTERM / SIGINT)
// ========================================================
const gracefulShutdown = (signal) => {
    console.log(`\n[SENTINEL SHUTDOWN] Received ${signal}. Starting graceful termination...`);
    
    // Stop accepting new HTTP requests
    server.close(async () => {
        console.log("[SENTINEL SHUTDOWN] HTTP server closed to new connections.");
        
        try {
            // Close database connections cleanly
            await mongoose.connection.close();
            console.log("[SENTINEL SHUTDOWN] MongoDB connection pool closed cleanly.");
            process.exit(0);
        } catch (err) {
            console.error("[SENTINEL SHUTDOWN] Error during MongoDB shutdown:", err);
            process.exit(1);
        }
    });

    // Instantly terminate open HTTP Keep-Alive connections (Watchdog / Health probes)
    if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
    }

    // Force exit safety buffer
    setTimeout(() => {
        console.error("[SENTINEL SHUTDOWN] Forced shutdown limit reached (10s). Terminating process.");
        process.exit(1);
    }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));