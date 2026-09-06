<#
.SYNOPSIS
    Confirms every hashed file arrived intact. Run on the NEW laptop after restore.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\5-Verify.ps1 -ExportRoot E:\Migration -RestoredRoot "$env:USERPROFILE\Downloads\gravity draft new"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$ExportRoot,
    [Parameter(Mandatory)][string]$RestoredRoot
)

$hashFile = Join-Path $ExportRoot 'SOURCE-HASHES.json'
if (-not (Test-Path -LiteralPath $hashFile)) { throw "No SOURCE-HASHES.json at $hashFile" }

$expected = Get-Content -LiteralPath $hashFile -Raw | ConvertFrom-Json
Write-Host "Verifying $($expected.Count) files against $RestoredRoot" -ForegroundColor Cyan

$ok = 0; $bad = @(); $missing = @()
foreach ($e in $expected) {
    $p = Join-Path $RestoredRoot $e.path
    if (-not (Test-Path -LiteralPath $p)) { $missing += $e.path; continue }
    $actual = (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash
    if ($actual -eq $e.sha256) { $ok++ }
    else { $bad += [pscustomobject]@{ path=$e.path; expected=$e.sha256; actual=$actual } }
}

Write-Host ''
Write-Host "  matched:  $ok"   -ForegroundColor Green
Write-Host "  missing:  $($missing.Count)" -ForegroundColor $(if($missing.Count){'Red'}else{'Green'})
Write-Host "  mismatch: $($bad.Count)"     -ForegroundColor $(if($bad.Count){'Red'}else{'Green'})

if ($missing) { Write-Host ''; Write-Host 'MISSING:' -ForegroundColor Red; $missing | ForEach-Object { Write-Host "  $_" } }
if ($bad)     { Write-Host ''; Write-Host 'CORRUPT:' -ForegroundColor Red; $bad | Format-Table -AutoSize }

if (-not $missing -and -not $bad) {
    Write-Host ''
    Write-Host 'All files verified. Safe to wipe the old laptop.' -ForegroundColor Green
} else {
    Write-Host ''
    Write-Host 'DO NOT WIPE THE OLD LAPTOP until this comes back clean.' -ForegroundColor Red
    exit 1
}
