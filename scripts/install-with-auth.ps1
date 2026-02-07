
# scripts/install-with-auth.ps1

$envLocalPath = Join-Path $PSScriptRoot "..\.env.local"

if (Test-Path $envLocalPath) {
    Write-Host "Reading .env.local..."
    $lines = Get-Content $envLocalPath
    foreach ($line in $lines) {
        if ($line -match "^\s*NPM_TOKEN\s*=\s*(.*)") {
            $env:NPM_TOKEN = $matches[1].Trim()
            Write-Host "Found NPM_TOKEN"
        }
    }
} else {
    Write-Warning ".env.local not found."
}

if (-not $env:NPM_TOKEN) {
    Write-Error "NPM_TOKEN not found in environment or .env.local"
    exit 1
}

Write-Host "Configuring npm authentication..."
npm config set @huzilerz:registry https://npm.pkg.github.com
npm config set "//npm.pkg.github.com/:_authToken" "$env:NPM_TOKEN"

Write-Host "Running npm install..."
npm install
