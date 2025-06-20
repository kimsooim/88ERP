#!/usr/bin/env node

/**
 * 통합 백업 시스템 (Claude + Cursor)
 * 클로드와 커서 메모리를 동시에 백업하는 통합 시스템
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class UnifiedBackupSystem {
    constructor() {
        this.logDir = './logs';
        this.logFile = path.join(this.logDir, 'unified-backup.log');
        this.startTime = new Date();
        
        // 로그 디렉토리 생성
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * 로그 메시지 출력
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] UNIFIED-${level}: ${message}`;
        
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\\n');
        } catch (error) {
            console.warn('Failed to write log:', error.message);
        }
    }

    /**
     * 명령어 실행 헬퍼
     */
    async executeScript(scriptPath, description) {
        try {
            this.log('INFO', `🔄 Starting: ${description}`);
            
            const result = execSync(`node ${scriptPath}`, {
                cwd: process.cwd(),
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            this.log('SUCCESS', `✅ Completed: ${description}`);
            return { success: true, output: result.trim() };
            
        } catch (error) {
            this.log('ERROR', `❌ Failed: ${description} - ${error.message}`);
            return { 
                success: false, 
                error: error.message,
                code: error.status 
            };
        }
    }

    /**
     * 시스템 상태 체크
     */
    checkSystemStatus() {
        this.log('INFO', '🔍 Checking system status...');
        
        const status = {
            timestamp: new Date().toISOString(),
            workingDirectory: process.cwd(),
            nodeVersion: process.version,
            platform: process.platform
        };
        
        // Git 상태 확인
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            status.gitStatus = gitStatus.trim().length > 0 ? 'CHANGES_DETECTED' : 'CLEAN';
        } catch (error) {
            status.gitStatus = 'ERROR';
            status.gitError = error.message;
        }
        
        // 백업 디렉토리 확인
        status.backupDirs = {
            claude: fs.existsSync('./backups/claude-memory'),
            cursor: fs.existsSync('./backups/cursor-memory')
        };
        
        this.log('INFO', `📊 System status: Git=${status.gitStatus}, Node=${status.nodeVersion}`);
        return status;
    }

    /**
     * 통합 백업 실행
     */
    async runUnifiedBackup() {
        try {
            this.log('INFO', '🚀 Starting Unified Backup System (Claude + Cursor)');
            
            // 1. 시스템 상태 체크
            const systemStatus = this.checkSystemStatus();
            
            // 2. Claude 메모리 백업
            this.log('INFO', '📋 Phase 1: Claude Memory Backup');
            const claudeResult = await this.executeScript(
                './lib/memory-backup.js',
                'Claude memory backup'
            );
            
            // 3. Cursor 메모리 백업
            this.log('INFO', '💻 Phase 2: Cursor Memory Backup');
            const cursorResult = await this.executeScript(
                './scripts/cursor-backup.js',
                'Cursor memory backup'
            );
            
            // 4. 프로젝트 상태 업데이트
            this.log('INFO', '🔧 Phase 3: Project Status Update');
            const projectResult = await this.executeScript(
                './mcp-memory-updater.js',
                'Project status update'
            );
            
            // 5. 최종 Git 동기화
            await this.finalizeGitSync();
            
            // 6. 백업 통계 생성
            const stats = this.generateBackupReport(systemStatus, {
                claude: claudeResult,
                cursor: cursorResult,
                project: projectResult
            });
            
            // 7. 결과 출력
            this.printFinalReport(stats);
            
            return stats;
            
        } catch (error) {
            this.log('ERROR', `❌ Unified backup system failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * 최종 Git 동기화
     */
    async finalizeGitSync() {
        try {
            this.log('INFO', '🔄 Final Git synchronization...');
            
            // Git add
            execSync('git add .', { cwd: process.cwd(), stdio: 'pipe' });
            
            // 변경사항 확인
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            
            if (status.trim().length > 0) {
                // Git commit
                const timestamp = new Date().toISOString();
                const commitMessage = `Unified backup system - ${timestamp}`;
                
                execSync(`git commit -m "${commitMessage}"`, { 
                    cwd: process.cwd(), 
                    stdio: 'pipe' 
                });
                
                this.log('SUCCESS', '✅ Changes committed to Git');
                
                // Git push
                try {
                    execSync('git push origin main', { 
                        cwd: process.cwd(), 
                        stdio: 'pipe',
                        timeout: 30000
                    });
                    this.log('SUCCESS', '🌐 Changes pushed to remote repository');
                } catch (pushError) {
                    this.log('WARN', `⚠️ Push failed: ${pushError.message}`);
                }
            } else {
                this.log('INFO', '📝 No changes to commit');
            }
            
        } catch (error) {
            this.log('ERROR', `❌ Git sync failed: ${error.message}`);
        }
    }

    /**
     * 백업 리포트 생성
     */
    generateBackupReport(systemStatus, results) {
        const endTime = new Date();
        const duration = endTime - this.startTime;
        
        const report = {
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: Math.round(duration / 1000),
            systemStatus,
            results: {
                claude: results.claude.success ? 'SUCCESS' : 'FAILED',
                cursor: results.cursor.success ? 'SUCCESS' : 'FAILED',
                project: results.project.success ? 'SUCCESS' : 'FAILED'
            },
            summary: {
                totalOperations: 3,
                successCount: Object.values(results).filter(r => r.success).length,
                overallStatus: Object.values(results).every(r => r.success) ? 'SUCCESS' : 'PARTIAL'
            }
        };
        
        // 통계 파일 저장
        const statsFile = path.join(this.logDir, 'unified-backup-stats.json');
        try {
            let allStats = [];
            if (fs.existsSync(statsFile)) {
                const existing = fs.readFileSync(statsFile, 'utf8');
                allStats = JSON.parse(existing);
            }
            
            allStats.push(report);
            if (allStats.length > 50) {
                allStats = allStats.slice(-50);
            }
            
            fs.writeFileSync(statsFile, JSON.stringify(allStats, null, 2));
        } catch (error) {
            this.log('WARN', `Failed to save stats: ${error.message}`);
        }
        
        return report;
    }

    /**
     * 최종 리포트 출력
     */
    printFinalReport(stats) {
        this.log('INFO', '');
        this.log('INFO', '📊 ============= UNIFIED BACKUP REPORT =============');
        this.log('INFO', `⏱️  Duration: ${stats.duration}초`);
        this.log('INFO', `📋 Claude Memory: ${stats.results.claude}`);
        this.log('INFO', `💻 Cursor Memory: ${stats.results.cursor}`);
        this.log('INFO', `🔧 Project Status: ${stats.results.project}`);
        this.log('INFO', `📈 Success Rate: ${stats.summary.successCount}/${stats.summary.totalOperations}`);
        this.log('INFO', `🎯 Overall Status: ${stats.summary.overallStatus}`);
        this.log('INFO', '================================================');
        
        if (stats.summary.overallStatus === 'SUCCESS') {
            this.log('SUCCESS', '🎉 All backup operations completed successfully!');
            this.log('INFO', '🔄 Claude ↔ Cursor 메모리 동기화 완료!');
        } else {
            this.log('WARN', '⚠️ Some operations failed - check detailed logs');
        }
    }

    /**
     * 메인 실행 함수
     */
    async run() {
        try {
            const result = await this.runUnifiedBackup();
            return result.summary.overallStatus === 'SUCCESS';
        } catch (error) {
            this.log('ERROR', `❌ Unified backup system error: ${error.message}`);
            return false;
        }
    }
}

// 실행
if (require.main === module) {
    const unifiedBackup = new UnifiedBackupSystem();
    
    unifiedBackup.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = UnifiedBackupSystem;