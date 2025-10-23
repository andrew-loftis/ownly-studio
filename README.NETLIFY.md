Netlify deployment notes

Use the Netlify Next.js plugin (@netlify/plugin-nextjs) which supports Next features and App Router.

Quick steps:

1. Install plugin locally (optional):

   npm i -D @netlify/plugin-nextjs

2. Add `netlify.toml` (already added to the repo).

3. In Netlify UI, connect the repo, and set build command: `npm run build` and publish directory: `.next`.

4. Add environment variables in the Netlify site settings (the keys in `.env.example`).

5. If you see a 404 for routes, ensure the Netlify plugin is enabled and your Node version matches (use `18` or `20`).

Notes:
- Do NOT use a static redirect to /index.html for Next App Router—the plugin handles routes. If you still get 404s, enable plugin and remove manual redirects.
- For edge functions or advanced rewrites, configure through Netlify plugin docs.
