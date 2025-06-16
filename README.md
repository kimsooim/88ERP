# 88OEM

88TOY OEM 대시보드 - Notion + NAS + 대시보드 통합 시스템

## 🎯 프로젝트 개요

- **목적**: 88TOY 인형 제조업체의 OEM 영업 및 생산 과정 시각화
- **주요 기능**: 
  - Notion API 연동으로 프로젝트 관리
  - NAS 데이터베이스 연동으로 생산 현황 추적
  - 실시간 대시보드로 통합 현황 관리
  - 자동 메모리 업데이트 시스템

## 🚀 기술 스택

### Frontend
- **Next.js 14** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Zustand** - 상태 관리
- **Recharts** - 데이터 시각화

### Backend
- **Next.js API Routes** - 서버리스 API
- **NextAuth.js** - 인증 시스템
- **Axios** - HTTP 클라이언트

### Database & Integration
- **@notionhq/client** - Notion API 클라이언트
- **MySQL2** - NAS 데이터베이스 연결
- **Memory MCP** - 자동 메모리 업데이트

## �� 프로젝트 구조

```
88oem/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatsCard.tsx
│   ├── pages/              # Next.js 페이지
│   │   ├── api/            # API 라우트
│   │   ├── index.tsx       # 메인 대시보드
│   │   ├── _app.tsx        # 앱 설정
│   │   └── _document.tsx   # 문서 설정
│   ├── lib/                # 유틸리티 함수
│   └── styles/             # 스타일 파일
├── memory-updater.js       # 메모리 업데이트 시스템
├── mcp-memory-updater.js   # MCP 연동 업데이트
├── setup-scheduler.ps1     # Windows 스케줄러 설정
└── run-memory-update.bat   # 업데이트 실행 배치
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일에서 다음 설정:
- Notion API 토큰
- 데이터베이스 연결 정보
- 인증 시크릿 키

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드 및 배포
```bash
npm run build
npm run start
```

## 🔧 자동 메모리 업데이트 시스템

### 설치된 기능
- **PowerShell 자동 설정**: `setup-scheduler.ps1`
- **스케줄 실행**: 매일 오전 9시부터 4시간마다
- **시스템 부팅시 자동 실행**
- **Memory MCP 자동 업데이트**

### 실행 방법
```powershell
# 관리자 권한으로 PowerShell 실행
cd "C:\Projects\88oem"
.\setup-scheduler.ps1
```

## 📊 주요 기능

### 대시보드
- 실시간 프로젝트 현황
- 주문 및 생산 통계
- 시스템 상태 모니터링

### 연동 시스템
- **Notion API**: 프로젝트 및 작업 관리
- **NAS 데이터베이스**: 생산 데이터 및 재고 관리
- **자동 동기화**: 실시간 데이터 업데이트

## 🎯 배포 정보

- **개발 환경**: http://localhost:3000
- **운영 환경**: https://db.88toy.co.kr
- **서버 환경**: Ubuntu 22.04 + Node.js LTS + Nginx

## 📈 다음 단계

1. **Notion API 연동 구현**
2. **NAS 데이터베이스 연결**
3. **사용자 인증 시스템 구축**
4. **실시간 데이터 동기화**
5. **운영 서버 배포**

---

**생성일**: 2025-06-13  
**프로젝트 관리자**: Ann (Cottonfood & Choba)  
**자동 메모리 업데이트**: 활성화됨