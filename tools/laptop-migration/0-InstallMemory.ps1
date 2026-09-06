<#
.SYNOPSIS
    Installs the migration handoff into Claude Code's user memory on this machine.

.DESCRIPTION
    Writes HANDOFF.md into %USERPROFILE%\.claude\CLAUDE.md so that every future
    Claude Code session started on this laptop loads the migration state
    automatically - no need to re-explain it.

    Idempotent: the block is delimited by markers and replaced on re-run.
    Anything else already in CLAUDE.md is preserved.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\0-InstallMemory.ps1
    powershell -ExecutionPolicy Bypass -File .\0-InstallMemory.ps1 -Remove
#>
[CmdletBinding()]
param(
    [string]$HandoffPath = (Join-Path $PSScriptRoot 'HANDOFF.md'),
    [string]$MemoryPath  = "$env:USERPROFILE\.claude\CLAUDE.md",
    [switch]$Remove
)

$ErrorActionPreference = 'Stop'
$startMarker = '<!-- BEGIN laptop-migration-handoff -->'
$endMarker   = '<!-- END laptop-migration-handoff -->'

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $MemoryPath) | Out-Null

$existing = if (Test-Path -LiteralPath $MemoryPath) {
    Get-Content -LiteralPath $MemoryPath -Raw
} else { '' }

# Strip any previous block so re-running updates rather than duplicates.
$pattern = [regex]::Escape($startMarker) + '.*?' + [regex]::Escape($endMarker)
$cleaned = [regex]::Replace($existing, $pattern, '', 'Singleline').TrimEnd()

if ($Remove) {
    if ($cleaned) { $cleaned + "`n" | Out-File -LiteralPath $MemoryPath -Encoding utf8 }
    elseif (Test-Path -LiteralPath $MemoryPath) { Remove-Item -LiteralPath $MemoryPath }
    Write-Host "Removed migration handoff from $MemoryPath" -ForegroundColor Green
    exit 0
}

if (-not (Test-Path -LiteralPath $HandoffPath)) { throw "HANDOFF.md not found at $HandoffPath" }
$handoff = Get-Content -LiteralPath $HandoffPath -Raw

$block = @"
$startMarker
# Laptop migration (active)

Kit lives at ``$PSScriptRoot``. Installed into memory $(Get-Date -Format 'yyyy-MM-dd HH:mm').

$handoff
$endMarker
"@

$out = if ($cleaned) { "$cleaned`n`n$block`n" } else { "$block`n" }
$out | Out-File -LiteralPath $MemoryPath -Encoding utf8

Write-Host "Migration handoff installed into $MemoryPath" -ForegroundColor Green
Write-Host 'Every Claude Code session on this machine will now load it at startup.' -ForegroundColor Green
Write-Host 'Re-run this script after editing HANDOFF.md to refresh it; -Remove to take it out.' -ForegroundColor DarkGray
