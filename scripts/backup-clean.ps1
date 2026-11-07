# ==============================================================================
# KAHIS Workflow Clean Backup Script (for Google Drive / Cloud Backup)
# Excludes: node_modules, .next, logs, temp cache
# ==============================================================================

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceDir = Split-Path -Parent $scriptDir
$downloadsDir = [System.IO.Path]::Combine($env:USERPROFILE, "Downloads")
$dateStamp = Get-Date -Format "yyyyMMdd"
$destinationZip = Join-Path $downloadsDir "kahis-workflow_backup_$dateStamp.zip"
$tempStaging = Join-Path $env:TEMP "kahis-workflow-staging-$dateStamp"

Write-Host "--- Starting Clean Project Backup for Google Drive ---" -ForegroundColor Cyan
Write-Host "Source:      $sourceDir" -ForegroundColor Gray
Write-Host "Destination: $destinationZip" -ForegroundColor Yellow

if (Test-Path $tempStaging) {
    Remove-Item $tempStaging -Recurse -Force
}
New-Item -ItemType Directory -Path (Join-Path $tempStaging "kahis-workflow") -Force | Out-Null
$stagingDest = Join-Path $tempStaging "kahis-workflow"

Write-Host "Copying files (excluding node_modules, .next)..." -ForegroundColor Cyan
robocopy $sourceDir $stagingDest /E /XD node_modules .next .git /XF *.tsbuildinfo *.log /R:1 /W:1 | Out-Null

$stagingFiles = Get-ChildItem -Path $stagingDest -Recurse -File
$stagingSizeMB = [math]::Round(($stagingFiles | Measure-Object Length -Sum).Sum / 1MB, 2)
Write-Host "Staging ready: $($stagingFiles.Count) files ($stagingSizeMB MB)" -ForegroundColor Green

if (Test-Path $destinationZip) {
    Remove-Item $destinationZip -Force
}

Write-Host "Compressing to ZIP archive..." -ForegroundColor Cyan
Compress-Archive -Path "$tempStaging\kahis-workflow" -DestinationPath $destinationZip -CompressionLevel Optimal

Remove-Item $tempStaging -Recurse -Force

$zipItem = Get-Item $destinationZip
$zipSizeMB = [math]::Round($zipItem.Length / 1MB, 2)

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "Backup Created Successfully!" -ForegroundColor Green
Write-Host "File: $destinationZip" -ForegroundColor Yellow
Write-Host "Size: $zipSizeMB MB (Ready to upload to Google Drive)" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Green
