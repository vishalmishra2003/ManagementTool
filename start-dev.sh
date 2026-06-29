#!/usr/bin/env bash
# Starts both backend and frontend dev servers together.
# Run from the project root with:  bash start-dev.sh   (or  ./start-dev.sh)

# Move to the directory this script lives in, so it works from anywhere.
cd "$(dirname "$0")" || exit 1

# When you press Ctrl+C, kill both child processes.
trap 'kill 0' EXIT

echo "Starting backend (nodemon)..."
(cd backend && npm run dev) &

echo "Starting frontend (vite)..."
(cd frontend && npm run dev) &

# Wait for both background jobs.
wait
