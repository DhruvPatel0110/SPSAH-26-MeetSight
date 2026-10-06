@echo off
TITLE MeetSight - SPSAH-26 Launcher
echo =====================================================================
echo   MeetSight: Autonomous Voice-First Meeting Intelligence
echo   Hackathon: Stop Prompting. Code Solo Agents 2026 (HiDevs)
echo   Stack: Omi (Voice) + Lyzr (Multi-Agent) + Qdrant (Persistent Memory)
echo =====================================================================
echo.

echo [1/2] Starting MeetSight FastAPI Backend on http://127.0.0.1:8000...
start "MeetSight Backend" cmd /k "cd backend && .\venv\Scripts\activate && python main.py"

echo [2/2] Starting MeetSight React Frontend on http://localhost:5173...
start "MeetSight Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================================
echo   Both services are launching in separate windows!
echo   Frontend: http://localhost:5173
echo   Backend API: http://127.0.0.1:8000/docs
echo =====================================================================
pause
