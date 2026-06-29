@echo off
REM Starts both backend and frontend dev servers in separate windows.
REM Double-click this file, or run "start-dev.bat" from the project root.

echo Starting backend (nodemon)...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Starting frontend (vite)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are launching in their own windows.
echo Close those windows to stop the servers.
