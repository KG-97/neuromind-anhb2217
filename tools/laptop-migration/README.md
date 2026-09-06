# Laptop migration kit — Acer AG15-31P → new Windows laptop

Five PowerShell scripts, run in order. Nothing deletes anything until you
explicitly pass `-Execute`, and nothing is copied to a cloud folder that
shouldn't be.

## The one thing that matters most

`C:\Users\Kalev\Downloads\gravity draft new\` holds the master *Gravity Rooms*
manuscript, LineEdit sources, pipeline scripts, canonical status and the Author
To-Do. **Its Drive backup has been broken since 2026-07-18**, which means it
currently exists in exactly one place — on the laptop you are about to replace.
Step 2 stages it first and hashes every file; step 5 verifies those hashes on the
new machine. Do not wipe the old laptop until step 5 comes back clean.

## Sensitivity tiers

The export sorts everything into three buckets, because you're using both an
external drive and cloud sync and they are not interchangeable:

| Tier | Goes where | Why |
|---|---|---|
| `TIER1_CONFIDENTIAL` | External drive **only** — encrypt it | Raw ChatGPT export, court PDFs (Form 15 ×2, Form 16, affidavits), `court_email_bodies.json`. Third-party legal names, DOB, a discharge summary, addresses, case numbers, and one minor. |
| `TIER2_SETUP` | External drive (travels with Tier 1) | SSH/GPG keys, `.claude.json`, `.npmrc` — live secrets. |
| `TIER3_PORTABLE` | Drive/OneDrive fine | Documents, Pictures, Desktop, media. |

`2-Export.ps1` refuses to write Tier 1 or 2 to a destination that looks
cloud-synced. Override only deliberately, with `-IAcceptCloudRisk`.

## Run order

### On EITHER laptop, first

**0 — Install the handoff into Claude Code's memory.**
```powershell
powershell -ExecutionPolicy Bypass -File .\0-InstallMemory.ps1
```
Writes `HANDOFF.md` into `%USERPROFILE%\.claude\CLAUDE.md` between markers, so
every future Claude Code session on that machine loads the migration state at
startup and you never have to re-explain it. Idempotent — re-run after editing
`HANDOFF.md`; `-Remove` takes it back out. Run it on the old laptop now and on
the new one once it's set up.

### On the OLD laptop

**1 — Survey (read-only, ~5–15 min).**
```powershell
powershell -ExecutionPolicy Bypass -File .\1-Inventory.ps1
```
Writes `%USERPROFILE%\MigrationReport\`: `INVENTORY.md` (read it),
`inventory.json` (send it back to me), `winget-packages.json`,
`vscode-extensions.txt`. Secret-looking env vars are redacted in the output.

**2 — Dry-run the export, then run it.**
```powershell
powershell -ExecutionPolicy Bypass -File .\2-Export.ps1 -Destination E:\Migration -DryRun
powershell -ExecutionPolicy Bypass -File .\2-Export.ps1 -Destination E:\Migration
```
Edit the `$Manifest` block at the top first — anything not listed does not get
carried over. Produces `MANIFEST.md`, `manifest.json`, `SOURCE-HASHES.json`, and
per-item robocopy logs in `_logs\`.

**3 — Audit what to leave behind, then clean.**
```powershell
powershell -ExecutionPolicy Bypass -File .\3-Cleanup.ps1                 # audit only
powershell -ExecutionPolicy Bypass -File .\3-Cleanup.ps1 -Execute        # elevated
```
Audit mode is the default and deletes nothing. `-Execute` prompts for a typed
`YES`, then removes only entries it flagged **safe**; anything marked `REVIEW`
(Windows.old, old session transcripts) is left for you. Run elevated to reach
system paths. Narrow it with `-Categories BuildArtifacts,PackageCaches`.

### On the NEW laptop

**4 — Optimise and restore (elevated).**
```powershell
powershell -ExecutionPolicy Bypass -File .\4-SetupNewLaptop.ps1 -Phase All -ExportRoot E:\Migration -DryRun
powershell -ExecutionPolicy Bypass -File .\4-SetupNewLaptop.ps1 -Phase All -ExportRoot E:\Migration
```
Phases: `Debloat` (OEM/consumer appx, ad and suggestion surfaces), `Settings`
(file extensions, hidden files, long paths, dev mode, hibernation off, no sleep
on AC, System Restore at 5%), `Install` (baseline tooling + `winget import` +
VS Code extensions), `Restore` (Tier 2 configs and Tier 1 content back into
place), `Defender` (exclusion paths for dependency trees — the biggest single
build-speed win).

Review the `$removeAppx` list before running Debloat. It's tuned for a retail
Acer and errs toward removing consumer apps.

**5 — Verify before you wipe anything.**
```powershell
powershell -ExecutionPolicy Bypass -File .\5-Verify.ps1 -ExportRoot E:\Migration -RestoredRoot "$env:USERPROFILE\Downloads\gravity draft new"
```
Exits non-zero if a single file is missing or its SHA256 differs.

## Manual steps no script can do

1. Sign in to Google Drive for Desktop, re-map it to `G:`.
2. `claude` (sign in), `gh auth login`.
3. Re-enter env vars shown as `<<REDACTED>>` in `inventory.json`.
4. Tighten SSH key permissions:
   `icacls "$env:USERPROFILE\.ssh" /inheritance:r /grant:r "$env:USERNAME:(F)"`
5. **Fix the Drive backup of Downloads.** That broken backup is the only reason
   the manuscript was ever single-copy. Fixing it is the actual remedy; this
   migration is just the workaround.

## Rotate rather than carry

SSH keys, GPG keys, `.npmrc` registry tokens and any API keys inside
`.claude.json` are all easier to regenerate on the new machine than to move
safely. Generating fresh keys and revoking the old ones also means a stolen or
resold old laptop stops being a credential leak. The scripts will carry them if
you want, but rotating is the better call.
