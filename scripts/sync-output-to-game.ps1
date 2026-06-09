$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path ".").Path
$manifestPath = Join-Path $workspace "config\\deploy-manifest.json"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Missing manifest: $manifestPath"
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$envName = [string]$manifest.gameRootEnv
$defaultRoot = [string]$manifest.defaultGameRoot
$configuredRoot = [Environment]::GetEnvironmentVariable($envName)

if ([string]::IsNullOrWhiteSpace($configuredRoot)) {
  $configuredRoot = $defaultRoot
}

$gameRoot = [System.IO.Path]::GetFullPath($configuredRoot)

if (-not (Test-Path -LiteralPath $gameRoot)) {
  throw "Game root not found: $gameRoot"
}

$copied = @()
$missing = @()

foreach ($entry in $manifest.files) {
  $sourcePath = [System.IO.Path]::GetFullPath((Join-Path $workspace ([string]$entry.source)))
  $targetPath = [System.IO.Path]::GetFullPath((Join-Path $gameRoot ([string]$entry.target)))

  if (-not $sourcePath.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to copy source outside workspace: $sourcePath"
  }

  if (-not $targetPath.StartsWith($gameRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to copy target outside game root: $targetPath"
  }

  if (-not (Test-Path -LiteralPath $sourcePath)) {
    $missing += [PSCustomObject]@{
      Source = $sourcePath
      Target = $targetPath
      Phase = [string]$entry.phase
    }
    continue
  }

  $targetDir = Split-Path -Parent $targetPath
  if (-not (Test-Path -LiteralPath $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }

  Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
  $copied += [PSCustomObject]@{
    Source = $sourcePath
    Target = $targetPath
    Phase = [string]$entry.phase
    Size = (Get-Item -LiteralPath $sourcePath).Length
  }
}

Write-Output ""
Write-Output "Game root: $gameRoot"
Write-Output "Copied files: $($copied.Count)"

if ($copied.Count -gt 0) {
  $copied | Format-Table -AutoSize
}

if ($missing.Count -gt 0) {
  Write-Output ""
  Write-Output "Missing source files skipped: $($missing.Count)"
  $missing | Format-Table -AutoSize
}
