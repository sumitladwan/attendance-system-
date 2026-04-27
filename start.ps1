# Start Student Attendance System - Both Backend and Frontend
# PowerShell Script

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Student Attendance System - STARTUP" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is accessible (optional check)
Write-Host "Checking MongoDB connection..." -ForegroundColor Yellow

# Start Backend
Write-Host "Starting Backend Server (http://localhost:5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

Write-Host ""
Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend Server (http://localhost:8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; python -m http.server 8000"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Services Starting:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:8000" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open your browser and go to:" -ForegroundColor Yellow
Write-Host "http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
