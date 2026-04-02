#!/bin/bash
# Start both backend and frontend

echo "=== Stock Backtesting Dashboard ==="
echo ""

# Start backend
echo "[1/2] Starting backend (FastAPI)..."
cd backend
pip install -r requirements.txt -q 2>/dev/null
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "[2/2] Starting frontend (Vite + React)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
