// BAND-AID 6 — Cloudflare Worker proxy for Gemini API
// Deploy this on Cloudflare Workers. Add GEMINI_API_KEY as a secret:
//   wrangler secret put GEMINI_API_KEY
//
// Update ALLOWED_ORIGINS below to include your GitHub Pages URL.

const ALLOWED_ORIGINS = [
  "https://matthewdholtkamp.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    const corsHeaders = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const model = body.model || "gemini-2.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: body.systemInstruction,
        contents: body.contents,
        generationConfig: body.generationConfig || { temperature: 0 }
      })
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
