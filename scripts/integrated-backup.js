#!/usr/bin/env node

/**
 * 통합 메모리 백업 실행 스크립트
 * 프로젝트 상태 체크 + 클로드 메모리 백업 + Git 커밋
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class IntegratedBackupRunner {
    constructor() {
        this.logDir = './logs';
        this.logFile = path.join(this.logDir, 'backup.log');
        this.startTime = new Date();
        
        // 로그 디렉토리 생성
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * 로그 메시지 출력 및 파일 저장
     */
    log(level, message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${level}: ${message}`;
        
        console.log(logMessage);
        
        try {
            fs.appendFileSync(this.logFile, logMessage + '\n');
        } catch (error) {
            console.warn('Failed to write log:', error.message);
        }
    }

    /**
     * 명령어 실행 (에러 핸들링 포함)
     */
    async executeCommand(command, description) {
        try {
            this.log('INFO', `Starting: ${description}`);
            
            const result = execSync(command, {
                cwd: process.cwd(),
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            this.log('SUCCESS', `Completed: ${description}`);
            return { success: true, output: result.trim() };
            
        } catch (error) {
            this.log('ERROR', `Failed: ${description} - ${error.message}`);
            return { 
                success: false, 
                error: error.message,
                code: error.status 
            };
        }
    }

    /**
     * 프로젝트 상태 체크 실행
     */
    async runProjectStatusCheck() {
        this.log('INFO', '=== Project Status Check ===');
        
        const result = await this.executeCommand(
            'node mcp-memory-updater.js',
            'Project status check'
        );
        
        return result;
    }

    /**
     * 클로드 메모리 백업 실행
     */
    async runClaudeMemoryBackup() {
        this.log('INFO', '=== Claude Memory Backup ===');
        
        const result = await this.executeCommand(
            'node lib/memory-backup.js',
            'Claude memory backup'
        );
        
        return result;
    }

    /**
     * Git 상태 확인
     */
    async checkGitStatus() {
        this.log('INFO', '=== Git Status Check ===');
        
        const result = await this.executeCommand(
            'git status --porcelain',
            'Git status check'
        );
        
        if (result.success) {
            const hasChanges = result.output.trim().length > 0;
            this.log('INFO', hasChanges ? 'Git has changes' : 'Git is clean');
        }
        
        return result;
    }

    /**
     * 시스템 정보 수집
     */
    getSystemInfo() {
        try {
            const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
            const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
            const workingDir = process.cwd();
            
            return {
                nodeVersion,
                gitVersion,
                workingDir,
                platform: process.platform,
                arch: process.arch
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * 백업 통계 생성
     */
    generateBackupStats(projectResult, claudeResult, gitResult) {
        const endTime = new Date();
        const duration = endTime - this.startTime;
        
        const stats = {
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: `${Math.round(duration / 1000)}s`,
            results: {
                project: projectResult.success ? 'SUCCESS' : 'FAILED',
                claude: claudeResult.success ? 'SUCCESS' : 'FAILED',
                git: gitResult.success ? 'SUCCESS' : 'FAILED'
            },
            systemInfo: this.getSystemInfo()
        };
        
        // 상세 통계 로그에 저장
        const statsFile = path.join(this.logDir, 'backup-stats.json');
        try {
            // 기존 통계 읽기
            let allStats = [];
            if (fs.existsSync(statsFile)) {
                const existing = fs.readFileSync(statsFile, 'utf8');
                allStats = JSON.parse(existing);
            }
            
            // 새 통계 추가 (최근 50개만 유지)
            allStats.push(stats);
            if (allStats.length > 50) {
                allStats = allStats.slice(-50);
            }
            
            fs.writeFileSync(statsFile, JSON.stringify(allStats, null, 2));
            
        } catch (error) {
            this.log('WARN', `Failed to save stats: ${error.message}`);
        }
        
        return stats;
    }

    /**
     * 통합 백업 실행
     */
    async run() {
        try {
            this.log('INFO', '🚀 Starting Integrated Memory Backup System');
            this.log('INFO', `Working directory: ${process.cwd()}`);
            
            // 1. 프로젝트 상태 체크
            const projectResult = await this.runProjectStatusCheck();
            
            // 2. 클로드 메모리 백업
            const claudeResult = await this.runClaudeMemoryBackup();
            
            // 3. Git 상태 확인
            const gitResult = await this.checkGitStatus();
            
            // 4. 통계 생성
            const stats = this.generateBackupStats(projectResult, claudeResult, gitResult);
            
            // 5. 최종 결과 출력
            this.log('INFO', '📊 Backup Summary:');
            this.log('INFO', `  Project Status: ${stats.results.project}`);
            this.log('INFO', `  Claude Memory: ${stats.results.claude}`);
            this.log('INFO', `  Git Status: ${stats.results.git}`);
            this.log('INFO', `  Duration: ${stats.duration}`);
            
            const allSuccess = projectResult.success && claudeResult.success && gitResult.success;
            
            if (allSuccess) {
                this.log('SUCCESS', '✅ All backup operations completed successfully');
                return { success: true, stats };
            } else {
                this.log('WARN', '⚠️ Some backup operations failed - check logs for details');
                return { success: false, stats };
            }
            
        } catch (error) {
            this.log('ERROR', `Integrated backup failed: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

// 실행
if (require.main === module) {
    const runner = new IntegratedBackupRunner();
    
    runner.run().then(result => {
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

module.exports = IntegratedBackupRunner;