# 88OEM Claude Memory Backup System

클로드 메모리를 Git 저장소에 자동 백업하고 커서와 공유하는 통합 시스템

## 🚀 주요 기능

- **클로드 메모리 자동 추출**: MCP `memory:read_graph` 도구 활용
- **Git 자동 커밋/푸시**: GitHub 원격 저장소 동기화
- **백업 파일 관리**: 최대 100개 백업 유지 (자동 정리)
- **스케줄링**: 10분 간격 자동 실행
- **에러 복구**: 네트워크 실패 시 재시도 메커니즘
- **로깅**: 상세 실행 로그 및 통계

## 📦 설치된 구성요소

```
C:\abot\ann-memory-repo\
├── lib/
│   ├── memory-backup.js      # 메인 백업 시스템
│   ├── memory-extractor.js   # MCP 메모리 추출기
│   ├── git-manager.js        # Git 자동화 관리
│   ├── schema-validator.js   # JSON 스키마 검증
│   └── mcp-adapter.js        # 환경별 어댑터
├── scripts/
│   ├── integrated-backup.js  # 통합 실행 스크립트
│   ├── scheduler-backup.bat  # 스케줄러용 배치 파일
│   └── setup-scheduler.ps1   # Windows 작업 스케줄러 설정
├── backups/claude-memory/    # 백업 파일 저장소
├── schemas/                  # JSON 스키마 정의
└── logs/                     # 실행 로그
```

## ⚡ 빠른 시작

### 1. 수동 백업 실행
```bash
# 클로드 메모리만 백업
npm run backup:claude

# 프로젝트 상태만 체크
npm run backup:project

# 통합 백업 (권장)
npm run backup:integrated
```

### 2. 자동 스케줄링 설정
```powershell
# PowerShell 관리자 권한으로 실행
npm run scheduler:setup

# 스케줄러 제거
npm run scheduler:remove
```

## 📊 백업 모니터링

### 로그 파일 확인
- **실행 로그**: `logs/backup.log`
- **통계 데이터**: `logs/backup-stats.json`
- **백업 파일**: `backups/claude-memory/`

### Git 커밋 확인
```bash
git log --oneline -10
```

## 🔧 고급 사용법

### 직접 API 사용
```javascript
const GitManager = require('./lib/git-manager');
const { createMemoryExtractor } = require('./lib/mcp-adapter');

// 메모리 추출
const extractor = createMemoryExtractor();
const memoryData = await extractor.extractMemoryData();

// Git 백업
const gitManager = new GitManager();
const result = await gitManager.commitBackup(memoryData);
```

### 커서 연동
백업된 JSON 파일은 커서에서 직접 읽을 수 있습니다:
```javascript
// 최신 백업 파일 읽기
const fs = require('fs');
const latestBackup = fs.readFileSync('backups/claude-memory/backup-latest.json');
const memoryData = JSON.parse(latestBackup);

// 엔티티 검색
const anns = memoryData.entities.filter(e => e.name === 'Ann');
```

## 🔍 트러블슈팅

### 일반적인 문제

1. **Git 푸시 실패**
   - 네트워크 연결 확인
   - GitHub 인증 상태 확인
   - 로컬 백업은 보존됨 (다음 실행 시 재시도)

2. **MCP 도구 오류**
   - 클로드 환경에서만 실제 MCP 도구 사용 가능
   - Node.js 환경에서는 시뮬레이션 모드로 동작

3. **권한 문제**
   - PowerShell 관리자 권한으로 실행
   - Git 저장소 쓰기 권한 확인

4. **백업 파일 누적**
   - 자동으로 100개 제한 관리
   - 수동 정리: `cleanupOldBackups()` 메서드 사용

## 🚀 완료된 작업 현황

✅ **모든 백업 시스템 완료**
- 메모리 추출 시스템 (MemoryExtractor)
- Git 자동화 관리 (GitManager) 
- 스케줄링 시스템 (IntegratedBackupRunner)
- 에러 핸들링 및 복구 메커니즘
- 로깅 및 모니터링 시스템

---

**🎯 목표 달성**: 클로드 메모리를 안전하고 자동으로 백업하여 커서와 완벽 연동

*최종 업데이트: 2025-06-20*