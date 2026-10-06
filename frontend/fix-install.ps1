# Fix npm installation issues
# This script cleans up and reinstalls dependencies properly

Write-Host "Cleaning up..." -ForegroundColor Yellow

# Close any processes that might be using node_modules
Write-Host "Please close VS Code and any running dev servers, then press Enter to continue..."
Read-Host

# Remove node_modules and package-lock.json
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "`nInstallation complete!" -ForegroundColor Green
Write-Host "You can now run: npm run dev" -ForegroundColor Cyan
