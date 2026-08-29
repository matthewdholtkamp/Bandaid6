// BAND-AID 6 — Cloudflare Worker proxy for Gemini API (streaming)
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

    const primaryModel = body.model || "gemini-3.5-flash-lite";
    const fallbackModel = body.fallbackModel || "gemini-3.7-flash";
    const generationConfig = body.generationConfig || {
      thinkingConfig: { thinkingLevel: "low" }
    };

    // Decide whether the client wants streaming. Default to streaming.
    const url = new URL(request.url);
    const wantsStream = url.searchParams.get("stream") !== "0" && body.stream !== false;

    const endpoint = wantsStream ? "streamGenerateContent?alt=sse" : "generateContent";

    const callModel = (model) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}${wantsStream ? "&" : "?"}key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: body.systemInstruction,
          contents: body.contents,
          generationConfig,
          tools: body.tools,
          safetySettings: body.safetySettings
        })
      }
    );

    let upstream = await callModel(primaryModel);
    let usedModel = primaryModel;

    // On quota / rate limit / server errors, fall back to the secondary model.
    if (
      fallbackModel &&
      fallbackModel !== primaryModel &&
      (upstream.status === 429 || upstream.status === 503 || upstream.status === 500)
    ) {
      upstream = await callModel(fallbackModel);
      usedModel = fallbackModel;
    }

    // Non-OK responses: return as JSON for clean error handling on the client.
    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Model-Used": usedModel
        }
      });
    }

    if (wantsStream) {
      // Pipe the Server-Sent Events stream straight through to the browser.
      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Model-Used": usedModel
        }
      });
    }

    // Non-streaming fallback (legacy path).
    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Model-Used": usedModel
      }
    });
  }
};
