# ANHB2217 Neuroanatomy Practical Builder v5

Generated upgrade package for the ANHB2217 neuroanatomy practical trainer.

## What changed

- Rebuilt the uploaded single-file HTML into an offline-first study app.
- Removed runtime dependency on React, Babel, Tailwind CDN, and external scripts.
- Preserved embedded real station images and the existing question data.
- Added a polished dashboard with practical readiness scoring.
- Added station cockpit workflow: zoomable images, target checklist, self-rating, notes, bookmarks, and oral prompts.
- Added timed mocktical mode with mixed, weak queue, current station, pathways, and cranial nerve drill pools.
- Added cranial nerve atlas and pathway logic views.
- Added progress export/import, reset, print, and copyable 25-minute study plan.

## Local artifact

The full HTML app is intentionally kept as a single offline `.html` file because the embedded station images make it large. Keep this repo note as the release manifest and store the full artifact in Drive or the release assets area.

Suggested filename:

```text
NeuroMind_ANHB2217_neuroanatomy_builder_v5_offline.html
```

## Deploy notes

This repo already supports a full-stack Vite/Node workflow. If the offline builder is later converted into the main app, split the embedded data into static assets and import it through the existing Vite build pipeline.
