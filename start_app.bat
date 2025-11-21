@echo off
echo Starting NovaOrder System...
echo.

REM 检查是否安装了 Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed! Please install Node.js from nodejs.org first.
    pause
    exit
)

REM 第一次运行时安装依赖
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

REM 启动开发服务器
echo.
echo Launching Application...
echo Local server will start shortly. Press Ctrl+C to stop.
echo.
call npm run dev

pause