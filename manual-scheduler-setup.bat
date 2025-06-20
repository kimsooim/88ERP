@echo off
echo ========================================
echo 88OEM Claude Memory Backup Scheduler
echo ========================================
echo.

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Administrator privileges confirmed
) else (
    echo ❌ Administrator privileges required
    echo Please run as Administrator
    pause
    exit /b 1
)

echo.
echo 🚀 Creating scheduled task...

REM 스케줄러 작업 생성
schtasks /create /tn "88OEM-Claude-Memory-Backup" /tr "C:\abot\ann-memory-repo\scripts\scheduler-backup.bat" /sc minute /mo 10 /st 00:00 /ru "%USERNAME%" /rp "" /f

if %errorLevel% == 0 (
    echo ✅ Scheduled task created successfully!
    echo.
    echo 📋 Task Details:
    echo   • Name: 88OEM-Claude-Memory-Backup
    echo   • Interval: Every 10 minutes
    echo   • Script: scheduler-backup.bat
    echo   • User: %USERNAME%
    echo.
    echo 🚀 Starting initial backup...
    schtasks /run /tn "88OEM-Claude-Memory-Backup"
    echo.
    echo ✨ Setup completed! Backup system is now running automatically.
) else (
    echo ❌ Failed to create scheduled task
    echo Error code: %errorLevel%
)

echo.
echo 🔧 Management Commands:
echo   View task:   schtasks /query /tn "88OEM-Claude-Memory-Backup"
echo   Start task:  schtasks /run /tn "88OEM-Claude-Memory-Backup"
echo   Delete task: schtasks /delete /tn "88OEM-Claude-Memory-Backup" /f
echo.
pause