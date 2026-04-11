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
Now supported with an included GitHub Actions workflow (`.github/workflows/deploy-pages.yml`).
Push to `main` and Pages deploys automatically after typecheck + build pass.

## Release sanity checks

After deployment, verify:

1. dashboard loads
2. workbook link opens
3. AI tutor explains a concept when the key is configured
4. build contains the workbook HTML under `/workbooks/`
5. the app works on mobile without the nav exploding into modern art


## GitHub Pages setup (one-time)

1. In GitHub, open **Settings → Pages** for this repo.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.
3. Ensure your default branch is `main` (or update the workflow trigger).
4. Push to `main` and wait for **Deploy to GitHub Pages** workflow to finish.
5. Open the published URL shown in the workflow logs and run the release sanity checks above.

The Vite base path is auto-set during GitHub Actions builds, so assets resolve correctly under `/<repo-name>/`.
