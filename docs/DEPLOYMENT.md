# Deployment Checklist

## Before deploy

- [ ] `npm install`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] workbook files live in `public/workbooks/`
- [ ] `public/workbooks/index.html` exists
- [ ] dashboard links open the Practical Builder v5 and workbook hub correctly
- [ ] mobile navigation works
- [ ] AI tutor fails gracefully when no backend URL is configured
- [ ] no provider API keys are injected into static GitHub Pages builds

## Workbook artifact checks

GitHub Pages builds must contain:

```bash
test -f dist/workbooks/neuroanatomy-builder-v5.html
test -f dist/workbooks/lab5-spinal-cord-workbook.html
test -f dist/workbooks/index.html
```

Expected deployed paths:

- `/neuromind-anhb2217/workbooks/`
- `/neuromind-anhb2217/workbooks/neuroanatomy-builder-v5.html`
- `/neuromind-anhb2217/workbooks/lab5-spinal-cord-workbook.html`

## Recommended deployment targets

### GitHub Pages

Use GitHub Pages for the static atlas UI and workbook assets.

```bash
npm run build:gh-pages
```

Static builds must not receive `GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`, `VITE_GITHUB_TOKEN`, `VITE_OPENROUTER_API_KEY`, or any other private provider token. Browser bundles are public artifacts.

### Backend deployment for AI features

AI tutor generation requires the Node server. Put `GEMINI_API_KEY` only in the backend host environment.

If the static frontend should call a hosted backend, build it with:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url npm run build:gh-pages
```

The frontend should call the backend `/api/generate` endpoint, not provider APIs directly.

### Vercel or Render

Good targets for the Node-backed app. Add `GEMINI_API_KEY` to the host environment variables and run:

```bash
npm install
npm run build
NODE_ENV=production npx tsx server.ts
```

## Release sanity checks

After deployment, verify:

1. dashboard loads
2. Practical Builder v5 opens from the dashboard
3. workbook hub opens at `/workbooks/`
4. Lab 5 workbook opens from the workbook hub
5. AI tutor gives a clear backend configuration error on static-only deployments
6. AI tutor works when a backend is deployed and `VITE_API_BASE_URL` is configured
7. mobile navigation works without the nav turning into layout confetti

## Release gate

Latest formal readiness check before this update: **April 22, 2026**.

After any workbook or deployment change, re-run:

```bash
npm run lint
npm run build
test -f dist/workbooks/neuroanatomy-builder-v5.html
test -f dist/workbooks/lab5-spinal-cord-workbook.html
test -f dist/workbooks/index.html
```
