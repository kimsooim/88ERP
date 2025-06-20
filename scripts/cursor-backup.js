#!/usr/bin/env node

/**
 * Cursor 메모리 백업 스크립트
 * MCP Memory에서 데이터를 추출하여 Git에 백업
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CursorMemoryBackup {
    constructor() {
        this.backupDir = './backups/cursor-memory';
        this.logDir = './logs';
        this.logFile = path.join(this.logDir, 'cursor-backup.log');
        this.startTime = Date.now();
        
        // 필요한 디렉토리 생성
        [this.backupDir, this.logDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * 로그 메시지 출력
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] CURSOR-${level}: ${message}`;
        
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\\n');
        } catch (error) {
            console.warn('Failed to write log:', error.message);
        }
    }

    /**
     * MCP Memory Graph 추출 (시뮬레이션)
     * 실제로는 MCP 프로토콜을 통해 데이터를 가져와야 함
     */
    extractMemoryGraph() {
        this.log('INFO', 'Extracting Cursor MCP memory graph...');
        
        // Cursor MCP 메모리 데이터 (실제 구현에서는 MCP 프로토콜 사용)
        const memoryData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            source: 'Cursor MCP Memory',
            entities: [
                {
                    name: 'Ann',
                    entityType: '사용자',
                    observations: [
                        '브랜드 캐릭터 관리 담당',
                        'Windows 환경에서 작업',
                        'NAS 저장소 사용 (ds920)',
                        '한글 파일명을 영문으로 변환하는 rename.py 프로그램 사용'
                    ]
                },
                {
                    name: '88OEMBoard',
                    entityType: '프로젝트',
                    observations: [
                        '위치: \\\\ds920\\\\web\\\\88oemboard',
                        'Notion 연동 기능',
                        'NAS 연동 기능',
                        '대시보드 구현'
                    ]
                },
                {
                    name: '88ERP',
                    entityType: 'Project',
                    observations: [
                        '위치: \\\\ds920\\\\web\\\\88ERP',
                        'Notion 연동 기능',
                        'NAS 연동 기능',
                        '대시보드 구현 기능'
                    ]
                },
                {
                    name: '쵸바(Choba)',
                    entityType: 'Brand',
                    observations: [
                        '볼체인 토이(Ball Chain Toy), 키링 제품군',
                        '총 22개 캐릭터',
                        '계란, 새우, 참치, 문어, 연어, 장어, 날치, 오이, 유부, 꽃게, 상어, 복어, 소세지, 햄, 마카롱, 붕어빵, 표고, 아보카도, 깻잎, 완두콩, 와사비락교, 단무지락교'
                    ]
                },
                {
                    name: '코튼푸드(Cottonfood)',
                    entityType: 'Brand',
                    observations: [
                        '시리즈: 01_mochi (28개 캐릭터), 02_cute, 03_general',
                        '볼체인, 키링 제품군',
                        '쌀알, 망개떡, 아보카도, 복숭아, 식빵, 햄버거, 풋고추, 홍고추, 가지, 당근, 바나나, 수박, 고추장떡볶이, 짜장떡볶이, 그린키위, 골드키위, 알밤, 스모어쿠키, 시루떡, 곶감, 스트롱베리, 오징어, 어묵, 고구마, 초코샘, 캔디바, 참외, 메론빵'
                    ]
                },
                {
                    name: '코튼애니(Cottonani)',
                    entityType: 'Brand',
                    observations: [
                        '주요 캐릭터: 라이독(Liedog)',
                        '색상별: 브라운(Brown), 회색(Gray), 네이비(Navy)'
                    ]
                },
                {
                    name: 'MCP_Git_동기화_시스템',
                    entityType: '시스템',
                    observations: [
                        'Git 저장소: C:/abot/ann-memory-repo',
                        '로컬 메모리: mcp/cursor_helpers.py 모듈',
                        '자동 동기화: 10분 간격',
                        '지원 기능: 캐릭터 검색, 메모리 통계, 데이터 내보내기'
                    ]
                }
            ],
            relations: [
                { from: 'Ann', to: '쵸바(Choba)', relationType: '운영' },
                { from: 'Ann', to: '코튼푸드(Cottonfood)', relationType: '운영' },
                { from: 'Ann', to: '코튼애니(Cottonani)', relationType: '운영' },
                { from: 'Ann', to: '88ERP', relationType: '프로젝트 진행' },
                { from: 'Ann', to: 'MCP_Git_동기화_시스템', relationType: '사용' }
            ],
            metadata: {
                entityCount: 7,
                relationCount: 5,
                extractedBy: 'Cursor MCP',
                extractionMethod: 'MCP memory:read_graph',
                characterCount: {
                    쵸바: 22,
                    코튼푸드: 28,
                    코튼애니: 3
                },
                totalCharacters: 53,
                lastUpdated: new Date().toISOString()
            }
        };
        
        this.log('SUCCESS', `Extracted ${memoryData.entities.length} entities and ${memoryData.relations.length} relations`);
        return memoryData;
    }

    /**
     * 백업 파일 저장
     */
    saveBackup(memoryData) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `cursor-memory-backup-${timestamp}.json`;
        const filepath = path.join(this.backupDir, filename);
        
        try {
            fs.writeFileSync(filepath, JSON.stringify(memoryData, null, 2));
            this.log('SUCCESS', `Backup saved: ${filename}`);
            return { success: true, filename, filepath };
        } catch (error) {
            this.log('ERROR', `Failed to save backup: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Git에 변경사항 추가 및 커밋
     */
    commitToGit(filename) {
        try {
            this.log('INFO', 'Adding changes to Git...');
            
            // Git add
            execSync('git add .', { cwd: process.cwd(), stdio: 'pipe' });
            
            // Git commit
            const commitMessage = `Cursor memory auto-backup - ${filename}`;
            execSync(`git commit -m "${commitMessage}"`, { 
                cwd: process.cwd(), 
                stdio: 'pipe' 
            });
            
            this.log('SUCCESS', 'Changes committed to Git');
            
            // Git push (선택적)
            try {
                execSync('git push origin main', { 
                    cwd: process.cwd(), 
                    stdio: 'pipe',
                    timeout: 30000 // 30초 타임아웃
                });
                this.log('SUCCESS', 'Changes pushed to remote repository');
                return { success: true, pushed: true };
            } catch (pushError) {
                this.log('WARN', `Push failed (will retry later): ${pushError.message}`);
                return { success: true, pushed: false };
            }
            
        } catch (error) {
            this.log('ERROR', `Git operation failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * 전체 백업 프로세스 실행
     */
    async run() {
        try {
            this.log('INFO', '🔄 Starting Cursor memory backup...');
            
            // 1. 메모리 데이터 추출
            const memoryData = this.extractMemoryGraph();
            
            // 2. 백업 파일 저장
            const saveResult = this.saveBackup(memoryData);
            if (!saveResult.success) {
                throw new Error(`Backup save failed: ${saveResult.error}`);
            }
            
            // 3. Git 커밋
            const gitResult = this.commitToGit(saveResult.filename);
            
            // 4. 결과 리포트
            const duration = Date.now() - this.startTime;
            this.log('SUCCESS', `✅ Cursor backup completed in ${Math.round(duration / 1000)}s`);
            this.log('INFO', `📁 File: ${saveResult.filename}`);
            this.log('INFO', `📊 Data: ${memoryData.entities.length} entities, ${memoryData.relations.length} relations`);
            this.log('INFO', `🎭 Characters: ${memoryData.metadata.totalCharacters} total`);
            
            return {
                success: true,
                filename: saveResult.filename,
                memoryData,
                gitCommitted: gitResult.success,
                gitPushed: gitResult.pushed
            };
            
        } catch (error) {
            this.log('ERROR', `❌ Cursor backup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

// 실행
if (require.main === module) {
    const backup = new CursorMemoryBackup();
    
    backup.run().then(result => {
        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    }).catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = CursorMemoryBackup;