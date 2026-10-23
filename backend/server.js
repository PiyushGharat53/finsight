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

// In-Memory Per-Client Request Velocity Storage
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 10000; // 10s rolling window
const BURST_WINDOW_MS = 2500;       // 2.5s burst velocity window
const BURST_LIMIT = 10;             // 10 requests in 2.5s = 4.0 req/s individual attacker threshold!
const MAX_REQUESTS = 40;            // 40 requests in 10s sustained flood threshold

let totalRequests = 0;
let activeTopIp = null;
let activeTopLocalIp = "";
let activeTopDeviceId = "";
let activeTopDeviceName = "";
let activeTopIpCount = 0;
let activeTopClientRps = 0.0;

// Helper to identify client device identity behind shared Wi-Fi / NAT router
const getClientDevice = (req) => {
  const deviceId = (req.headers["x-device-id"] || req.query.device_id || "").toString().trim();
  const localIp = (req.headers["x-local-ip"] || req.query.local_ip || "").toString().trim();
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  let deviceName = (req.headers["x-device-name"] || req.query.device_name || "").toString().trim();
  if (!deviceName) {
    if (ua.includes("android")) deviceName = "Android Mobile";
    else if (ua.includes("iphone") || ua.includes("ipad")) deviceName = "Apple Mobile";
    else if (ua.includes("windows")) deviceName = "Windows PC";
    else if (ua.includes("macintosh") || ua.includes("mac os")) deviceName = "Mac";
    else if (ua.includes("linux")) deviceName = "Linux PC";
    else if (ua.includes("mobile")) deviceName = "Mobile Device";
    else deviceName = "Desktop";
  }
  return { deviceId, deviceName, localIp };
};

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
  const { deviceId, deviceName, localIp } = getClientDevice(req);
  const clientKey = deviceId ? `${clientIp}#${deviceId}` : (localIp ? `${clientIp}#${localIp}` : `${clientIp}#${deviceName}`);

  try {
    // Check if Sentinel has currently quarantined this IP or specific device behind shared Wi-Fi
    const checkUrl = `${SENTINEL_ENGINE_URL}/api/security/check-ip/${encodeURIComponent(clientIp)}?device_id=${encodeURIComponent(deviceId)}&device_name=${encodeURIComponent(deviceName)}&local_ip=${encodeURIComponent(localIp)}`;
    const response = await fetch(checkUrl, {
      headers: { "User-Agent": "FinSight-Gateway-Defense/2.0", "X-Device-Id": deviceId, "X-Device-Name": deviceName, "X-Local-Ip": localIp },
      signal: AbortSignal.timeout(2000) // 2-second fail-open safety timeout
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.blocked) {
        // STRICT DEVICE ISOLATION BEHIND NAT / SHARED WI-FI:
        // 1. Cross-Platform Disambiguation (Mobile vs Desktop/PC):
        if (data.device_name && deviceName) {
          const isTargetMob = /mobile|phone|android|iphone|ipad/i.test(data.device_name);
          const isCurrentMob = /mobile|phone|android|iphone|ipad/i.test(deviceName);
          if (isTargetMob !== isCurrentMob) {
            return next(); // Laptop spared if Mobile attacked, Mobile spared if Laptop attacked!
          }
        }

        // 2. Intra-Platform LAN IP Disambiguation (e.g. 2 different laptops on same subnet):
        if (data.local_ip && localIp && data.local_ip !== localIp) {
          return next();
        }

        const challengeQuery = `ip=${encodeURIComponent(clientIp)}&device_id=${encodeURIComponent(deviceId)}&device_name=${encodeURIComponent(deviceName)}&local_ip=${encodeURIComponent(localIp)}`;
        const challengeUrl = `${SENTINEL_ENGINE_URL}/challenge?${challengeQuery}`;

        // IP/Device is blocked in Sentinel -> Return HTTP 429
        if (req.path.startsWith("/api") || (req.headers.accept && req.headers.accept.includes("application/json"))) {
          return res.status(429).json({
            error: "Sentinel Active Defense: Quarantined",
            blocked: true,
            ip: clientIp,
            local_ip: localIp,
            device_name: deviceName,
            device_id: deviceId,
            incident_id: data.incident_id || "INC-2037",
            status: data.status || "QUARANTINED",
            reason: data.reason || "Active Defense Policy Violation",
            challenge_url: challengeUrl
          });
        }

        // Direct browser visit: immediately redirect to challenge screen
        return res.status(429).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>429 - Quarantined | FinSight Active Defense</title>
            <meta http-equiv="refresh" content="0; url=${challengeUrl}">
          </head>
          <body style="background:#080c14;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
            <p>Access Quarantined by Sentinel Active Defense. Redirecting to Security Challenge...</p>
          </body>
          </html>
        `);
      } else {
        // SRE HAS RELEASED THIS IP/DEVICE (or client is unblocked / self-healed)!
        const clientData = ipRequestCounts.get(clientKey) || ipRequestCounts.get(clientIp);
        if (clientData && clientData.isQuarantined) {
          clientData.isQuarantined = false;
          clientData.count = 0;
          clientData.burstCount = 0;
          clientData.burstStart = Date.now();
          clientData.startTime = Date.now();
          clientData.releasedAt = Date.now(); // 30-second immunity grace window to prevent re-banning loops
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
  const { deviceId, deviceName, localIp } = getClientDevice(req);
  let clientKey = deviceId ? `${clientIp}#${deviceId}` : (localIp ? `${clientIp}#${localIp}` : `${clientIp}#${deviceName}`);
  const currentTime = Date.now();

  // If clientKey is not directly in map, check if this physical device (same IP & device category) is already tracked
  if (!ipRequestCounts.has(clientKey)) {
    const isCurrentMob = /mobile|phone|android|iphone|ipad/i.test(deviceName || "");
    for (const [existingKey, existingData] of ipRequestCounts.entries()) {
      if (existingData.ip === clientIp) {
        const isExistingMob = /mobile|phone|android|iphone|ipad/i.test(existingData.deviceName || "");
        if (isCurrentMob === isExistingMob) {
          const confLocal = localIp && existingData.localIp && localIp !== existingData.localIp;
          const confDev = deviceId && existingData.deviceId && deviceId !== existingData.deviceId;
          if (!confLocal && !confDev) {
            clientKey = existingKey;
            break;
          }
        }
      }
    }
  }

  if (!ipRequestCounts.has(clientKey)) {
    ipRequestCounts.set(clientKey, {
      ip: clientIp,
      localIp,
      deviceId,
      deviceName,
      count: 1,
      startTime: currentTime,
      burstCount: 1,
      burstStart: currentTime,
      lastReported: 0,
      isQuarantined: false,
      releasedAt: 0
    });
    activeTopIp = clientIp;
    activeTopLocalIp = localIp;
    activeTopDeviceId = deviceId;
    activeTopDeviceName = deviceName;
    activeTopIpCount = 1;
  } else {
    const clientData = ipRequestCounts.get(clientKey);
    if (localIp && !clientData.localIp) clientData.localIp = localIp;
    if (deviceId && !clientData.deviceId) clientData.deviceId = deviceId;
    if (deviceName && !clientData.deviceName) clientData.deviceName = deviceName;

    // If client was recently released (within last 6 seconds), give grace window so frontend hydration does not re-quarantine
    if (clientData.releasedAt && (currentTime - clientData.releasedAt < 30000)) {
      clientData.burstCount = 0;
      clientData.count = 0;
      clientData.burstStart = currentTime;
      clientData.startTime = currentTime;
    } else {
      // Reset rolling 10-second window
      if (currentTime - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
        clientData.count = 1;
        clientData.startTime = currentTime;
      } else {
        clientData.count++;
      }

      // Reset burst 2.5-second window
      if (currentTime - clientData.burstStart > BURST_WINDOW_MS) {
        clientData.burstCount = 1;
        clientData.burstStart = currentTime;
      } else {
        clientData.burstCount++;
      }
    }

    // Compute true top requester based on highest activity in the current window
    let topClient = clientData;
    let maxActivity = clientData.burstCount;
    for (const [k, d] of ipRequestCounts.entries()) {
      // Purge entries inactive for > 20 seconds
      if (currentTime - d.burstStart > 20000 && currentTime - d.startTime > 20000) {
        ipRequestCounts.delete(k);
        continue;
      }
      if (d.burstCount > maxActivity) {
        maxActivity = d.burstCount;
        topClient = d;
      }
    }
    activeTopIp = topClient.ip;
    activeTopLocalIp = topClient.localIp || "";
    activeTopDeviceId = topClient.deviceId || "";
    activeTopDeviceName = topClient.deviceName || "";
    activeTopIpCount = topClient.count;

    // Per-Client Individual Attacker Velocity (RPS):
    // Only registers above 0.0 if this specific client is sending rapid burst requests (>= 2 in window)
    if (currentTime - topClient.burstStart < 3500 && topClient.burstCount >= 2) {
      activeTopClientRps = Number((topClient.burstCount / (BURST_WINDOW_MS / 1000)).toFixed(2));
    } else {
      activeTopClientRps = 0.0; // Flatline at 0.0 when no one is attacking!
    }

    // Surge trigger: >= 12 req in 2.5s (burst DoS) OR >= 25 req in 10s (sustained flood)
    const isBurstSpike = clientData.burstCount >= BURST_LIMIT;
    const isSustainedFlood = clientData.count >= MAX_REQUESTS;

    if (isBurstSpike || isSustainedFlood) {
      clientData.isQuarantined = true;
      // Debounce threat reports: send to Sentinel at most once every 10 seconds per device
      if (currentTime - (clientData.lastReported || 0) > 10000) {
        clientData.lastReported = currentTime;
        const reason = isBurstSpike
          ? `Volumetric burst attack (${clientData.burstCount} req in 2.5s) exceeding safe threshold`
          : `Sustained volumetric flood (${clientData.count} req in 10s exceeding threshold)`;

        console.log(`[DEFENSE ENGAGED] Jailing rogue client: ${clientKey} (${deviceName}) - Reason: ${reason}`);

        fetch(`${SENTINEL_ENGINE_URL}/api/security/report-threat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ip: clientIp,
            local_ip: clientData.localIp || localIp,
            device_id: clientData.deviceId || deviceId,
            device_name: clientData.deviceName || deviceName,
            target_key: clientKey,
            velocity_rps: Number((clientData.burstCount / (BURST_WINDOW_MS / 1000)).toFixed(2)),
            burst_count: clientData.burstCount,
            policy: "AUTO_COOLDOWN", // Enables 12s self-healing cooldown
            reason: reason
          })
        }).catch(() => {});
      }

      // Return HTTP 429
      if (req.path.startsWith("/api") || (req.headers.accept && req.headers.accept.includes("application/json"))) {
        const challengeQuery = `ip=${encodeURIComponent(clientIp)}&device_id=${encodeURIComponent(deviceId)}&device_name=${encodeURIComponent(deviceName)}&local_ip=${encodeURIComponent(localIp)}`;
        const challengeUrl = `${SENTINEL_ENGINE_URL}/challenge?${challengeQuery}`;
        return res.status(429).json({
          error: "Sentinel Active Defense: Volumetric traffic spike detected. Your device has been quarantined.",
          blocked: true,
          ip: clientIp,
          local_ip: localIp,
          device_name: deviceName,
          device_id: deviceId,
          challenge_url: challengeUrl
        });
      }

      const challengeQuery = `ip=${encodeURIComponent(clientIp)}&device_id=${encodeURIComponent(deviceId)}&device_name=${encodeURIComponent(deviceName)}&local_ip=${encodeURIComponent(localIp)}`;
      const challengeUrl = `${SENTINEL_ENGINE_URL}/challenge?${challengeQuery}`;
      return res.status(429).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>429 - Quarantined | FinSight Active Defense</title>
          <meta http-equiv="refresh" content="0; url=${challengeUrl}">
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
  const now = Date.now();
  const ipCategoryDevices = new Map();
  let maxBurst = 0;
  let topBurstClient = null;

  for (const [k, d] of ipRequestCounts.entries()) {
    // Purge entries inactive for > 10 seconds
    if (now - d.startTime > 10000 && now - d.burstStart > 10000) {
      ipRequestCounts.delete(k);
      continue;
    }

    // Decay burst count if burst window has expired (older than 2.5s)
    if (now - d.burstStart > BURST_WINDOW_MS) {
      d.burstCount = 0;
    } else if (d.burstCount > maxBurst) {
      maxBurst = d.burstCount;
      topBurstClient = d;
    }

    // Deduplicate unique human visitor / physical device:
    // Groups by: (public IP, device category: Mobile vs Desktop)
    // Within each group, counts distinct physical LAN IPs / device IDs.
    // A single phone or PC refreshing/attacking NEVER produces > 1 count!
    const isClientMob = /mobile|phone|android|iphone|ipad/i.test(d.deviceName || "");
    const clientCat = isClientMob ? "Mobile" : "Desktop";
    const groupKey = `${d.ip}#${clientCat}`;

    if (!ipCategoryDevices.has(groupKey)) {
      ipCategoryDevices.set(groupKey, new Set());
    }
    const subSet = ipCategoryDevices.get(groupKey);
    const subIdentifier = d.localIp || d.deviceId || "primary";
    subSet.add(subIdentifier);
  }

  let totalActiveUsers = 0;
  for (const [groupKey, subSet] of ipCategoryDevices.entries()) {
    if (subSet.size > 1 && subSet.has("primary")) {
      subSet.delete("primary");
    }
    totalActiveUsers += subSet.size;
  }

  // Live Threat Velocity: ONLY > 0.0 if a client is actively blasting rapid requests (>= 4 requests in 2.5s window)
  let liveThreatRps = 0.0;
  let threatTargetIp = null;
  let threatTargetLocalIp = "";
  let threatTargetDeviceId = "";
  let threatTargetDeviceName = "";
  let threatBurstCount = 0;

  if (topBurstClient && (now - topBurstClient.burstStart <= BURST_WINDOW_MS) && topBurstClient.burstCount >= 4) {
    liveThreatRps = Number((topBurstClient.burstCount / (BURST_WINDOW_MS / 1000)).toFixed(2));
    threatTargetIp = topBurstClient.ip;
    threatTargetLocalIp = topBurstClient.localIp || "";
    threatTargetDeviceId = topBurstClient.deviceId || "";
    threatTargetDeviceName = topBurstClient.deviceName || "";
    threatBurstCount = topBurstClient.burstCount;
  }

  // Keep state synchronized
  activeTopClientRps = liveThreatRps;
  if (liveThreatRps === 0.0) {
    activeTopIp = null;
    activeTopLocalIp = "";
    activeTopDeviceId = "";
    activeTopDeviceName = "";
    activeTopIpCount = 0;
  }

  res.status(200).json({
    service: "FinSight API",
    status: "UP",
    uptime_seconds: Math.floor(process.uptime()),
    total_requests: totalRequests,
    active_users: totalActiveUsers,
    active_top_ip: threatTargetIp,
    active_top_local_ip: threatTargetLocalIp,
    active_top_device_id: threatTargetDeviceId,
    active_top_device_name: threatTargetDeviceName,
    active_top_requests: threatBurstCount,
    top_client_rps: liveThreatRps,
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

// Sentinel Gateway Ping & Platform Status Routes (invoked on every page load/refresh)
app.get("/api/gateway/ping", (req, res) => {
  res.status(200).json({ status: "OK", gateway: "FinSight Active Defense", timestamp: new Date().toISOString() });
});
app.get("/api/platform/status", (req, res) => {
  res.status(200).json({ status: "ONLINE", engine: "FinSight Financial Engine", timestamp: new Date().toISOString() });
});

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
