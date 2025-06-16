/**
 * 88OEM 프로젝트 자동 메모리 업데이트 시스템
 * Memory MCP를 활용한 프로젝트 변경사항 자동 추적
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectMemoryUpdater {
    constructor() {
        this.projectPath = 'C:\Projects\88oem';
        this.lastUpdate = new Date();
        this.watchedFiles = [
            'package.json',
            'README.md',
            'next.config.js',
            '.env',
            'src/**/*.js',
            'src/**/*.jsx',
            'pages/**/*.js',
            'components/**/*.js'
        ];
    }

    // 프로젝트 상태 체크
    checkProjectStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            changes: [],
            gitStatus: null,
            fileCount: 0,
            lastCommit: null
        };

        try {
            // Git 상태 확인
            try {
                status.gitStatus = execSync('git status --porcelain', { 
                    cwd: this.projectPath,
                    encoding: 'utf8'
                }).trim();
                
                status.lastCommit = execSync('git log -1 --format="%h - %s (%an, %ar)"', {
                    cwd: this.projectPath,
                    encoding: 'utf8'
                }).trim();
            } catch (e) {
                status.gitStatus = 'Git not initialized or no commits';
            }

            // 파일 개수 확인
            status.fileCount = this.countProjectFiles();
            
            // 최근 변경된 파일들
            status.recentChanges = this.getRecentChanges();

        } catch (error) {
            status.error = error.message;
        }

        return status;
    }

    // 프로젝트 파일 개수 계산
    countProjectFiles() {
        let count = 0;
        const countFiles = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    if (item.startsWith('.')) return; // .git, .env 등 제외
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) {
                        countFiles(fullPath);
                    } else {
                        count++;
                    }
                });
            } catch (e) {
                // 접근 권한 없는 폴더 무시
            }
        };
        countFiles(this.projectPath);
        return count;
    }

    // 최근 변경된 파일들 찾기
    getRecentChanges() {
        const changes = [];
        const checkRecent = (dir, basePath = '') => {
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    if (item.startsWith('.')) return;
                    const fullPath = path.join(dir, item);
                    const relativePath = path.join(basePath, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        checkRecent(fullPath, relativePath);
                    } else {
                        const age = Date.now() - stat.mtime.getTime();
                        if (age < 24 * 60 * 60 * 1000) { // 24시간 이내
                            changes.push({
                                file: relativePath,
                                modified: stat.mtime.toISOString(),
                                size: stat.size
                            });
                        }
                    }
                });
            } catch (e) {
                // 접근 권한 없는 폴더 무시
            }
        };
        checkRecent(this.projectPath);
        return changes.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    }

    // Memory MCP 업데이트 데이터 생성
    generateMemoryUpdate() {
        const status = this.checkProjectStatus();
        const observations = [];

        observations.push(`프로젝트 상태 체크: ${status.timestamp}`);
        observations.push(`총 파일 개수: ${status.fileCount}개`);

        if (status.gitStatus) {
            if (status.gitStatus === 'Git not initialized or no commits') {
                observations.push('Git 저장소: 초기화됨, 커밋 없음');
            } else if (status.gitStatus === '') {
                observations.push('Git 상태: 모든 변경사항 커밋됨');
                if (status.lastCommit) {
                    observations.push(`최근 커밋: ${status.lastCommit}`);
                }
            } else {
                observations.push(`Git 상태: 미커밋 변경사항 있음`);
                observations.push(`변경사항: ${status.gitStatus.split('\n').length}개 파일`);
            }
        }

        if (status.recentChanges.length > 0) {
            observations.push(`최근 24시간 내 변경된 파일: ${status.recentChanges.length}개`);
            status.recentChanges.slice(0, 3).forEach(change => {
                observations.push(`- ${change.file} (${new Date(change.modified).toLocaleString()})`);
            });
        }

        if (status.error) {
            observations.push(`에러 발생: ${status.error}`);
        }

        return {
            entityName: "88OEM 프로젝트",
            observations: observations
        };
    }

    // 자동 실행용 함수
    async runUpdate() {
        try {
            const updateData = this.generateMemoryUpdate();
            
            // MCP 명령어 실행 (실제로는 MCP 서버를 통해 실행되어야 함)
            console.log('Memory Update Data:', JSON.stringify(updateData, null, 2));
            
            // 로그 파일에 기록
            const logEntry = {
                timestamp: new Date().toISOString(),
                data: updateData
            };
            
            const logFile = path.join(this.projectPath, 'memory-update.log');
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
            
            console.log(`메모리 업데이트 완료: ${new Date().toLocaleString()}`);
            
        } catch (error) {
            console.error('메모리 업데이트 실패:', error);
        }
    }
}

// 실행 부분
if (require.main === module) {
    const updater = new ProjectMemoryUpdater();
    updater.runUpdate();
}

module.exports = ProjectMemoryUpdater;