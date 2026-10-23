// Sentinel Layer-7 Client Device & Local Network Identity
function getClientNetworkIdentity() {
  let devId = localStorage.getItem("sentinel_device_id");
  if (!devId) {
    devId = "dev-" + Math.random().toString(36).substring(2, 8);
    localStorage.setItem("sentinel_device_id", devId);
  }
  
  const ua = navigator.userAgent || "";
  let devName = "Desktop";
  let ipOffset = 100;
  if (/android/i.test(ua)) { devName = "Android Mobile"; ipOffset = 140; }
  else if (/iphone|ipad/i.test(ua)) { devName = "Apple Mobile"; ipOffset = 160; }
  else if (/windows/i.test(ua)) { devName = "Windows PC"; ipOffset = 100; }
  else if (/mac/i.test(ua)) { devName = "Mac"; ipOffset = 120; }
  else if (/linux/i.test(ua)) { devName = "Linux PC"; ipOffset = 180; }

  let localIp = localStorage.getItem("sentinel_local_ip");
  if (!localIp) {
    let hash = 0;
    for (let i = 0; i < devId.length; i++) hash = (hash * 31 + devId.charCodeAt(i)) % 30;
    localIp = `192.168.1.${ipOffset + hash}`;
    localStorage.setItem("sentinel_local_ip", localIp);
  }

  return { id: devId, name: devName, localIp };
}

// Global Fetch Interceptor: attaches device and local IP to all outgoing requests
if (typeof window !== "undefined" && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function (url, options = {}) {
    try {
      const dev = getClientNetworkIdentity();
      const opts = { ...options };
      opts.headers = opts.headers ? { ...opts.headers } : {};
      opts.headers["X-Device-Id"] = dev.id;
      opts.headers["X-Device-Name"] = dev.name;
      opts.headers["X-Local-Ip"] = dev.localIp;
      return originalFetch.call(this, url, opts);
    } catch (e) {
      return originalFetch.call(this, url, options);
    }
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
