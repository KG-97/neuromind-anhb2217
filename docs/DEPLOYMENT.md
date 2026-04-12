# Deployment Checklist

## Before deploy

- [ ] `npm install`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `.env.local` contains `VITE_GEMINI_API_KEY`
- [ ] workbook files live in `public/workbooks/`
- [ ] main dashboard links open correctly
- [ ] mobile navigation works on the Lab 5 workbook
- [ ] AI tutor fails gracefully when no API key is present

## Recommended deployment targets

### Vercel
Good default for the React app. Minimal setup and easy previews.

### Netlify
Also fine for static hosting.

### GitHub Pages
Possible, but slightly more annoying if the Vite base path changes. Use only if you specifically want repo-native hosting.

## Release sanity checks

After deployment, verify:

1. dashboard loads
2. workbook link opens
3. AI tutor explains a concept when the key is configured
4. build contains the workbook HTML under `/workbooks/`
5. the app works on mobile without the nav exploding into modern art


## Release gate (latest reassessment)

Latest formal readiness check: **April 12, 2026**.

- Status: **Ready to deploy** (typecheck/build/workbook artifact checks passed)
- Detailed report: [`docs/RELEASE_REASSESSMENT_2026-04-12.md`](./RELEASE_REASSESSMENT_2026-04-12.md)

If this date gets stale, re-run:

```bash
npm run typecheck
npm run build
test -f dist/workbooks/lab5-spinal-cord-workbook.html
```
