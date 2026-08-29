// BAND-AID 6 — front-end configuration
// Set this to your deployed Cloudflare Worker URL after you deploy worker.js
// Example: https://bandaid6.your-subdomain.workers.dev
window.BANDAID_CONFIG = {
  WORKER_URL: "https://bandaid6.mholtkamp.workers.dev",
  MODEL: "gemini-3.5-flash-lite",
  FALLBACK_MODEL: "gemini-3.7-flash",
  THINKING_LEVEL: "low"
};
