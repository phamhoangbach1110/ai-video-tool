@echo off
chcp 65001 >nul
title AI Video Tool — Local Dev

echo.
echo  ╔════════════════════════════════════════════╗
echo  ║     AI VIDEO TOOL — Khởi động local        ║
echo  ╚════════════════════════════════════════════╝
echo.

:: Kiểm tra Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Python chưa cài! Tải tại: https://python.org
    pause & exit /b
)

:: Kiểm tra Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js chưa cài! Tải tại: https://nodejs.org
    pause & exit /b
)

:: Cài Python deps
echo  📦 Cài thư viện Python...
pip install -r backend\requirements.txt -q --no-warn-script-location

:: Cài Node deps
echo  📦 Cài thư viện React...
cd frontend
call npm install --silent
cd ..

:: Chạy backend trong cửa sổ mới
echo.
echo  🚀 Khởi động Backend (port 5000)...
start "AI Video Backend" cmd /k "cd backend && python app.py"

:: Chờ backend lên
timeout /t 3 /nobreak >nul

:: Chạy frontend
echo  🌐 Khởi động Frontend React (port 3000)...
echo  📌 Trình duyệt sẽ tự mở tại http://localhost:3000
echo.
cd frontend
call npm start
