/**
 * Git 자동화 관리 모듈
 * 메모리 백업 파일의 Git 커밋, 푸시, 버전 관리
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitManager {
    constructor() {
        this.repoPath = process.cwd();
        this.backupPath = 'backups/claude-memory';
        this.maxBackups = 100;
        this.retryCount = 3;
        this.retryDelay = 1000; // 1초
    }

    /**
     * Git 명령어 실행 (에러 핸들링 포함)
     */
    async executeGitCommand(command, options = {}) {
        try {
            const result = execSync(command, {
                cwd: this.repoPath,
                encoding: 'utf8',
                stdio: 'pipe',
                ...options
            });
            return { success: true, output: result.trim() };
        } catch (error) {
            return { 
                success: false, 
                error: error.message,
                stderr: error.stderr?.toString() || '',
                code: error.status
            };
        }
    }

    /**
     * Git 상태 확인
     */
    async getGitStatus() {
        const result = await this.executeGitCommand('git status --porcelain');
        
        if (result.success) {
            const changes = result.output.split('\n')
                .filter(line => line.trim())
                .map(line => ({
                    status: line.substring(0, 2),
                    file: line.substring(3)
                }));
                
            return {
                hasChanges: changes.length > 0,
                changes: changes,
                rawOutput: result.output
            };
        }
        
        return { hasChanges: false, changes: [], error: result.error };
    }

    /**
     * 백업 파일을 Git에 추가하고 커밋
     */
    async commitBackup(memoryData, filename) {
        try {
            console.log('Starting Git backup process...');
            
            // 1. 백업 파일 저장
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const actualFilename = filename || `backup-${timestamp}.json`;
            const filepath = path.join(this.backupPath, actualFilename);
            
            // 백업 디렉토리 확인/생성
            const backupDir = path.dirname(filepath);
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            // 파일 저장
            fs.writeFileSync(filepath, JSON.stringify(memoryData, null, 2));
            console.log(`✅ Backup file saved: ${actualFilename}`);
            
            // 2. 오래된 백업 정리
            await this.cleanupOldBackups();
            
            // 3. Git 작업
            const gitResult = await this.performGitOperations(actualFilename, timestamp);
            
            return {
                success: gitResult.success,
                filename: actualFilename,
                filepath: filepath,
                gitResult: gitResult
            };
            
        } catch (error) {
            console.error('❌ Backup commit failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Git 작업 수행 (add, commit, push)
     */
    async performGitOperations(filename, timestamp) {
        try {
            // Git 상태 확인
            const status = await this.getGitStatus();
            console.log(`Git status: ${status.hasChanges ? 'Changes detected' : 'No changes'}`);
            
            // 1. 백업 파일들 추가
            let addResult = await this.executeGitCommand(`git add ${this.backupPath}/`);
            if (!addResult.success) {
                console.warn('⚠️ Git add failed, trying alternative:', addResult.error);
                addResult = await this.executeGitCommand('git add .');
            }
            
            if (!addResult.success) {
                throw new Error(`Git add failed: ${addResult.error}`);
            }
            console.log('✅ Files added to Git');
            
            // 2. 커밋 (변경사항이 있을 때만)
            const commitMessage = `Claude memory backup ${timestamp}`;
            const commitResult = await this.executeGitCommand(`git commit -m "${commitMessage}"`);
            
            if (!commitResult.success) {
                if (commitResult.stderr.includes('nothing to commit')) {
                    console.log('ℹ️ No changes to commit');
                    return { success: true, skipped: true, reason: 'No changes' };
                } else {
                    throw new Error(`Git commit failed: ${commitResult.error}`);
                }
            }
            console.log('✅ Committed to Git:', commitMessage);
            
            // 3. 푸시 (재시도 포함)
            const pushResult = await this.pushWithRetry();
            
            return {
                success: true,
                commit: commitResult.output,
                push: pushResult
            };
            
        } catch (error) {
            console.error('❌ Git operations failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Git 푸시 (재시도 메커니즘 포함)
     */
    async pushWithRetry() {
        for (let i = 0; i < this.retryCount; i++) {
            try {
                const pushResult = await this.executeGitCommand('git push origin main');
                
                if (pushResult.success) {
                    console.log('✅ Pushed to remote repository');
                    return { success: true, attempt: i + 1 };
                } else {
                    console.warn(`⚠️ Push attempt ${i + 1} failed:`, pushResult.error);
                    
                    if (i < this.retryCount - 1) {
                        console.log(`Retrying in ${this.retryDelay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Push attempt ${i + 1} error:`, error.message);
            }
        }
        
        console.warn('⚠️ Push failed after all retries - local backup saved');
        return { 
            success: false, 
            attempts: this.retryCount,
            note: 'Local backup preserved, will retry on next run'
        };
    }

    /**
     * 오래된 백업 파일 정리
     */
    async cleanupOldBackups() {
        try {
            const backupDir = path.resolve(this.backupPath);
            
            if (!fs.existsSync(backupDir)) {
                return { cleaned: 0 };
            }
            
            const files = fs.readdirSync(backupDir)
                .filter(file => file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(backupDir, file),
                    mtime: fs.statSync(path.join(backupDir, file)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime); // 최신순 정렬
            
            if (files.length <= this.maxBackups) {
                return { cleaned: 0, total: files.length };
            }
            
            const filesToDelete = files.slice(this.maxBackups);
            let deletedCount = 0;
            
            for (const file of filesToDelete) {
                try {
                    fs.unlinkSync(file.path);
                    deletedCount++;
                    console.log(`🗑️ Deleted old backup: ${file.name}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to delete ${file.name}:`, error.message);
                }
            }
            
            return { 
                cleaned: deletedCount, 
                total: files.length,
                remaining: files.length - deletedCount
            };
            
        } catch (error) {
            console.error('❌ Backup cleanup failed:', error);
            return { cleaned: 0, error: error.message };
        }
    }

    /**
     * Git 정보 확인
     */
    async getGitInfo() {
        try {
            const branch = await this.executeGitCommand('git branch --show-current');
            const remote = await this.executeGitCommand('git remote get-url origin');
            const lastCommit = await this.executeGitCommand('git log -1 --format="%h - %s (%an, %ar)"');
            
            return {
                branch: branch.success ? branch.output : 'unknown',
                remote: remote.success ? remote.output : 'unknown',
                lastCommit: lastCommit.success ? lastCommit.output : 'unknown',
                workingDirectory: this.repoPath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * 백업 통계
     */
    getBackupStats() {
        try {
            const backupDir = path.resolve(this.backupPath);
            
            if (!fs.existsSync(backupDir)) {
                return { totalBackups: 0, error: 'Backup directory not found' };
            }
            
            const files = fs.readdirSync(backupDir)
                .filter(file => file.endsWith('.json'));
            
            return {
                totalBackups: files.length,
                maxBackups: this.maxBackups,
                backupPath: this.backupPath,
                latestBackup: files.length > 0 ? files[files.length - 1] : null
            };
        } catch (error) {
            return { totalBackups: 0, error: error.message };
        }
    }
}

// 실행 테스트
if (require.main === module) {
    async function test() {
        const gitManager = new GitManager();
        
        console.log('=== Git Manager Test ===');
        
        try {
            // Git 정보 확인
            const gitInfo = await gitManager.getGitInfo();
            console.log('Git info:', gitInfo);
            
            // Git 상태 확인
            const status = await gitManager.getGitStatus();
            console.log('Git status:', status);
            
            // 백업 통계
            const stats = gitManager.getBackupStats();
            console.log('Backup stats:', stats);
            
        } catch (error) {
            console.error('Test failed:', error);
        }
    }
    
    test();
}

module.exports = GitManager;