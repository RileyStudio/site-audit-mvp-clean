# Site Audit App

This is a lightweight website audit app:
- User pastes a URL
- App runs a quick audit using Google PageSpeed Insights + basic on-page checks
- Generates a clean report with a score + plain-English recommendations
- (Optional) Uses OpenAI to rewrite recommendations in your voice

## 1) Requirements
- Node.js 18+ (or 20+)
- A Google PageSpeed Insights API key (recommended)
- Optional: OpenAI API key (for nicer explanations)

## 2) Setup
1. Install deps:
   ```bash
   npm install
   ```

2. Create `.env.local` in the project root:
   ```bash
   PAGESPEED_API_KEY=YOUR_KEY_HERE
   OPENAI_API_KEY=YOUR_KEY_HERE   # optional
   ```

3. Run dev:
   ```bash
   npm run dev
   ```

Open: http://localhost:3000

## 3) Deploy
Easiest: Vercel (imports Next.js automatically).

Netlify: use the Next.js runtime/plugin. If you already use Netlify, we can set this up in a few clicks.

## 4) Payments (optional)
This project includes an optional Stripe Checkout unlock flow for the full report.
Set the Stripe variables in `.env.local` (see `.env.local.example`).


## Windows: easiest way to create the env file (no hidden-dot issues)
1) Run this once from PowerShell (inside the project folder):
```powershell
powershell -ExecutionPolicy Bypass -File .\create-env.ps1
```

2) Open `.env.local` and replace `PASTE_YOUR_KEY_HERE` with your real PageSpeed API key.

3) Restart the dev server:
```powershell
npm run dev
```

(Alternative) You can copy `.env.local.example` to `.env.local` manually, but the script avoids Windows filename/extension problems.


## Environment Variables

Create a `.env.local` with:

- `OPENAI_API_KEY`
- `PAGESPEED_API_KEY` (recommended to avoid quota errors)
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL` (optional, for redirects)
