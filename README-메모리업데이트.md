# 88OEM 자동 메모리 업데이트 시스템

## 🚀 설치 완료된 파일들

1. **setup-scheduler.ps1** - PowerShell 자동 설정 스크립트
2. **run-memory-update.bat** - 메모리 업데이트 실행 파일
3. **mcp-memory-updater.js** - MCP 연동 업데이트 로직
4. **memory-updater.js** - 기본 프로젝트 모니터링

## ⚡ 빠른 설정 방법

### 1단계: PowerShell 관리자 실행
```
Win + X → "Windows PowerShell(관리자)" 선택
```

### 2단계: 실행 정책 변경 (필요시)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3단계: 자동 설정 실행
```powershell
cd "C:\Projects\88oem"
.\setup-scheduler.ps1
```

## 📋 설정 내용

- **실행 주기**: 매일 오전 9시부터 4시간마다
- **시작 시 실행**: Windows 부팅 시 자동 실행
- **작업명**: 88OEM-Memory-Update
- **로그**: auto-memory-log.json 파일에 기록

## 🔧 수동 테스트

배치 파일 직접 실행:
```
run-memory-update.bat
```

## 📊 확인 방법

1. **작업 스케줄러 확인**
   - Win + R → `taskschd.msc`
   - "88OEM-Memory-Update" 찾기

2. **로그 확인**
   - `auto-memory-log.json` 파일 확인
   - 최근 100개 업데이트 기록 저장

## 🎯 다음 단계

자동 메모리 업데이트 시스템 설치 완료!
이제 프로젝트 개발을 시작하면 변경사항이 자동으로 기록됩니다.

---
*생성일: 2025-06-13*
*프로젝트: 88OEM*