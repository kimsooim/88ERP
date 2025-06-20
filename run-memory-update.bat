@echo off
echo [%DATE% %TIME%] 88OEM 메모리 업데이트 시작
cd /d "C:\Projects\88oem"

:: Node.js 설치 확인
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js가 설치되지 않았습니다.
    echo Node.js 설치 후 다시 실행해주세요.
    echo 설치 링크: https://nodejs.org
    goto :end
)

:: 메모리 업데이트 실행
echo [%DATE% %TIME%] 프로젝트 스캔 중...
node mcp-memory-updater.js

if errorlevel 1 (
    echo [ERROR] 메모리 업데이트 실패
) else (
    echo [SUCCESS] 메모리 업데이트 완료
)

:end
echo [%DATE% %TIME%] 작업 완료
