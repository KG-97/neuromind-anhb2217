<#
.SYNOPSIS
    Finds what should NOT come with you, and (only when told to) deletes it.

.DESCRIPTION
    Default behaviour is AUDIT ONLY - it measures and reports, deletes nothing.
    Add -Execute to actually delete, and -Categories to narrow what gets touched.

    Run this AFTER 2-Export.ps1 has completed and you have verified the manifest.

    Categories:
      BuildArtifacts   node_modules, __pycache__, .venv, bin/obj, target, dist
      PackageCaches    npm/pip/nuget/winget/yarn caches
      WindowsTemp      %TEMP%, C:\Windows\Temp, prefetch
      WindowsUpdate    SoftwareDistribution\Download, Delivery Optimization
      WindowsOld       C:\Windows.old
      CrashDumps       minidumps, WER, LiveKernelReports
      Installers       .exe/.msi/.iso in Downloads older than -InstallerAgeDays
      BrowserCaches    Chrome/Edge/Firefox cache dirs (does NOT touch profiles)
      ClaudeSessions   Claude Code shell-snapshots + old session transcripts
      RecycleBin       empties the recycle bin

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\3-Cleanup.ps1
    powershell -ExecutionPolicy Bypass -File .\3-Cleanup.ps1 -Execute -Categories BuildArtifacts,PackageCaches,WindowsTemp
    powershell -ExecutionPolicy Bypass -File .\3-Cleanup.ps1 -Execute   # everything
#>
[CmdletBinding()]
param(
    [switch]$Execute,
    [ValidateSet('BuildArtifacts','PackageCaches','WindowsTemp','WindowsUpdate','WindowsOld',
                 'CrashDumps','Installers','BrowserCaches','ClaudeSessions','RecycleBin')]
    [string[]]$Categories,
    [string[]]$ScanRoots = @("$env:USERPROFILE"),
    [int]$InstallerAgeDays = 60,
    [string]$ReportPath = "$env:USERPROFILE\MigrationReport\CLEANUP.md"
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'
$U = $env:USERPROFILE

if (-not $Categories) {
    $Categories = 'BuildArtifacts','PackageCaches','WindowsTemp','WindowsUpdate','WindowsOld',
                  'CrashDumps','Installers','BrowserCaches','ClaudeSessions','RecycleBin'
}

$mode = if ($Execute) { 'EXECUTE (will delete)' } else { 'AUDIT ONLY (nothing deleted)' }
Write-Host "=== Cleanup - $mode ===" -ForegroundColor Cyan
Write-Host ("Categories: {0}" -f ($Categories -join ', ')) -ForegroundColor DarkGray
Write-Host ''

if ($Execute) {
    Write-Host 'You are about to delete files. Confirm you have already run 2-Export.ps1' -ForegroundColor Yellow
    Write-Host 'and verified MANIFEST.md on the external drive.' -ForegroundColor Yellow
    $ok = Read-Host "Type YES to continue"
    if ($ok -ne 'YES') { Write-Host 'Aborted.' -ForegroundColor Red; exit 1 }
}

function Measure-Target {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) { return 0 }
    try {
        $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
        if ($item.PSIsContainer) {
            $s = (Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue |
                  Measure-Object Length -Sum).Sum
            if ($s) { return $s } else { return 0 }
        }
        return $item.Length
    } catch { return 0 }
}

$findings = @()
function Add-Finding {
    param([string]$Category, [string]$Path, [string]$Why, [switch]$SafeToDelete)
    $bytes = Measure-Target $Path
    if ($bytes -le 0) { return }
    $script:findings += [ordered]@{
        category = $Category
        path     = $Path
        sizeGB   = [math]::Round($bytes / 1GB, 3)
        bytes    = $bytes
        why      = $Why
        safe     = [bool]$SafeToDelete
        deleted  = $false
    }
}

# ------------------------------------------------------- BuildArtifacts -----
if ($Categories -contains 'BuildArtifacts') {
    Write-Host 'Scanning build artifacts...' -ForegroundColor Cyan
    $artifactNames = 'node_modules','__pycache__','.pytest_cache','.mypy_cache','.next','.nuxt','.turbo'
    foreach ($root in $ScanRoots) {
        if (-not (Test-Path -LiteralPath $root)) { continue }
        Get-ChildItem -LiteralPath $root -Directory -Recurse -Force -ErrorAction SilentlyContinue -Depth 8 |
            Where-Object { $artifactNames -contains $_.Name } |
            ForEach-Object {
                # skip nested node_modules - the parent already counts them
                if ($_.FullName -notmatch '(?i)node_modules.+node_modules') {
                    Add-Finding -Category 'BuildArtifacts' -Path $_.FullName `
                        -Why 'Regenerable from lockfile/source' -SafeToDelete
                }
            }
    }
}

# -------------------------------------------------------- PackageCaches -----
if ($Categories -contains 'PackageCaches') {
    Write-Host 'Scanning package manager caches...' -ForegroundColor Cyan
    $caches = @{
        "$env:LOCALAPPDATA\npm-cache"                      = 'npm cache'
        "$U\AppData\Roaming\npm-cache"                     = 'npm cache (roaming)'
        "$env:LOCALAPPDATA\pip\Cache"                      = 'pip cache'
        "$env:LOCALAPPDATA\Yarn\Cache"                     = 'yarn cache'
        "$env:LOCALAPPDATA\pnpm-store"                     = 'pnpm store'
        "$U\.nuget\packages"                               = 'NuGet package cache'
        "$U\.cargo\registry\cache"                         = 'cargo registry cache'
        "$env:LOCALAPPDATA\Microsoft\VisualStudio\Packages"= 'VS installer cache'
        "$env:LOCALAPPDATA\Temp\chocolatey"                = 'chocolatey temp'
        "$env:LOCALAPPDATA\Packages\Microsoft.DesktopAppInstaller_8wekyb3d8bbwe\LocalState\rebootRequiredPackages" = 'winget staging'
    }
    foreach ($p in $caches.Keys) { Add-Finding -Category 'PackageCaches' -Path $p -Why $caches[$p] -SafeToDelete }
}

# ---------------------------------------------------------- WindowsTemp -----
if ($Categories -contains 'WindowsTemp') {
    Write-Host 'Scanning temp directories...' -ForegroundColor Cyan
    Add-Finding -Category 'WindowsTemp' -Path $env:TEMP        -Why 'User temp' -SafeToDelete
    Add-Finding -Category 'WindowsTemp' -Path 'C:\Windows\Temp' -Why 'System temp (needs admin)' -SafeToDelete
    Add-Finding -Category 'WindowsTemp' -Path "$env:LOCALAPPDATA\Microsoft\Windows\INetCache" -Why 'IE/Edge legacy cache' -SafeToDelete
    Add-Finding -Category 'WindowsTemp' -Path "$env:LOCALAPPDATA\Microsoft\Windows\Explorer" -Why 'Thumbnail/icon cache (rebuilds itself)' -SafeToDelete
}

# -------------------------------------------------------- WindowsUpdate -----
if ($Categories -contains 'WindowsUpdate') {
    Write-Host 'Scanning Windows Update leftovers...' -ForegroundColor Cyan
    Add-Finding -Category 'WindowsUpdate' -Path 'C:\Windows\SoftwareDistribution\Download' -Why 'Downloaded update payloads (needs admin)' -SafeToDelete
    Add-Finding -Category 'WindowsUpdate' -Path 'C:\Windows\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization' -Why 'Delivery Optimization cache (needs admin)' -SafeToDelete
}

if ($Categories -contains 'WindowsOld') {
    Write-Host 'Checking for Windows.old...' -ForegroundColor Cyan
    Add-Finding -Category 'WindowsOld' -Path 'C:\Windows.old' -Why 'Previous Windows install - reclaim before migrating (needs admin)'
    Add-Finding -Category 'WindowsOld' -Path 'C:\$Windows.~BT' -Why 'Upgrade staging (needs admin)'
    Add-Finding -Category 'WindowsOld' -Path 'C:\$Windows.~WS' -Why 'Upgrade staging (needs admin)'
}

# ------------------------------------------------------------ CrashDumps ---
if ($Categories -contains 'CrashDumps') {
    Write-Host 'Scanning crash dumps and error reports...' -ForegroundColor Cyan
    Add-Finding -Category 'CrashDumps' -Path "$env:LOCALAPPDATA\CrashDumps" -Why 'Application crash dumps' -SafeToDelete
    Add-Finding -Category 'CrashDumps' -Path "$env:LOCALAPPDATA\Microsoft\Windows\WER" -Why 'Windows Error Reporting queue' -SafeToDelete
    Add-Finding -Category 'CrashDumps' -Path 'C:\ProgramData\Microsoft\Windows\WER' -Why 'System WER (needs admin)' -SafeToDelete
    Add-Finding -Category 'CrashDumps' -Path 'C:\Windows\LiveKernelReports' -Why 'Kernel dumps (needs admin)' -SafeToDelete
    Add-Finding -Category 'CrashDumps' -Path 'C:\Windows\MEMORY.DMP' -Why 'Full memory dump (needs admin)' -SafeToDelete
}

# ------------------------------------------------------------ Installers ---
if ($Categories -contains 'Installers') {
    Write-Host "Scanning Downloads for installers older than $InstallerAgeDays days..." -ForegroundColor Cyan
    $cutoff = (Get-Date).AddDays(-$InstallerAgeDays)
    $dl = "$U\Downloads"
    if (Test-Path -LiteralPath $dl) {
        Get-ChildItem -LiteralPath $dl -File -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Extension -in '.exe','.msi','.msix','.iso','.img' -and $_.LastWriteTime -lt $cutoff } |
            ForEach-Object {
                Add-Finding -Category 'Installers' -Path $_.FullName `
                    -Why ("Installer, last modified {0} - redownload if ever needed" -f $_.LastWriteTime.ToString('yyyy-MM-dd')) -SafeToDelete
            }
    }
}

# --------------------------------------------------------- BrowserCaches ---
if ($Categories -contains 'BrowserCaches') {
    Write-Host 'Scanning browser caches (profiles untouched)...' -ForegroundColor Cyan
    $browserCaches = @(
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache"
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache"
        "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Service Worker\CacheStorage"
        "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache"
        "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache"
        "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\User Data\Default\Cache"
    )
    foreach ($p in $browserCaches) { Add-Finding -Category 'BrowserCaches' -Path $p -Why 'Browser cache - rebuilds itself' -SafeToDelete }
    Get-ChildItem "$env:APPDATA\Mozilla\Firefox\Profiles" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        Add-Finding -Category 'BrowserCaches' -Path (Join-Path $_.FullName 'cache2') -Why 'Firefox cache' -SafeToDelete
    }
}

# -------------------------------------------------------- ClaudeSessions ---
if ($Categories -contains 'ClaudeSessions') {
    Write-Host 'Scanning Claude Code working data...' -ForegroundColor Cyan
    Add-Finding -Category 'ClaudeSessions' -Path "$U\.claude\shell-snapshots" -Why 'Shell snapshots - regenerated per session' -SafeToDelete
    Add-Finding -Category 'ClaudeSessions' -Path "$U\.claude\statsig"         -Why 'Telemetry cache' -SafeToDelete
    Add-Finding -Category 'ClaudeSessions' -Path "$U\.claude\downloads"       -Why 'Downloaded CLI versions' -SafeToDelete
    # Session transcripts older than 60 days
    $cut = (Get-Date).AddDays(-60)
    Get-ChildItem "$U\.claude\projects" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.LastWriteTime -lt $cut) {
            Add-Finding -Category 'ClaudeSessions' -Path $_.FullName `
                -Why ("Session transcripts, idle since {0}" -f $_.LastWriteTime.ToString('yyyy-MM-dd'))
        }
    }
}

# ------------------------------------------------------------ RecycleBin ---
if ($Categories -contains 'RecycleBin') {
    Write-Host 'Measuring recycle bin...' -ForegroundColor Cyan
    Add-Finding -Category 'RecycleBin' -Path 'C:\$Recycle.Bin' -Why 'Deleted files not yet purged' -SafeToDelete
}

# ---------------------------------------------------------------- report ---
$findings = @($findings | Sort-Object { $_.bytes } -Descending)
$totalGB  = [math]::Round((($findings | Measure-Object bytes -Sum).Sum) / 1GB, 2)
$safeGB   = [math]::Round((($findings | Where-Object safe | Measure-Object bytes -Sum).Sum) / 1GB, 2)

Write-Host ''
Write-Host ("Found {0} reclaimable locations, {1} GB total ({2} GB flagged safe-to-delete)" -f $findings.Count, $totalGB, $safeGB) -ForegroundColor Yellow
Write-Host ''
$findings | Select-Object -First 25 | ForEach-Object {
    $tag = if ($_.safe) { 'safe  ' } else { 'REVIEW' }
    Write-Host ("  [{0}] {1,8} GB  {2}" -f $tag, $_.sizeGB, $_.path)
}

# ---------------------------------------------------------------- delete ---
if ($Execute) {
    Write-Host ''
    Write-Host 'Deleting safe-to-delete entries...' -ForegroundColor Cyan
    foreach ($f in $findings) {
        if (-not $f.safe) {
            Write-Host ("  SKIP (needs your review): {0}" -f $f.path) -ForegroundColor DarkYellow
            continue
        }
        try {
            if ($f.category -eq 'RecycleBin') {
                Clear-RecycleBin -Force -ErrorAction Stop
            } else {
                Remove-Item -LiteralPath $f.path -Recurse -Force -ErrorAction Stop
            }
            $f.deleted = $true
            Write-Host ("  removed {0,8} GB  {1}" -f $f.sizeGB, $f.path) -ForegroundColor Green
        } catch {
            Write-Host ("  FAILED  {0} - {1}" -f $f.path, $_.Exception.Message) -ForegroundColor Red
        }
    }
    $freed = [math]::Round((($findings | Where-Object deleted | Measure-Object bytes -Sum).Sum)/1GB, 2)
    Write-Host ''
    Write-Host "Reclaimed $freed GB" -ForegroundColor Green
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $ReportPath) | Out-Null
$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine('# Cleanup audit')
[void]$md.AppendLine()
[void]$md.AppendLine("Run $(Get-Date -Format 'yyyy-MM-dd HH:mm') on ``$env:COMPUTERNAME`` - mode: $mode")
[void]$md.AppendLine()
[void]$md.AppendLine("Reclaimable: **$totalGB GB** total, **$safeGB GB** flagged safe.")
[void]$md.AppendLine()
[void]$md.AppendLine('| Size GB | Category | Safe | Deleted | Path | Why |')
[void]$md.AppendLine('|---:|---|---|---|---|---|')
foreach ($f in $findings) {
    [void]$md.AppendLine("| $($f.sizeGB) | $($f.category) | $(if($f.safe){'yes'}else{'REVIEW'}) | $(if($f.deleted){'yes'}else{'no'}) | ``$($f.path)`` | $($f.why) |")
}
$md.ToString() | Out-File $ReportPath -Encoding utf8
$findings | ConvertTo-Json -Depth 5 | Out-File ($ReportPath -replace '\.md$','.json') -Encoding utf8

Write-Host ''
Write-Host "Report: $ReportPath" -ForegroundColor Green
if (-not $Execute) { Write-Host 'Audit only - nothing was deleted. Add -Execute to act.' -ForegroundColor Yellow }
