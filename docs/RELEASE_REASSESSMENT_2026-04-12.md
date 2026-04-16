# Release Reassessment — April 12, 2026

## Scope

This reassessment was run to answer: **is NeuroMind ready to deploy now?**

## Checks run

- `npm run typecheck` ✅
- `npm run build` ✅
- Confirmed workbook artifact is emitted at `dist/workbooks/lab5-spinal-cord-workbook.html` ✅
- Confirmed app links target `/workbooks/lab5-spinal-cord-workbook.html` in key entry points ✅

## Go / No-Go decision

**GO (technical readiness):** the current build is deployable as a static Vite application.

## Remaining pre-production items

These are not code blockers but should be confirmed during deployment setup:

1. Hosting provider project is configured (Vercel or Netlify).
2. Runtime env var is set in host dashboard:
   - `VITE_GEMINI_API_KEY`
3. Post-deploy smoke tests pass:
   - dashboard loads
   - workbook opens
   - AI tutor degrades gracefully without key
   - mobile workbook nav behaves correctly

## Deployment command references

Use one of the following in a configured CI/CD or local deploy context:

### Vercel

```bash
npm run build
npx vercel --prod
```

### Netlify

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

## Notes

- This repository currently has no dedicated `npm run deploy` script; deployment is host-driven.
- Build output size and module count are intentionally small for this iteration and are not errors.
