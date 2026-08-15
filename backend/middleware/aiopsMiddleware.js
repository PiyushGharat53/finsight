const axios = require('axios');

// URL of your Python Sentinel AIOps backend (can be configured via environment variables)
const SENTINEL_API_URL = process.env.SENTINEL_API_URL || 'http://localhost:8000';

const aiopsShieldMiddleware = async (req, res, next) => {
  try {
    // 1. Check current defense status from Python Sentinel AIOps backend
    const response = await axios.get(`${SENTINEL_API_URL}/defense/status`, { timeout: 2000 });
    const { defense_mode } = response.data;

    if (defense_mode) {
      const clientIp = req.ip || req.connection.remoteAddress;

      // 2. Check if the user's IP is currently blocklisted by AI
      try {
        const blocklistRes = await axios.get(`${SENTINEL_API_URL}/defense/blocklist`, { timeout: 2000 });
        const blockedIps = blocklistRes.data.blocked_ips || [];

        if (blockedIps.includes(clientIp)) {
          return res.status(403).json({
            detail: "Access denied: your IP has been blocklisted by Sentinel Active Defense.",
            ip: clientIp
          });
        }
      } catch (err) {
        console.warn("[SENTINEL] Could not verify blocklist, proceeding with defense mode block.");
      }

      // 3. If defense mode is active, safeguard sensitive financial write operations (POST, PUT, DELETE)
      if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return res.status(429).json({
          error: "Sentinel Active Defense Engaged",
          message: "Anomalous traffic detected. Financial transaction creation and write operations are temporarily restricted."
        });
      }
    }

    next();
  } catch (error) {
    // Fail-open architecture: If the Python AIOps monitor is down, FinSight continues running smoothly
    next();
  }
};

module.exports = aiopsShieldMiddleware;