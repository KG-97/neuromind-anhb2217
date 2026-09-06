<#
.SYNOPSIS
    Stages everything worth carrying to the new laptop, sorted by sensitivity tier.

.DESCRIPTION
    Copies (never moves, never deletes) into <Destination>\ under three tiers:

      TIER1_CONFIDENTIAL  Irreplaceable and/or contains third-party PII.
                          EXTERNAL ENCRYPTED DRIVE ONLY. Never cloud-sync.
      TIER2_SETUP         Configs, keys, package lists. Small. Contains secrets,
                          so it travels with Tier 1 on the drive.
      TIER3_PORTABLE      Content that is already published or non-sensitive.
                          Safe for Drive/OneDrive.

    Refuses to write Tier 1 or 2 to a cloud-synced destination unless you
    explicitly override, because the raw ChatGPT/Gmail exports and court PDFs
    carry third-party legal names, DOB, a discharge summary, addresses, case
    numbers, and one minor.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\2-Export.ps1 -Destination E:\Migration -DryRun
    powershell -ExecutionPolicy Bypass -File .\2-Export.ps1 -Destination E:\Migration
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Destination,
    [switch]$DryRun,
    # Only set this if you genuinely intend confidential data to reach a cloud folder.
    [switch]$IAcceptCloudRisk
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'
$U = $env:USERPROFILE

# ---------------------------------------------------------------------------
# THE MANIFEST - edit this. Anything not listed here does not get carried over.
# 'exclude' entries are robocopy /XD directory names.
# ---------------------------------------------------------------------------
$Manifest = @(
    # --- TIER 1: irreplaceable, confidential, external drive only -----------
    @{ tier='TIER1_CONFIDENTIAL'; name='Gravity Rooms master manuscript'
       src="$U\Downloads\gravity draft new"
       note='HIGHEST PRIORITY. Master manuscript + LineEdit sources + pipeline scripts + canonical status. Drive backup of Downloads has been broken since 2026-07-18, so this exists in one place only.' }

    @{ tier='TIER1_CONFIDENTIAL'; name='AI-Shared workspace'
       src="$U\AI-Shared"
       note='Outputs, changelogs, health checks, review syntheses, deep-dive reports, handoffs.' }

    @{ tier='TIER1_CONFIDENTIAL'; name='Court / high-signal extract'
       src="$U\deep_dive_2026-07-17"
       note='Form 15 x2, Form 16, affidavits, court_email_bodies.json. Confidential - primary source evidence.' }

    @{ tier='TIER1_CONFIDENTIAL'; name='ChatGPT raw export (if local)'
       src="$U\Downloads\ChatGPT memory"
       note='Raw export: third-party legal names, DOB, discharge summary, addresses, case numbers, one minor. Never cloud-sync unredacted.' }

    # --- TIER 2: setup, configs, credentials --------------------------------
    @{ tier='TIER2_SETUP'; name='Claude Code user config'
       src="$U\.claude"; exclude=@('projects','shell-snapshots','statsig','todos','history','downloads')
       note='Skills, agents, settings, keybindings, plugins. Session transcripts excluded - they are bulky and re-generatable.' }

    @{ tier='TIER2_SETUP'; name='Claude Code settings file'; src="$U\.claude.json"
       note='Contains MCP server definitions and possibly API tokens. Treat as a secret.' }

    @{ tier='TIER2_SETUP'; name='Claude Desktop config'; src="$env:APPDATA\Claude\claude_desktop_config.json"
       note='MCP server wiring for the desktop app.' }

    @{ tier='TIER2_SETUP'; name='SSH keys'; src="$U\.ssh"
       note='SECRET. Consider generating fresh keys on the new laptop instead and revoking these.' }

    @{ tier='TIER2_SETUP'; name='GnuPG'; src="$env:APPDATA\gnupg"; note='SECRET.' }
    @{ tier='TIER2_SETUP'; name='Git config'; src="$U\.gitconfig" }
    @{ tier='TIER2_SETUP'; name='npm config'; src="$U\.npmrc"; note='May contain registry auth tokens.' }
    @{ tier='TIER2_SETUP'; name='AWS credentials'; src="$U\.aws"; note='SECRET.' }
    @{ tier='TIER2_SETUP'; name='PowerShell profile'; src=(Split-Path -Parent $PROFILE.CurrentUserAllHosts) }
    @{ tier='TIER2_SETUP'; name='Windows Terminal settings'
       src="$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json" }
    @{ tier='TIER2_SETUP'; name='VS Code user settings'; src="$env:APPDATA\Code\User"
       exclude=@('workspaceStorage','globalStorage','History','logs','CachedData')
       note='settings.json, keybindings.json, snippets. Caches excluded.' }

    # --- TIER 3: portable, cloud-safe ---------------------------------------
    @{ tier='TIER3_PORTABLE'; name='Documents'; src="$U\Documents"
       exclude=@('node_modules','.git','__pycache__','.venv','venv','bin','obj') }
    @{ tier='TIER3_PORTABLE'; name='Pictures'; src="$U\Pictures" }
    @{ tier='TIER3_PORTABLE'; name='Desktop'; src="$U\Desktop" }
    @{ tier='TIER3_PORTABLE'; name='Videos'; src="$U\Videos" }
    @{ tier='TIER3_PORTABLE'; name='Music'; src="$U\Music" }
)

# Files whose integrity matters enough to hash on both sides.
$HashTargets = @(
    "$U\Downloads\gravity draft new"
)

# ---------------------------------------------------------------------------
$mode = if ($DryRun) { 'DRY RUN' } else { 'LIVE' }
Write-Host "=== Export ($mode) -> $Destination ===" -ForegroundColor Cyan

# Cloud-destination guard.
$cloudMarkers = @('OneDrive','Google Drive','GoogleDrive','Dropbox','\\G:')
$looksCloud = $false
foreach ($m in $cloudMarkers) { if ($Destination -like "*$m*") { $looksCloud = $true } }
try {
    $destRoot = [System.IO.Path]::GetPathRoot($Destination)
    if ($destRoot -and (Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='$($destRoot.TrimEnd('\'))'" -ErrorAction SilentlyContinue).DriveType -eq 4) { $looksCloud = $true }
} catch {}

if ($looksCloud -and -not $IAcceptCloudRisk) {
    Write-Host ''
    Write-Host 'REFUSING: destination looks cloud-synced.' -ForegroundColor Red
    Write-Host 'Tier 1 and Tier 2 contain third-party PII and secrets and must not be' -ForegroundColor Red
    Write-Host 'uploaded unredacted. Use an external drive, or re-run with -IAcceptCloudRisk' -ForegroundColor Red
    Write-Host 'if you have deliberately decided otherwise.' -ForegroundColor Red
    exit 1
}

if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $Destination | Out-Null }
$logDir = Join-Path $Destination '_logs'
if (-not $DryRun) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }

$results = @()
$totalBytes = 0

foreach ($entry in $Manifest) {
    $src = $entry.src
    $dst = Join-Path (Join-Path $Destination $entry.tier) (Split-Path -Leaf $src)

    if (-not (Test-Path -LiteralPath $src)) {
        Write-Host ("  SKIP  [{0}] {1} - not found: {2}" -f $entry.tier, $entry.name, $src) -ForegroundColor DarkGray
        $results += [ordered]@{ tier=$entry.tier; name=$entry.name; src=$src; status='not-found'; sizeGB=0 }
        continue
    }

    $item = Get-Item -LiteralPath $src -Force
    if ($item.PSIsContainer) {
        $bytes = (Get-ChildItem -LiteralPath $src -Recurse -File -Force -ErrorAction SilentlyContinue |
                  Measure-Object Length -Sum).Sum
    } else { $bytes = $item.Length }
    if (-not $bytes) { $bytes = 0 }
    $gb = [math]::Round($bytes / 1GB, 2)
    $totalBytes += $bytes

    Write-Host ("  COPY  [{0}] {1} ({2} GB)" -f $entry.tier, $entry.name, $gb) -ForegroundColor Green
    Write-Host ("          {0}  ->  {1}" -f $src, $dst) -ForegroundColor DarkGray

    if (-not $DryRun) {
        if ($item.PSIsContainer) {
            $rcLog = Join-Path $logDir ((($entry.name -replace '[^\w\-]','_')) + '.log')
            $rcArgs = @($src, $dst, '/E', '/COPY:DAT', '/DCOPY:DAT', '/R:2', '/W:2',
                        '/MT:8', '/NP', '/NFL', '/NDL', "/LOG:$rcLog")
            if ($entry.exclude) { $rcArgs += '/XD'; $rcArgs += $entry.exclude }
            & robocopy.exe @rcArgs | Out-Null
            # robocopy: 0-7 success, 8+ real failure
            $status = if ($LASTEXITCODE -lt 8) { 'ok' } else { "robocopy-exit-$LASTEXITCODE" }
        } else {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dst) | Out-Null
            Copy-Item -LiteralPath $src -Destination $dst -Force
            $status = if ($?) { 'ok' } else { 'copy-failed' }
        }
    } else { $status = 'dry-run' }

    $results += [ordered]@{
        tier=$entry.tier; name=$entry.name; src=$src; dst=$dst
        status=$status; sizeGB=$gb; note=$entry.note
    }
}

# ------------------------------------------------------------- hashing -----
Write-Host ''
Write-Host 'Hashing integrity targets...' -ForegroundColor Cyan
$hashes = @()
foreach ($target in $HashTargets) {
    if (-not (Test-Path -LiteralPath $target)) { continue }
    Get-ChildItem -LiteralPath $target -Recurse -File -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Extension -in '.md','.docx','.pdf','.txt','.json' } | ForEach-Object {
            $hashes += [ordered]@{
                path = $_.FullName.Substring($target.Length).TrimStart('\')
                sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
                sizeKB = [math]::Round($_.Length/1KB,1)
                modified = $_.LastWriteTime.ToString('yyyy-MM-dd HH:mm')
            }
        }
}
Write-Host ("  {0} files hashed" -f $hashes.Count)

# ------------------------------------------------------------ manifest -----
if (-not $DryRun) {
    $hashes | ConvertTo-Json -Depth 5 | Out-File (Join-Path $Destination 'SOURCE-HASHES.json') -Encoding utf8

    $md = New-Object System.Text.StringBuilder
    [void]$md.AppendLine('# Migration manifest')
    [void]$md.AppendLine()
    [void]$md.AppendLine("Exported $(Get-Date -Format 'yyyy-MM-dd HH:mm') from ``$env:COMPUTERNAME`` to ``$Destination``")
    [void]$md.AppendLine()
    [void]$md.AppendLine("Total staged: **$([math]::Round($totalBytes/1GB,2)) GB**")
    [void]$md.AppendLine()
    [void]$md.AppendLine('## Handling rules')
    [void]$md.AppendLine()
    [void]$md.AppendLine('- **TIER1_CONFIDENTIAL** - external encrypted drive only. Do not upload, do not share, do not put in a cloud-synced folder. Contains third-party legal names, DOB, a discharge summary, addresses, case numbers, and one minor.')
    [void]$md.AppendLine('- **TIER2_SETUP** - contains live secrets (SSH/GPG keys, API tokens in `.claude.json` and `.npmrc`). Travels with Tier 1. Rotate anything you can rather than carrying it.')
    [void]$md.AppendLine('- **TIER3_PORTABLE** - safe for Drive/OneDrive.')
    [void]$md.AppendLine()
    [void]$md.AppendLine('## Contents')
    [void]$md.AppendLine()
    [void]$md.AppendLine('| Tier | Item | Size GB | Status | Source |')
    [void]$md.AppendLine('|---|---|---:|---|---|')
    foreach ($r in $results) {
        [void]$md.AppendLine("| $($r.tier) | $($r.name) | $($r.sizeGB) | $($r.status) | ``$($r.src)`` |")
    }
    [void]$md.AppendLine()
    [void]$md.AppendLine('## Notes')
    [void]$md.AppendLine()
    foreach ($r in $results | Where-Object { $_.note }) {
        [void]$md.AppendLine("- **$($r.name)** - $($r.note)")
    }
    $md.ToString() | Out-File (Join-Path $Destination 'MANIFEST.md') -Encoding utf8
    $results | ConvertTo-Json -Depth 5 | Out-File (Join-Path $Destination 'manifest.json') -Encoding utf8
}

Write-Host ''
Write-Host ("Total: {0} GB across {1} items" -f [math]::Round($totalBytes/1GB,2), @($results | Where-Object {$_.status -ne 'not-found'}).Count) -ForegroundColor Green
if ($DryRun) {
    Write-Host 'DRY RUN - nothing was copied. Re-run without -DryRun to execute.' -ForegroundColor Yellow
} else {
    Write-Host "Manifest: $Destination\MANIFEST.md" -ForegroundColor Green
    Write-Host "Hashes:   $Destination\SOURCE-HASHES.json (verify on the new laptop with 5-Verify.ps1)" -ForegroundColor Green
}
