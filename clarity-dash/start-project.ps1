# ClarityDash Project Startup Script
Write-Host "Starting ClarityDash Project..." -ForegroundColor Green
Write-Host ""

# Step 1: Start MongoDB
Write-Host "1. Starting MongoDB..." -ForegroundColor Yellow
Start-Process -FilePath "mongod" -ArgumentList "--dbpath", "C:\data\db", "--port", "27017" -WindowStyle Normal
Start-Sleep -Seconds 3

# Step 2: Start Backend Server
Write-Host "2. Starting Backend Server..." -ForegroundColor Yellow
Set-Location "server"
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm start" -WindowStyle Normal
Start-Sleep -Seconds 3

# Step 3: Start Frontend Client
Write-Host "3. Starting Frontend Client..." -ForegroundColor Yellow
Set-Location "..\client"
Start-Process -FilePath "cmd" -ArgumentList "/k", "npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "All services are starting..." -ForegroundColor Green
Write-Host "- MongoDB: http://localhost:27017" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Wait for MongoDB to fully start (check the MongoDB terminal)" -ForegroundColor White
Write-Host "2. In the Backend Server terminal, run: node seed-data.js" -ForegroundColor White
Write-Host "3. Open your browser to http://localhost:5173" -ForegroundColor White
Write-Host "4. Login with: john.doe@example.com / password123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
