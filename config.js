// BAND-AID 6 — front-end configuration
// Set this to your deployed Cloudflare Worker URL after you deploy worker.js
// Example: https://bandaid6.your-subdomain.workers.dev
window.BANDAID_CONFIG = {
  WORKER_URL: "https://CHANGE-ME.workers.dev",
  MODEL: "gemini-3.1-flash-lite",
  FALLBACK_MODEL: "gemini-2.5-flash",
  TEMPERATURE: 0.7,
  // Thinking budget: 0 = off, -1 = dynamic (model decides), or explicit token cap (e.g. 8192 for "high thinking")
  THINKING_BUDGET: -1
};
