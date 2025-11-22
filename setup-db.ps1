# Database Setup Script for Trello Clone
# This script initializes the PostgreSQL database

$env:DATABASE_URL="postgresql://postgres:shriram@108@localhost:5432/trello_db"

Write-Host "Setting up Trello Clone Database..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 1: Synchronizing database schema..." -ForegroundColor Yellow
npx prisma db push --skip-generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database schema synchronized successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to synchronize database schema" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dev" -ForegroundColor Gray
Write-Host "2. Visit: http://localhost:3000" -ForegroundColor Gray
Write-Host "3. Register or use demo credentials" -ForegroundColor Gray
