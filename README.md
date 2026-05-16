# BAND-AID 6

Single-page web app that responds as a persona of LTC Matthew Holtkamp — Deputy Commander for Clinical Services (DCCS) at GLWACH and MSCoE Surgeon at Fort Leonard Wood.

The front-end is static HTML/CSS/JS hosted on GitHub Pages. The Gemini API key never lives in the browser — a small Cloudflare Worker proxies requests and holds the key as a secret.

## Architecture

```
Browser (GitHub Pages)  ───▶  Cloudflare Worker (holds GEMINI_API_KEY)  ───▶  Gemini API
```

## Files

- `index.html` — chat UI (army.mil styling, large ChatGPT-style composer)
- `config.js` — sets `WORKER_URL` for the front-end
- `worker.js` — Cloudflare Worker that proxies to Gemini
- `.gitignore`, `LICENSE` — standard

## Deploy

### 1. Deploy the Cloudflare Worker

```bash
npm install -g wrangler
wrangler login
wrangler init bandaid6 --type javascript
```

Replace the generated `src/index.js` with `worker.js` from this repo, then:

```bash
wrangler secret put GEMINI_API_KEY
# paste your Google AI Studio key when prompted

wrangler deploy
```

Wrangler will print a URL like `https://bandaid6.your-subdomain.workers.dev`.

### 2. Update front-end config

Edit `config.js` and set `WORKER_URL` to the Worker URL above.

Edit `worker.js` `ALLOWED_ORIGINS` to include your GitHub Pages URL (e.g. `https://matthewdholtkamp.github.io`). Redeploy the worker.

### 3. Enable GitHub Pages

In the repo settings → Pages → deploy from branch `main` / root.

Your app will be live at `https://matthewdholtkamp.github.io/Bandaid6/`.

## Local dev

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

`localhost:8000` is already in the Worker's allowed origins.

## Persona

The persona is captured in the `SYSTEM_PROMPT` constant inside `index.html`. Edit there to refine voice, priorities (Access via Care Ladder, Quality, Staff Care), service lines (PCS, ER, BH, 3FL), leadership style, and FAQs.

## License

MIT — see `LICENSE`.
