#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "=== FRAME. starting up ==="

if [ ! -d "backend/node_modules" ]; then
  echo "Installing backend (first run only)..."
  npm install --prefix backend
fi

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend (first run only)..."
  npm install --prefix frontend
fi

if [ ! -d "frontend/dist" ]; then
  echo "Building the app (first run only)..."
  npm run build --prefix frontend
fi

echo ""
echo "Opening http://localhost:8787 in your browser..."
( sleep 2; open "http://localhost:8787" 2>/dev/null || xdg-open "http://localhost:8787" 2>/dev/null ) &

echo "=== Running. Close this window to stop FRAME. ==="
node backend/src/server.js
