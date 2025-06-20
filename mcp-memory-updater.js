/**
 * MCP 연동 자동 메모리 업데이트 시스템
 * Claude MCP를 통한 자동 메모리 업데이트
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MCPMemoryUpdater {
    constructor() {
        this.projectPath = 'C:\Projects\88oem';
        this.mcpCommands = [];
    }

    // 프로젝트 변경사항 감지
    detectChanges() {
        const changes = {
            timestamp: new Date().toISOString(),
            newFiles: [],
            modifiedFiles: [],
            deletedFiles: [],
            gitChanges: null,
            projectStats: null
        };

        try {
            // Git 변경사항 확인
            const gitStatus = execSync('git status --porcelain', {
                cwd: this.projectPath,
                encoding: 'utf8'
            }).trim();

            if (gitStatus) {
                changes.gitChanges = gitStatus.split('\n').map(line => {
                    const status = line.substring(0, 2);
                    const file = line.substring(3);
                    return { status, file };
                });
            }

            // 프로젝트 통계
            changes.projectStats = this.getProjectStats();

        } catch (error) {
            changes.error = error.message;
        }

        return changes;
    }

    // 프로젝트 통계 수집
    getProjectStats() {
        const stats = {
            totalFiles: 0,
            jsFiles: 0,
            jsonFiles: 0,
            totalSize: 0,
            lastModified: null
        };

        const scanDirectory = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    if (item.startsWith('.')) return;
                    
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        scanDirectory(fullPath);
                    } else {
                        stats.totalFiles++;
                        stats.totalSize += stat.size;
                        
                        const ext = path.extname(item).toLowerCase();
                        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                            stats.jsFiles++;
                        } else if (ext === '.json') {
                            stats.jsonFiles++;
                        }
                        
                        if (!stats.lastModified || stat.mtime > new Date(stats.lastModified)) {
                            stats.lastModified = stat.mtime.toISOString();
                        }
                    }
                });
            } catch (e) {
                // 접근 권한 없는 폴더 무시
            }
        };

        scanDirectory(this.projectPath);
        return stats;
    }

    // MCP 명령어 생성
    generateMCPCommands(changes) {
        const observations = [];

        // 기본 정보
        observations.push(`자동 업데이트: ${changes.timestamp}`);

        // 프로젝트 통계
        if (changes.projectStats) {
            const stats = changes.projectStats;
            observations.push(`총 파일: ${stats.totalFiles}개`);
            observations.push(`JS/TS 파일: ${stats.jsFiles}개`);
            observations.push(`JSON 파일: ${stats.jsonFiles}개`);
            observations.push(`프로젝트 크기: ${(stats.totalSize / 1024).toFixed(2)}KB`);
            if (stats.lastModified) {
                observations.push(`최근 수정: ${new Date(stats.lastModified).toLocaleString()}`);
            }
        }

        // Git 변경사항
        if (changes.gitChanges && changes.gitChanges.length > 0) {
            observations.push(`Git 변경사항: ${changes.gitChanges.length}개 파일`);
            changes.gitChanges.slice(0, 5).forEach(change => {
                const statusText = this.getStatusText(change.status);
                observations.push(`- ${statusText}: ${change.file}`);
            });
        } else {
            observations.push('Git 상태: 변경사항 없음');
        }

        // 에러 정보
        if (changes.error) {
            observations.push(`에러: ${changes.error}`);
        }

        return {
            entityName: "88OEM 프로젝트",
            contents: observations
        };
    }

    // Git 상태 텍스트 변환
    getStatusText(status) {
        const statusMap = {
            'A ': '새 파일',
            'M ': '수정됨',
            'D ': '삭제됨',
            'R ': '이름 변경',
            'C ': '복사됨',
            '??': '추적되지 않음'
        };
        return statusMap[status] || status;
    }

    // 실행
    async run() {
        try {
            console.log('88OEM 프로젝트 자동 메모리 업데이트 시작...');
            
            const changes = this.detectChanges();
            const mcpData = this.generateMCPCommands(changes);
            
            // 로그 파일에 기록
            const logFile = path.join(this.projectPath, 'auto-memory-log.json');
            const logEntry = {
                timestamp: new Date().toISOString(),
                changes: changes,
                mcpData: mcpData
            };
            
            // 기존 로그 읽기
            let logs = [];
            if (fs.existsSync(logFile)) {
                try {
                    const existingLogs = fs.readFileSync(logFile, 'utf8');
                    logs = JSON.parse(existingLogs);
                } catch (e) {
                    logs = [];
                }
            }
            
            // 새 로그 추가 (최근 100개만 유지)
            logs.push(logEntry);
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }
            
            // 로그 파일 저장
            fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
            
            console.log('MCP 업데이트 데이터:');
            console.log(JSON.stringify(mcpData, null, 2));
            
            // 요약 정보 출력
            console.log('\n=== 업데이트 요약 ===');
            console.log(`시간: ${new Date().toLocaleString()}`);
            console.log(`총 파일: ${changes.projectStats?.totalFiles || 0}개`);
            console.log(`Git 변경사항: ${changes.gitChanges?.length || 0}개`);
            
            return mcpData;
            
        } catch (error) {
            console.error('자동 메모리 업데이트 실패:', error);
            return null;
        }
    }
}

// 실행
if (require.main === module) {
    const updater = new MCPMemoryUpdater();
    updater.run();
}

module.exports = MCPMemoryUpdater;