@echo off
echo Starting ClarityDash Project...
echo.

echo 1. Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db --port 27017"
timeout /t 3 /nobreak >nul

echo 2. Starting Backend Server...
cd server
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo 3. Starting Frontend Client...
cd ..\client
start "Frontend Client" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo All services are starting...
echo - MongoDB: http://localhost:27017
echo - Backend API: http://localhost:5000
echo - Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
