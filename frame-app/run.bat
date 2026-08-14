@echo off
cd /d "%~dp0"

echo === FRAME. starting up ===

if not exist "backend\node_modules" (
  echo Installing backend (first run only)...
  call npm install --prefix backend
)

if not exist "backend\.env" (
  copy backend\.env.example backend\.env >nul
)

if not exist "frontend\node_modules" (
  echo Installing frontend (first run only)...
  call npm install --prefix frontend
)

if not exist "frontend\dist" (
  echo Building the app (first run only)...
  call npm run build --prefix frontend
)

echo.
echo Opening http://localhost:8787 in your browser...
start "" http://localhost:8787

echo === Running. Close this window to stop FRAME. ===
node backend\src\server.js
