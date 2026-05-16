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

You have two options.

**Option A — Automatic via GitHub Actions (recommended)**

The `.github/workflows/deploy-worker.yml` workflow deploys the Worker on every push that touches `worker.js` or `wrangler.toml`. It reads three GitHub Secrets:

- `Neurology_API` — your Google AI Studio (Gemini) API key
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Workers Edit permission
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID

Add the two Cloudflare secrets in **Settings → Secrets and variables → Actions**, then push. The workflow uploads `Neurology_API` to the Worker as `GEMINI_API_KEY` and deploys.

**Option B — Manual via Wrangler CLI**

```bash
npm install -g wrangler
wrangler login
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

## Model & generation settings

- **Default model:** `gemini-3.1-flash-lite` — swap in the UI dropdown.
- **Temperature:** `0.4` (set in `config.js`). Low enough to stay in character, high enough for natural variation. Drop to `0.2` for more deterministic answers, raise to `0.7` for more conversational range.
- **Thinking depth:** Flash Lite supports `thinkingConfig.thinkingBudget`. The UI exposes three options:
  - **Off** — fastest, cheapest, no extended reasoning.
  - **Dynamic** (default) — model decides how much to think per turn.
  - **High** — `thinkingBudget: 8192`, deeper reasoning for nuanced questions (BH, ethics, command).

## Persona

The persona is captured in the `SYSTEM_PROMPT` constant inside `index.html`. Edit there to refine voice, priorities (Access via Care Ladder, Quality, Staff Care), service lines (PCS, ER, BH, 3FL), leadership style, and FAQs.

## License

MIT — see `LICENSE`.
