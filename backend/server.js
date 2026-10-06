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
// 🛡️ SENTINEL ACTIVE DEFENSE & SRE RATE LIMITING ARCHITECTURE
// ============================================================
const SENTINEL_ENGINE_URL = process.env.SENTINEL_ENGINE_URL || "https://sentinel-aiops-engine.onrender.com";

// In-Memory IP Tracking Storage
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10s rolling window
const BURST_WINDOW_MS = 2500;       // 2s burst window
const BURST_LIMIT = 6;              // 6 requests in 2.5s (~2.4+ req/s) triggers burst quarantine!
const MAX_REQUESTS = 12;            // 12 requests in 10s triggers sustained surge quarantine!

let totalRequests = 0;
let activeTopIp = null;
let activeTopIpCount = 0;

// Filter out all static assets, background probes, and browser artifacts
const isStaticOrProbe = (req) => {
  const p = (req.path || "").toLowerCase();
  const ua = (req.headers["user-agent"] || "").toLowerCase();

  // Internal health probes & Sentinel polling
  if (ua.includes("render") || ua.includes("sentinel") || ua.includes("healthcheck")) {
    return true;
  }

  // System endpoints
  if (p === "/health" || p === "/healthz" || p === "/readyz" || p === "/metrics" || p === "/favicon.ico") {
    return true;
  }

  // Static asset paths & directories
  if (p.startsWith("/static/") || p.startsWith("/assets/") || p.startsWith("/css/") || p.startsWith("/js/")) {
    return true;
  }

  // Static file extensions
  if (
    p.endsWith(".js") ||
    p.endsWith(".css") ||
    p.endsWith(".png") ||
    p.endsWith(".jpg") ||
    p.endsWith(".jpeg") ||
    p.endsWith(".svg") ||
    p.endsWith(".ico") ||
    p.endsWith(".json") ||
    p.endsWith(".map") ||
    p.endsWith(".woff") ||
    p.endsWith(".woff2") ||
    p.endsWith(".ttf")
  ) {
    return true;
  }

  return false;
};

// ============================================================
// MIDDLEWARE 1: SENTINEL ENFORCEMENT & UNBAN SYNCHRONIZATION
// ============================================================
app.use(async (req, res, next) => {
  if (isStaticOrProbe(req)) {
    return next();
  }

  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = (forwarded ? forwarded.split(",")[0].trim() : (req.socket.remoteAddress || req.ip || "127.0.0.1")).replace(/^::ffff:/, "");

  try {
    // Check if Sentinel has currently quarantined this IP
    const response = await fetch(`${SENTINEL_ENGINE_URL}/api/security/check-ip/${encodeURIComponent(clientIp)}`, {
      headers: { "User-Agent": "FinSight-Gateway-Defense/2.0" },
      signal: AbortSignal.timeout(2000) // 2-second fail-open safety timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.blocked) {
        // IP is blocked in Sentinel -> Return HTTP 429
        if (req.path.startsWith("/api") || (req.headers.accept && req.headers.accept.includes("application/json"))) {
          return res.status(429).json({
            error: "Sentinel Active Defense: Quarantined",
            blocked: true,
            ip: clientIp,
            incident_id: data.incident_id || "INC-2037",
            status: data.status || "QUARANTINED",
            reason: data.reason || "Active Defense Policy Violation",
            challenge_url: `${SENTINEL_ENGINE_URL}/challenge?ip=${encodeURIComponent(clientIp)}`
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
      } else {
        // SRE HAS RELEASED THIS IP (or client is legitimate)!
        // Clear local tracking memory so this IP is NOT re-jailed on subsequent requests!
        if (ipRequestCounts.has(clientIp)) {
          ipRequestCounts.delete(clientIp);
        }
      }
    }
  } catch (err) {
    // Fail-open: allow legitimate traffic if Sentinel is temporarily unreachable
  }

  next();
});

// ========================================================
// MIDDLEWARE 2: ACTIVE DEFENSE SURGE SHIELD (VOLUMETRIC SPIKE)
// ========================================================
app.use((req, res, next) => {
  if (isStaticOrProbe(req)) {
    return next();
  }

  // Count legitimate requests for Sentinel global radar
  totalRequests++;

  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = (forwarded ? forwarded.split(",")[0].trim() : (req.socket.remoteAddress || req.ip || "127.0.0.1")).replace(/^::ffff:/, "");
  const currentTime = Date.now();

  if (!ipRequestCounts.has(clientIp)) {
    ipRequestCounts.set(clientIp, {
      count: 1,
      startTime: currentTime,
      burstCount: 1,
      burstStart: currentTime,
      lastReported: 0
    });
  } else {
    const clientData = ipRequestCounts.get(clientIp);

    // Reset rolling 10-second window
    if (currentTime - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
      clientData.count = 1;
      clientData.startTime = currentTime;
    } else {
      clientData.count++;
    }

    // Reset burst 2-second window
    if (currentTime - clientData.burstStart > BURST_WINDOW_MS) {
      clientData.burstCount = 1;
      clientData.burstStart = currentTime;
    } else {
      clientData.burstCount++;
    }

    // Update active top IP for telemetry
    if (clientData.count > activeTopIpCount) {
      activeTopIp = clientIp;
      activeTopIpCount = clientData.count;
    }

    // Surge trigger: >= 20 req in 2s (burst DoS) OR >= 35 req in 10s (sustained flood)
    const isBurstSpike = clientData.burstCount >= BURST_LIMIT;
    const isSustainedFlood = clientData.count >= MAX_REQUESTS;

    if (isBurstSpike || isSustainedFlood) {
      // Debounce threat reports: send to Sentinel at most once every 10 seconds per IP
      if (currentTime - (clientData.lastReported || 0) > 10000) {
        clientData.lastReported = currentTime;
        const reason = isBurstSpike
          ? `Volumetric burst attack (${clientData.burstCount} req/2s) exceeding safe threshold`
          : `Sustained volumetric flood (${clientData.count} req/10s exceeding threshold)`;

        console.log(`[DEFENSE ENGAGED] Jailing rogue IP: ${clientIp} - Reason: ${reason}`);

        fetch(`${SENTINEL_ENGINE_URL}/api/security/report-threat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip: clientIp,
            policy: "AUTO_COOLDOWN", // Enables 12s self-healing cooldown
            reason: reason
          })
        }).catch(() => {});
      }

      // Return HTTP 429
      if (req.path.startsWith("/api") || (req.headers.accept && req.headers.accept.includes("application/json"))) {
        return res.status(429).json({
          error: "Sentinel Active Defense: Volumetric traffic spike detected. Your IP has been quarantined.",
          blocked: true,
          ip: clientIp,
          challenge_url: `${SENTINEL_ENGINE_URL}/challenge?ip=${encodeURIComponent(clientIp)}`
        });
      }

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

  next();
});

// ========================================================
// SRE TELEMETRY POLLING ENDPOINT
// ========================================================
app.get("/metrics", (req, res) => {
  const mem = process.memoryUsage();

  res.status(200).json({
    service: "FinSight API",
    status: "UP",
    uptime_seconds: Math.floor(process.uptime()),
    total_requests: totalRequests,
    active_top_ip: activeTopIp,
    active_top_requests: activeTopIpCount,
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