# HANDOFF — laptop migration state

**Last updated:** 2026-09-06 · **Session:** https://claude.ai/code/session_01EL6VoeDpGHE7TnvGyACy3G

Read this first in any new session about moving Kaleb's laptop. It is the
current state of the job, not a summary of a finished one.

## The job

Move everything worth keeping off the Acer Aspire AG15-31P (Windows, user
`Kalev`) onto a new Windows laptop. Carry the useful content and setups, leave
the junk behind, and set the new machine up clean rather than cloning the old
one's accumulated cruft.

**Transfer media:** external drive (primary) **plus** Google Drive/OneDrive —
these are not interchangeable, see Sensitivity below.

## Status

| Step | State |
|---|---|
| Migration kit written | done — `tools/laptop-migration/` in `KG-97/neuromind-anhb2217`, branch `claude/new-laptop-session-qrnlt9` |
| Scripts executed | **none yet** — nothing has been run on any machine |
| Scripts tested | **no** — authored in a Linux container with no PowerShell, so not even parse-checked |
| New laptop | Windows, not yet specified further |
| Old laptop reachable from cloud sessions | **no** — Remote Control bridge shows `computer_unreachable` |

## Facts that must not be lost

1. **`C:\Users\Kalev\Downloads\gravity draft new\` is single-copy.** Master
   *Gravity Rooms* manuscript, LineEdit sources, pipeline scripts, canonical
   status, Author To-Do. **The Drive backup of Downloads has been broken since
   2026-07-18**, so this exists only on the old laptop. It is the highest-risk
   item in the whole migration. `2-Export.ps1` stages it first and SHA256-hashes
   every file; `5-Verify.ps1` checks those hashes on the new machine.
   **Do not wipe the old laptop until 5-Verify returns clean.**

2. **Tier 1 content must never be cloud-synced.** The raw ChatGPT export and
   `deep_dive_2026-07-17\drive_extracted_high_signal\` (Form 15 ×2, Form 16,
   affidavits, `court_email_bodies.json`) contain third-party legal names, DOB, a
   discharge summary, addresses, case numbers, and **one named person who is a
   minor**. External encrypted drive only. `2-Export.ps1` refuses a cloud-looking
   destination unless `-IAcceptCloudRisk` is passed.

3. **Other local-only paths worth carrying:** `C:\Users\Kalev\AI-Shared\`
   (outputs, changelogs, health checks, review syntheses, deep-dive reports,
   handoffs). `G:` is the Google Drive for Desktop mount and must be re-mapped to
   `G:` on the new machine or paths break.

4. **Credentials: rotate, don't carry.** SSH/GPG keys, `.npmrc` registry tokens,
   API keys in `.claude.json`. Regenerating on the new machine and revoking the
   old set means a resold or stolen old laptop stops being a credential leak.
   Recommended, not yet decided by Kaleb.

## Next actions, in order

1. **On the old laptop:** `1-Inventory.ps1` → send `inventory.json` back to
   Claude. The export manifest is currently built from the corpus map, so it
   knows about `gravity draft new`, `AI-Shared` and the court extract but nothing
   else that has accumulated. The inventory is what turns it from generic to
   accurate.
2. Tune `$Manifest` in `2-Export.ps1` from that inventory, then `-DryRun`, then
   run it for real to the external drive.
3. `3-Cleanup.ps1` in audit mode; review `CLEANUP.md`; only then `-Execute`.
4. **On the new laptop:** `4-SetupNewLaptop.ps1 -DryRun` first. Review the
   `$removeAppx` debloat list before running it for real.
5. `5-Verify.ps1`. Clean result is the gate for wiping the old machine.
6. **Fix the broken Drive backup of Downloads.** This migration is a workaround;
   that backup is the actual remedy.

## Open questions for Kaleb

- Rotate credentials or carry them across?
- Which non-obvious folders beyond the corpus-map paths should be carried?
  (Answerable once `inventory.json` exists.)
- Is the old laptop being kept, resold, or wiped? Changes how aggressive the
  cleanup and credential handling should be.

## Related prior sessions

Several earlier sessions did laptop disk work and left findings — a 274 MB
staging dir pending cleanup (`session_01DiXJ…`), a disk-space drop traced to a
Claude Desktop VM (`session_01EaJH…`), and assorted purges. Worth skimming
before re-diagnosing anything disk-related.
