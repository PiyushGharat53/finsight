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

// ============================================================
// 🛡️ SENTINEL ACTIVE DEFENSE FIREWALL MIDDLEWARE
// ============================================================
const SENTINEL_ENGINE_URL = process.env.SENTINEL_ENGINE_URL || "https://sentinel-aiops-engine.onrender.com";

app.use(async (req, res, next) => {
  // Extract client IP from proxy headers or socket
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = forwarded ? forwarded.split(",")[0].trim() : (req.socket.remoteAddress || "127.0.0.1");

  // Skip static assets or health checks if needed
  if (req.path.startsWith("/static") || req.path === "/health" || req.path === "/favicon.ico") {
    return next();
  }

  try {
    // Fast security policy check against Sentinel Active Defense
    const response = await fetch(`${SENTINEL_ENGINE_URL}/api/security/check-ip/${encodeURIComponent(clientIp)}`, {
      headers: { "User-Agent": "FinSight-Gateway-Defense/2.0" },
      signal: AbortSignal.timeout(2000) // 2-second fail-open safety timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data.blocked) {
        // 🔥 IP IS QUARANTINED OR BANNED!
        if (req.path.startsWith('/api') || (req.headers.accept && req.headers.accept.includes('application/json'))) {
          return res.status(429).json({
            error: 'Sentinel Active Defense: Quarantined',
            blocked: true,
            ip: clientIp,
            incident_id: data.incident_id || 'INC-2037',
            status: data.status || 'QUARANTINED',
            reason: data.reason || 'Active Defense Policy Violation',
            challenge_url: SENTINEL_ENGINE_URL + "/challenge?ip=" + encodeURIComponent(clientIp)
          });
        }
        // Direct browser visit: immediately redirect to challenge screen
        return res.status(429).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>429 - Quarantined | FinSight Active Defense</title>
            <meta http-equiv="refresh" content="0; url=${SENTINEL_ENGINE_URL}/challenge?ip=${encodeURIComponent(clientIp)}">
          </head>
          <body style="background:#080c14;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
            <p>Access Quarantined by Sentinel Active Defense. Redirecting to Security Challenge...</p>
          </body>
          </html>
        `);
      }
    }
  } catch (err) {
    // Fail-open: If Sentinel is temporarily unreachable, allow legitimate traffic through
  }

  next();
});
// ============================================================


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
            
            // 3. THE SHIELD: If this specific IP is spamming, block them instantly & auto-report to Sentinel!
            if (clientData.count > MAX_REQUESTS) {
                const attackerIp = (req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].split(",")[0].trim() : ip) || "103.57.252.110";
                console.log(`[DEFENSE ENGAGED] Blocked malicious traffic from IP: ${attackerIp}`);

                // Auto-report the attacking rogue IP to Sentinel SRE Active Defense Jail
                fetch(`${SENTINEL_ENGINE_URL}/api/security/report-threat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ip: attackerIp,
                        reason: `Volumetric surge violation (${clientData.count} req/10s exceeding threshold)`
                    })
                }).catch(() => {});

                return res.status(429).json({
                    error: "Sentinel Active Defense: Malicious traffic spike detected. Your IP has been quarantined.",
                    blocked: true,
                    ip: attackerIp,
                    challenge_url: `${SENTINEL_ENGINE_URL}/challenge?ip=${encodeURIComponent(attackerIp)}`
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
// Serve static frontend build as fallback
const path = require("path");
const buildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(buildPath));

app.get("/", (req, res) => {
  const indexFile = path.join(buildPath, "index.html");
  res.sendFile(indexFile, (err) => {
    if (err) res.send("HydraBolt Finance API Running 🚀");
  });
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
// TEST: Broken assignment syntax break
const sentinelCrashTest = ;