@echo off
:: Windows Task Scheduler용 통합 백업 실행 스크립트
:: 10분 간격으로 실행되는 자동 백업 시스템

cd /d "C:\abot\ann-memory-repo"

:: Node.js를 통한 통합 백업 실행
node scripts/integrated-backup.js

:: 실행 결과 확인
if %errorlevel% equ 0 (
    echo Integrated backup completed successfully
) else (
    echo Integrated backup failed with code %errorlevel%
)