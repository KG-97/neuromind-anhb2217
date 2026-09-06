<#
.SYNOPSIS
    Fresh-optimises a new Windows laptop and restores your setup from the export drive.

.DESCRIPTION
    Phases (run individually or all):
      Debloat   Remove OEM/consumer preinstalls and disable suggestion/ad surfaces
      Settings  Explorer, privacy, power, long paths, dev mode
      Install   winget package restore + baseline dev tooling
      Restore   Copy Tier2 configs back into place from the export drive
      Defender  Exclusion paths for dev directories (speeds builds a lot)

    Run in an ELEVATED PowerShell. Start with -DryRun to see the plan.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\4-SetupNewLaptop.ps1 -Phase All -ExportRoot E:\Migration -DryRun
    powershell -ExecutionPolicy Bypass -File .\4-SetupNewLaptop.ps1 -Phase Settings,Install -ExportRoot E:\Migration
#>
[CmdletBinding()]
param(
    [ValidateSet('Debloat','Settings','Install','Restore','Defender','All')]
    [string[]]$Phase = @('All'),
    [string]$ExportRoot,
    [switch]$DryRun
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'
$U = $env:USERPROFILE
if ($Phase -contains 'All') { $Phase = 'Debloat','Settings','Install','Restore','Defender' }

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
           ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Write-Host "=== New laptop setup ===" -ForegroundColor Cyan
Write-Host ("Phases: {0}" -f ($Phase -join ', '))
Write-Host ("Elevated: {0}" -f $isAdmin)
if ($DryRun) { Write-Host 'DRY RUN - nothing will be changed.' -ForegroundColor Yellow }
Write-Host ''

function Do-Step {
    param([string]$What, [scriptblock]$Action)
    if ($DryRun) { Write-Host "  would: $What" -ForegroundColor DarkGray; return }
    try { & $Action; Write-Host "  ok:    $What" -ForegroundColor Green }
    catch { Write-Host "  FAIL:  $What - $($_.Exception.Message)" -ForegroundColor Red }
}

function Set-Reg {
    param([string]$Path, [string]$Name, $Value, [string]$Type = 'DWord')
    if (-not (Test-Path $Path)) { New-Item -Path $Path -Force | Out-Null }
    Set-ItemProperty -Path $Path -Name $Name -Value $Value -Type $Type -Force
}

# ============================================================== DEBLOAT ======
if ($Phase -contains 'Debloat') {
    Write-Host '--- Debloat ---' -ForegroundColor Cyan

    # Consumer/OEM appx that ships on retail Acer machines. Edit freely.
    $removeAppx = @(
        'Microsoft.3DBuilder','Microsoft.BingNews','Microsoft.BingWeather','Microsoft.GetHelp'
        'Microsoft.Getstarted','Microsoft.Messaging','Microsoft.MicrosoftOfficeHub'
        'Microsoft.MicrosoftSolitaireCollection','Microsoft.MixedReality.Portal'
        'Microsoft.NetworkSpeedTest','Microsoft.Office.OneNote','Microsoft.People'
        'Microsoft.Print3D','Microsoft.SkypeApp','Microsoft.Wallet','Microsoft.WindowsFeedbackHub'
        'Microsoft.WindowsMaps','Microsoft.Xbox.TCUI','Microsoft.XboxApp','Microsoft.XboxGameOverlay'
        'Microsoft.XboxGamingOverlay','Microsoft.XboxSpeechToTextOverlay','Microsoft.YourPhone'
        'Microsoft.ZuneMusic','Microsoft.ZuneVideo','Clipchamp.Clipchamp'
        'AcerIncorporated.AcerCollection','AcerIncorporated.AcerRegistration'
        'AcerIncorporated.QuickAccess','AcerIncorporated.UserExperienceImprovementProgram'
        'AcerIncorporated.AcerCareCenterS'
    )
    foreach ($app in $removeAppx) {
        $pkg = Get-AppxPackage -Name $app -ErrorAction SilentlyContinue
        if ($pkg) {
            Do-Step "remove appx $app" { Get-AppxPackage -Name $app | Remove-AppxPackage -ErrorAction Stop }
        }
    }

    Write-Host '  Disabling suggestion/advertising surfaces...'
    $cdm = 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\ContentDeliveryManager'
    Do-Step 'disable Start suggestions'        { Set-Reg $cdm 'SystemPaneSuggestionsEnabled' 0 }
    Do-Step 'disable app auto-install'         { Set-Reg $cdm 'SilentInstalledAppsEnabled' 0 }
    Do-Step 'disable lockscreen spotlight ads' { Set-Reg $cdm 'RotatingLockScreenOverlayEnabled' 0 }
    Do-Step 'disable tips and tricks'          { Set-Reg $cdm 'SubscribedContent-338389Enabled' 0 }
    Do-Step 'disable settings suggestions'     { Set-Reg $cdm 'SubscribedContent-338393Enabled' 0 }
    Do-Step 'disable Explorer sync-provider ads' {
        Set-Reg 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced' 'ShowSyncProviderNotifications' 0
    }
    Do-Step 'disable advertising ID' {
        Set-Reg 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo' 'Enabled' 0
    }
}

# ============================================================= SETTINGS ======
if ($Phase -contains 'Settings') {
    Write-Host '--- Settings ---' -ForegroundColor Cyan
    $adv = 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced'

    Do-Step 'show file extensions'    { Set-Reg $adv 'HideFileExt' 0 }
    Do-Step 'show hidden files'       { Set-Reg $adv 'Hidden' 1 }
    Do-Step 'full path in title bar'  { Set-Reg 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\CabinetState' 'FullPath' 1 }
    Do-Step 'open Explorer to This PC'{ Set-Reg $adv 'LaunchTo' 1 }
    Do-Step 'expand to current folder'{ Set-Reg $adv 'NavPaneExpandToCurrentFolder' 1 }

    if ($isAdmin) {
        Do-Step 'enable long paths (>260 chars)' {
            Set-Reg 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' 'LongPathsEnabled' 1
        }
        Do-Step 'enable Developer Mode' {
            Set-Reg 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock' 'AllowDevelopmentWithoutDevLicense' 1
        }
        Do-Step 'telemetry -> Security/Basic' {
            Set-Reg 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection' 'AllowTelemetry' 1
        }
        Do-Step 'disable hibernation file (reclaims RAM-sized GB)' { powercfg /hibernate off }
        Do-Step 'never sleep on AC power' {
            powercfg /change standby-timeout-ac 0
            powercfg /change monitor-timeout-ac 20
        }
        Do-Step 'disable Fast Startup (cleaner shutdowns)' {
            Set-Reg 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power' 'HiberbootEnabled' 0
        }
        Do-Step 'set System Restore to 5% of disk' {
            Enable-ComputerRestore -Drive 'C:\'
            vssadmin resize shadowstorage /for=C: /on=C: /maxsize=5% | Out-Null
        }
    } else {
        Write-Host '  (skipping machine-wide settings - not elevated)' -ForegroundColor DarkYellow
    }

    Do-Step 'restart Explorer to apply' { Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue }
}

# ============================================================== INSTALL ======
if ($Phase -contains 'Install') {
    Write-Host '--- Install ---' -ForegroundColor Cyan
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Host '  winget not available. Install "App Installer" from the Microsoft Store first.' -ForegroundColor Red
    } else {
        # Baseline you will want regardless of what the old machine had.
        $baseline = @(
            'Git.Git', 'GitHub.cli', 'Microsoft.PowerShell', 'Microsoft.WindowsTerminal'
            'Microsoft.VisualStudioCode', 'OpenJS.NodeJS.LTS', 'Python.Python.3.12'
            '7zip.7zip', 'Anthropic.Claude', 'Google.GoogleDrive'
            'Microsoft.PowerToys', 'Notepad++.Notepad++', 'VideoLAN.VLC'
        )
        foreach ($pkg in $baseline) {
            Do-Step "winget install $pkg" {
                winget install --id $pkg --exact --silent --accept-package-agreements --accept-source-agreements 2>&1 | Out-Null
            }
        }

        if ($ExportRoot) {
            $wingetFile = Join-Path $ExportRoot 'winget-packages.json'
            if (Test-Path -LiteralPath $wingetFile) {
                Write-Host '  Restoring the rest from winget-packages.json...'
                Do-Step 'winget import' {
                    winget import -i $wingetFile --accept-package-agreements --accept-source-agreements --ignore-versions --ignore-unavailable 2>&1 | Out-Null
                }
            } else {
                Write-Host "  no winget-packages.json at $wingetFile - skipping import" -ForegroundColor DarkYellow
            }

            $extFile = Join-Path $ExportRoot 'vscode-extensions.txt'
            if ((Test-Path -LiteralPath $extFile) -and (Get-Command code -ErrorAction SilentlyContinue)) {
                foreach ($ext in (Get-Content $extFile | Where-Object { $_ -match '\S' })) {
                    Do-Step "vscode ext $ext" { code --install-extension $ext --force 2>&1 | Out-Null }
                }
            }
        }
    }
}

# ============================================================== RESTORE ======
if ($Phase -contains 'Restore') {
    Write-Host '--- Restore ---' -ForegroundColor Cyan
    if (-not $ExportRoot) {
        Write-Host '  -ExportRoot not supplied - skipping restore.' -ForegroundColor Red
    } else {
        $t2 = Join-Path $ExportRoot 'TIER2_SETUP'
        $t1 = Join-Path $ExportRoot 'TIER1_CONFIDENTIAL'

        $restoreMap = @(
            @{ from = Join-Path $t2 '.claude';      to = "$U\.claude" }
            @{ from = Join-Path $t2 '.claude.json'; to = "$U\.claude.json" }
            @{ from = Join-Path $t2 '.ssh';         to = "$U\.ssh" }
            @{ from = Join-Path $t2 'gnupg';        to = "$env:APPDATA\gnupg" }
            @{ from = Join-Path $t2 '.gitconfig';   to = "$U\.gitconfig" }
            @{ from = Join-Path $t2 '.npmrc';       to = "$U\.npmrc" }
            @{ from = Join-Path $t2 'User';         to = "$env:APPDATA\Code\User" }
            @{ from = Join-Path $t2 'claude_desktop_config.json'; to = "$env:APPDATA\Claude\claude_desktop_config.json" }
        )
        foreach ($m in $restoreMap) {
            if (-not (Test-Path -LiteralPath $m.from)) { continue }
            Do-Step ("restore {0}" -f (Split-Path -Leaf $m.to)) {
                $parent = Split-Path -Parent $m.to
                if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
                if ((Get-Item -LiteralPath $m.from -Force).PSIsContainer) {
                    robocopy $m.from $m.to /E /COPY:DAT /R:2 /W:2 /NP /NFL /NDL | Out-Null
                    if ($LASTEXITCODE -ge 8) { throw "robocopy exit $LASTEXITCODE" }
                } else {
                    Copy-Item -LiteralPath $m.from -Destination $m.to -Force -ErrorAction Stop
                }
            }
        }

        # Content: put it back where the corpus map expects it.
        $contentMap = @(
            @{ from = Join-Path $t1 'gravity draft new';   to = "$U\Downloads\gravity draft new" }
            @{ from = Join-Path $t1 'AI-Shared';           to = "$U\AI-Shared" }
            @{ from = Join-Path $t1 'deep_dive_2026-07-17';to = "$U\deep_dive_2026-07-17" }
        )
        foreach ($m in $contentMap) {
            if (-not (Test-Path -LiteralPath $m.from)) { continue }
            Do-Step ("restore content {0}" -f (Split-Path -Leaf $m.to)) {
                robocopy $m.from $m.to /E /COPY:DAT /R:2 /W:2 /NP /NFL /NDL | Out-Null
                if ($LASTEXITCODE -ge 8) { throw "robocopy exit $LASTEXITCODE" }
            }
        }

        Write-Host ''
        Write-Host '  SSH key permissions must be tightened manually:' -ForegroundColor Yellow
        Write-Host "    icacls `"$U\.ssh`" /inheritance:r /grant:r `"$env:USERNAME`:(F)`"" -ForegroundColor Yellow
    }
}

# ============================================================= DEFENDER ======
if ($Phase -contains 'Defender') {
    Write-Host '--- Defender exclusions ---' -ForegroundColor Cyan
    if (-not $isAdmin) {
        Write-Host '  Needs elevation - skipping.' -ForegroundColor DarkYellow
    } else {
        # Real-time scanning of dependency trees is the single biggest build-speed tax.
        $exclusions = @("$U\.cargo", "$U\.nuget", "$U\AppData\Local\npm-cache",
                        "$U\AppData\Roaming\npm", "$U\repos", "$U\source", "$U\.claude")
        foreach ($p in $exclusions) {
            if (Test-Path -LiteralPath $p) {
                Do-Step "exclude $p" { Add-MpPreference -ExclusionPath $p -ErrorAction Stop }
            }
        }
        foreach ($proc in 'node.exe','git.exe','python.exe','msbuild.exe') {
            Do-Step "exclude process $proc" { Add-MpPreference -ExclusionProcess $proc -ErrorAction Stop }
        }
    }
}

Write-Host ''
Write-Host '=== Done ===' -ForegroundColor Green
Write-Host 'Manual steps that cannot be scripted:' -ForegroundColor Yellow
Write-Host '  1. Sign in to Google Drive for Desktop and re-map it to G:'
Write-Host '  2. Sign in to Claude Code (run: claude) and to gh (run: gh auth login)'
Write-Host '  3. Re-enter any environment variables marked <<REDACTED>> in inventory.json'
Write-Host '  4. Verify the manuscript with 5-Verify.ps1 before you wipe the old laptop'
Write-Host '  5. Fix the broken Drive backup of Downloads - that gap is why the'
Write-Host '     manuscript existed in only one place.'
