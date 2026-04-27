@echo off
REM Start Student Attendance System - Both Backend and Frontend

echo.
echo ====================================
echo Student Attendance System - STARTUP
echo ====================================
echo.

REM Start Backend in new window
echo Starting Backend Server (http://localhost:5000)...
start "Attendance System - Backend" cmd /k "cd backend && npm start"

echo.
echo Waiting 3 seconds for backend to start...
timeout /t 3

REM Start Frontend in new window
echo Starting Frontend Server (http://localhost:8000)...
start "Attendance System - Frontend" cmd /k "cd frontend && python -m http.server 8000"

echo.
echo ====================================
echo Services Starting:
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:8000
echo ====================================
echo.
echo Open your browser and go to:
echo http://localhost:8000
echo.
pause
