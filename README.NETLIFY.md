Netlify deployment notes

Use the Netlify Next.js Runtime (`@netlify/plugin-nextjs`) which supports Next.js App Router, SSR/ISR, and routing on Netlify.

Quick steps (monorepo-friendly):

1) Connect the GitHub repo in Netlify.

2) Build settings (Site settings → Build & deploy → Build settings → Edit):

   - Base directory: `ownly-studio`  ← important (your Next.js app lives in this subfolder)
   - Build command: `npm run build`
   - Publish directory: leave BLANK (let the plugin manage outputs)
   - Functions directory: leave BLANK

3) Environment variables: add the keys from `.env.example` as needed (e.g., Firebase/Stripe/OpenAI). Also set `NODE_VERSION` to `18` or `20` (matches local).

4) The repo already includes `netlify.toml` with the Next.js plugin enabled. No extra UI plugin configuration required.

5) Trigger a deploy.

Troubleshooting:
- 404s after deploy: usually caused by setting a custom Publish directory (e.g., `.next`). Clear Publish/Functions fields so the Next.js plugin can handle routing and outputs.
- Build fails at root: if your repo root also contains a `package.json` without a `build` script, set Base directory to `ownly-studio` so Netlify runs in the correct folder (and picks up `netlify.toml` there).
- Node version mismatch: Set `NODE_VERSION` in Site settings → Environment.
- Sitemaps: The build runs `next-sitemap` after `next build`. If you want a canonical URL, set `NEXT_PUBLIC_SITE_URL` in the site environment.
- Avoid custom redirects to `/index.html`; the plugin manages App Router routes automatically.
