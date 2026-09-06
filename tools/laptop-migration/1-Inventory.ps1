<#
.SYNOPSIS
    Surveys the old laptop and writes a full migration inventory. Read-only.

.DESCRIPTION
    Touches nothing. Produces:
      <OutDir>\inventory.json    machine-readable survey
      <OutDir>\INVENTORY.md      human-readable report
      <OutDir>\winget-packages.json
      <OutDir>\vscode-extensions.txt

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\1-Inventory.ps1
    powershell -ExecutionPolicy Bypass -File .\1-Inventory.ps1 -OutDir D:\MigrationReport
#>
[CmdletBinding()]
param(
    [string]$OutDir = "$env:USERPROFILE\MigrationReport",
    # Roots scanned for large folders / dev projects. Add drives if you have them.
    [string[]]$ScanRoots = @("$env:USERPROFILE"),
    [int]$TopFoldersCount = 40,
    [int]$LargeFileMinMB = 250
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$log = Join-Path $OutDir 'inventory.log'
function Say($msg) {
    $line = "[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $msg
    Write-Host $line
    Add-Content -LiteralPath $log -Value $line
}

$inv = [ordered]@{
    generated   = (Get-Date).ToString('o')
    hostname    = $env:COMPUTERNAME
    username    = $env:USERNAME
    userprofile = $env:USERPROFILE
}

Say "=== Inventory starting. Output -> $OutDir ==="

# ---------------------------------------------------------------- system ----
Say 'Collecting system info...'
try {
    $os  = Get-CimInstance Win32_OperatingSystem
    $cs  = Get-CimInstance Win32_ComputerSystem
    $bios= Get-CimInstance Win32_BIOS
    $inv.system = [ordered]@{
        os            = $os.Caption
        version       = $os.Version
        build         = $os.BuildNumber
        installDate   = $os.InstallDate
        lastBoot      = $os.LastBootUpTime
        manufacturer  = $cs.Manufacturer
        model         = $cs.Model
        serial        = $bios.SerialNumber
        ramGB         = [math]::Round($cs.TotalPhysicalMemory / 1GB, 1)
        cpu           = (Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name)
    }
} catch { Say "  ! system info failed: $_" }

# ----------------------------------------------------------------- disks ----
Say 'Collecting disk usage...'
$inv.disks = @(
    Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3 OR DriveType=2 OR DriveType=4' | ForEach-Object {
        [ordered]@{
            drive     = $_.DeviceID
            label     = $_.VolumeName
            fs        = $_.FileSystem
            totalGB   = if ($_.Size)      { [math]::Round($_.Size / 1GB, 1) }      else { 0 }
            freeGB    = if ($_.FreeSpace) { [math]::Round($_.FreeSpace / 1GB, 1) } else { 0 }
            driveType = switch ($_.DriveType) { 2 {'Removable'} 3 {'Fixed'} 4 {'Network'} default {'Other'} }
        }
    }
)

# ------------------------------------------------------- installed apps -----
Say 'Enumerating installed applications (registry)...'
$uninstallKeys = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
$inv.installedApps = @(
    Get-ItemProperty $uninstallKeys -ErrorAction SilentlyContinue |
        Where-Object { $_.DisplayName -and -not $_.SystemComponent } |
        Select-Object @{n='name';e={$_.DisplayName}},
                      @{n='version';e={$_.DisplayVersion}},
                      @{n='publisher';e={$_.Publisher}},
                      @{n='installDate';e={$_.InstallDate}},
                      @{n='sizeMB';e={ if ($_.EstimatedSize) { [math]::Round($_.EstimatedSize/1KB,1) } else { $null } }} |
        Sort-Object name -Unique
)
Say ("  {0} applications found" -f $inv.installedApps.Count)

Say 'Exporting winget package list...'
if (Get-Command winget -ErrorAction SilentlyContinue) {
    try {
        winget export -o (Join-Path $OutDir 'winget-packages.json') --include-versions --accept-source-agreements 2>&1 |
            Out-File (Join-Path $OutDir 'winget-export.log') -Encoding utf8
        Say '  winget-packages.json written'
    } catch { Say "  ! winget export failed: $_" }
} else { Say '  ! winget not on PATH - skipping' }

# --------------------------------------------------------- dev tooling ------
Say 'Probing developer tooling...'
$tools = 'git','node','npm','pnpm','yarn','python','py','pip','dotnet','java','go','rustc','cargo','docker','wsl','gh','claude','code','ffmpeg','pandoc','7z'
$inv.devTools = @(
    foreach ($t in $tools) {
        $cmd = Get-Command $t -ErrorAction SilentlyContinue
        if ($cmd) {
            $ver = try { (& $t --version 2>&1 | Select-Object -First 1) -replace '\s+',' ' } catch { 'unknown' }
            [ordered]@{ tool = $t; path = $cmd.Source; version = "$ver".Trim() }
        }
    }
)
Say ("  {0} tools present" -f $inv.devTools.Count)

Say 'Collecting VS Code extensions...'
if (Get-Command code -ErrorAction SilentlyContinue) {
    try {
        code --list-extensions | Out-File (Join-Path $OutDir 'vscode-extensions.txt') -Encoding utf8
        Say '  vscode-extensions.txt written'
    } catch { Say "  ! vscode extension list failed: $_" }
}

Say 'Checking WSL distributions...'
$inv.wsl = @()
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    try { $inv.wsl = @(wsl --list --verbose 2>&1 | Where-Object { $_ -match '\S' }) } catch {}
}

# ------------------------------------------------------- config & keys ------
Say 'Locating configuration and credential stores...'
$configPaths = [ordered]@{
    'Claude Code (user)'      = "$env:USERPROFILE\.claude"
    'Claude Code settings'    = "$env:USERPROFILE\.claude.json"
    'Claude Desktop config'   = "$env:APPDATA\Claude\claude_desktop_config.json"
    'SSH keys'                = "$env:USERPROFILE\.ssh"
    'GnuPG'                   = "$env:APPDATA\gnupg"
    'Git config'              = "$env:USERPROFILE\.gitconfig"
    'AWS credentials'         = "$env:USERPROFILE\.aws"
    'Azure'                   = "$env:USERPROFILE\.azure"
    'npm config'              = "$env:USERPROFILE\.npmrc"
    'PowerShell profile'      = $PROFILE.CurrentUserAllHosts
    'Windows Terminal'        = "$env:LOCALAPPDATA\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
    'VS Code settings'        = "$env:APPDATA\Code\User\settings.json"
    'VS Code keybindings'     = "$env:APPDATA\Code\User\keybindings.json"
    'VS Code snippets'        = "$env:APPDATA\Code\User\snippets"
}
$inv.configs = @(
    foreach ($k in $configPaths.Keys) {
        $p = $configPaths[$k]
        if ($p -and (Test-Path -LiteralPath $p)) {
            $item = Get-Item -LiteralPath $p -Force
            [ordered]@{
                name     = $k
                path     = $p
                exists   = $true
                isDir    = $item.PSIsContainer
                modified = $item.LastWriteTime.ToString('yyyy-MM-dd')
            }
        } else {
            [ordered]@{ name = $k; path = $p; exists = $false }
        }
    }
)
Say ("  {0}/{1} config locations present" -f (@($inv.configs | Where-Object exists).Count), $inv.configs.Count)

# ------------------------------------------------- startup & scheduled ------
Say 'Collecting startup items and scheduled tasks...'
$inv.startupItems = @(
    Get-CimInstance Win32_StartupCommand -ErrorAction SilentlyContinue |
        Select-Object @{n='name';e={$_.Name}}, @{n='command';e={$_.Command}}, @{n='location';e={$_.Location}}
)
$inv.scheduledTasks = @(
    Get-ScheduledTask -ErrorAction SilentlyContinue |
        Where-Object { $_.TaskPath -notlike '\Microsoft\*' -and $_.State -ne 'Disabled' } |
        Select-Object @{n='name';e={$_.TaskName}}, @{n='path';e={$_.TaskPath}}, @{n='state';e={"$($_.State)"}}
)

# ------------------------------------------------ environment variables -----
Say 'Capturing user environment variables...'
$inv.userEnv = @(
    [Environment]::GetEnvironmentVariables('User').GetEnumerator() | ForEach-Object {
        # PATH is captured separately; skip anything that smells like a secret.
        $isSecret = $_.Key -match '(?i)(token|secret|key|password|passwd|credential)'
        [ordered]@{
            name  = $_.Key
            value = if ($isSecret) { '<<REDACTED - re-enter manually on new laptop>>' } else { "$($_.Value)" }
        }
    }
)
$inv.userPath = @([Environment]::GetEnvironmentVariable('Path','User') -split ';' | Where-Object { $_ })

# ------------------------------------------------------ git repositories ----
Say 'Finding git repositories (this can take a minute)...'
$inv.gitRepos = @()
foreach ($root in $ScanRoots) {
    if (-not (Test-Path -LiteralPath $root)) { continue }
    Get-ChildItem -LiteralPath $root -Directory -Filter '.git' -Recurse -Force -ErrorAction SilentlyContinue -Depth 6 |
        ForEach-Object {
            $repo = $_.Parent.FullName
            $dirty = $null; $remote = $null; $branch = $null; $unpushed = @()
            if (Get-Command git -ErrorAction SilentlyContinue) {
                $remote = (git -C $repo remote get-url origin 2>$null)
                $branch = (git -C $repo rev-parse --abbrev-ref HEAD 2>$null)
                $status = (git -C $repo status --porcelain 2>$null)
                $dirty  = [bool]$status
                $unpushed = (git -C $repo log --branches --not --remotes --oneline 2>$null)
            }
            $inv.gitRepos += [ordered]@{
                path          = $repo
                remote        = "$remote"
                branch        = "$branch"
                uncommitted   = $dirty
                unpushedCount = @($unpushed).Count
            }
        }
}
Say ("  {0} repos found ({1} with uncommitted changes)" -f $inv.gitRepos.Count, (@($inv.gitRepos | Where-Object uncommitted).Count))

# ------------------------------------------------------ disk hogs -----------
Say "Measuring folder sizes under $($ScanRoots -join ', ') ... (slowest step)"
function Get-FolderSize {
    param([string]$Path)
    try {
        $sum = (Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum).Sum
        if ($sum) { $sum } else { 0 }
    } catch { 0 }
}

$folderSizes = @()
foreach ($root in $ScanRoots) {
    if (-not (Test-Path -LiteralPath $root)) { continue }
    Get-ChildItem -LiteralPath $root -Directory -Force -ErrorAction SilentlyContinue | ForEach-Object {
        $bytes = Get-FolderSize $_.FullName
        $folderSizes += [ordered]@{
            path     = $_.FullName
            sizeGB   = [math]::Round($bytes / 1GB, 2)
            modified = $_.LastWriteTime.ToString('yyyy-MM-dd')
        }
    }
}
$inv.topFolders = @($folderSizes | Sort-Object { $_.sizeGB } -Descending | Select-Object -First $TopFoldersCount)

Say "Finding files larger than $LargeFileMinMB MB..."
$inv.largeFiles = @(
    foreach ($root in $ScanRoots) {
        if (-not (Test-Path -LiteralPath $root)) { continue }
        Get-ChildItem -LiteralPath $root -Recurse -File -Force -ErrorAction SilentlyContinue |
            Where-Object { $_.Length -gt ($LargeFileMinMB * 1MB) } |
            ForEach-Object {
                [ordered]@{
                    path     = $_.FullName
                    sizeGB   = [math]::Round($_.Length / 1GB, 2)
                    modified = $_.LastWriteTime.ToString('yyyy-MM-dd')
                }
            }
    }
) | Sort-Object { $_.sizeGB } -Descending | Select-Object -First 60

# ---------------------------------------------------------------- write -----
Say 'Writing inventory.json...'
$inv | ConvertTo-Json -Depth 8 | Out-File (Join-Path $OutDir 'inventory.json') -Encoding utf8

Say 'Writing INVENTORY.md...'
$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine("# Laptop inventory - $($inv.hostname)")
[void]$md.AppendLine()
[void]$md.AppendLine("Generated $($inv.generated) for user ``$($inv.username)``")
[void]$md.AppendLine()
[void]$md.AppendLine('## System')
[void]$md.AppendLine()
foreach ($k in $inv.system.Keys) { [void]$md.AppendLine("- **$k**: $($inv.system[$k])") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Disks')
[void]$md.AppendLine()
[void]$md.AppendLine('| Drive | Label | Type | Total GB | Free GB |')
[void]$md.AppendLine('|---|---|---|---:|---:|')
foreach ($d in $inv.disks) { [void]$md.AppendLine("| $($d.drive) | $($d.label) | $($d.driveType) | $($d.totalGB) | $($d.freeGB) |") }
[void]$md.AppendLine()
[void]$md.AppendLine("## Largest folders (top $TopFoldersCount)")
[void]$md.AppendLine()
[void]$md.AppendLine('| Size GB | Last modified | Path |')
[void]$md.AppendLine('|---:|---|---|')
foreach ($f in $inv.topFolders) { [void]$md.AppendLine("| $($f.sizeGB) | $($f.modified) | $($f.path) |") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Git repositories')
[void]$md.AppendLine()
[void]$md.AppendLine('| Repo | Branch | Uncommitted | Unpushed | Remote |')
[void]$md.AppendLine('|---|---|---|---:|---|')
foreach ($r in $inv.gitRepos) {
    $flag = if ($r.uncommitted) { '**YES**' } else { 'no' }
    [void]$md.AppendLine("| $($r.path) | $($r.branch) | $flag | $($r.unpushedCount) | $($r.remote) |")
}
[void]$md.AppendLine()
[void]$md.AppendLine('## Developer tooling')
[void]$md.AppendLine()
foreach ($t in $inv.devTools) { [void]$md.AppendLine("- **$($t.tool)** $($t.version) - ``$($t.path)``") }
[void]$md.AppendLine()
[void]$md.AppendLine('## Config locations')
[void]$md.AppendLine()
[void]$md.AppendLine('| Present | What | Path | Modified |')
[void]$md.AppendLine('|---|---|---|---|')
foreach ($c in $inv.configs) {
    $mark = if ($c.exists) { 'yes' } else { '-' }
    [void]$md.AppendLine("| $mark | $($c.name) | ``$($c.path)`` | $($c.modified) |")
}
[void]$md.AppendLine()
[void]$md.AppendLine("## Installed applications ($($inv.installedApps.Count))")
[void]$md.AppendLine()
foreach ($a in $inv.installedApps) { [void]$md.AppendLine("- $($a.name) $($a.version) - $($a.publisher)") }
$md.ToString() | Out-File (Join-Path $OutDir 'INVENTORY.md') -Encoding utf8

Say '=== Inventory complete ==='
Write-Host ''
Write-Host "Report written to: $OutDir" -ForegroundColor Green
Write-Host '  INVENTORY.md         <- read this one' -ForegroundColor Green
Write-Host '  inventory.json       <- send this back to Claude' -ForegroundColor Green
Write-Host '  winget-packages.json'
Write-Host '  vscode-extensions.txt'
