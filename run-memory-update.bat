@echo off
chcp 65001 >nul
echo [%DATE% %TIME%] Starting 88OEM Integrated Memory Backup
cd /d "C:\abot\ann-memory-repo"

:: Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js and try again
    echo Download: https://nodejs.org
    goto :end
)

:: Create logs directory
if not exist "logs" mkdir logs

:: Run integrated memory backup
echo [%DATE% %TIME%] Checking project status...
node mcp-memory-updater.js
set PROJECT_RESULT=%errorlevel%

echo [%DATE% %TIME%] Backing up Claude memory...
node lib/memory-backup.js
set CLAUDE_RESULT=%errorlevel%

:: Check results and log
if %PROJECT_RESULT% neq 0 (
    echo [ERROR] Project status check failed
    echo [%DATE% %TIME%] PROJECT_ERROR >> logs/backup.log
) else (
    echo [SUCCESS] Project status check completed
    echo [%DATE% %TIME%] PROJECT_SUCCESS >> logs/backup.log
)

if %CLAUDE_RESULT% neq 0 (
    echo [ERROR] Claude memory backup failed
    echo [%DATE% %TIME%] CLAUDE_ERROR >> logs/backup.log
) else (
    echo [SUCCESS] Claude memory backup completed
    echo [%DATE% %TIME%] CLAUDE_SUCCESS >> logs/backup.log
)

:: Check Git status
echo [%DATE% %TIME%] Checking Git status...
git status --porcelain >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Git status check failed
) else (
    echo [INFO] Git repository is healthy
)

:end
echo [%DATE% %TIME%] Integrated backup completed
echo [%DATE% %TIME%] BATCH_COMPLETED >> logs/backup.log
echo Press any key to exit...
pause >nul