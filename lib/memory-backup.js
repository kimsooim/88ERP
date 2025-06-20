/**
 * 클로드 메모리 백업 시스템
 * MCP 메모리 도구를 활용한 자동 백업 및 Git 저장
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MCPMemoryUpdater = require('../mcp-memory-updater');
const { createMemoryExtractor } = require('./mcp-adapter');
const GitManager = require('./git-manager');

class ClaudeMemoryBackupSystem extends MCPMemoryUpdater {
    constructor() {
        super();
        this.backupPath = path.join(__dirname, '../backups/claude-memory');
        this.maxBackups = 100;
        this.schemaVersion = '1.0';
        this.memoryExtractor = createMemoryExtractor();
        this.gitManager = new GitManager();
    }

    /**
     * 클로드 메모리 데이터 추출 (실제 MCP 도구 사용)
     * 이 메서드는 클로드 환경에서 실행될 때 실제 MCP 호출
     */
    async extractClaudeMemory() {
        try {
            console.log('Extracting Claude memory data using MCP tools...');
            
            // 프로덕션 환경에서는 실제 MCP 메모리 도구 사용
            // const memoryGraph = await memory_read_graph();
            
            // 개발 환경에서는 MemoryExtractor 사용
            const memoryData = await this.memoryExtractor.extractMemoryData();
            
            return memoryData;
            
        } catch (error) {
            console.error('Memory extraction failed:', error);
            throw error;
        }
    }

    /**
     * 백업 파일 저장 및 Git 커밋
     */
    async saveBackup(memoryData) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `backup-${timestamp}.json`;
            
            // Git 매니저를 통한 백업 및 커밋
            const result = await this.gitManager.commitBackup(memoryData, filename);
            
            if (result.success) {
                console.log(`✅ Memory backup completed: ${result.filename}`);
                if (result.gitResult && result.gitResult.success) {
                    console.log('✅ Successfully committed and pushed to Git');
                } else if (result.gitResult && result.gitResult.skipped) {
                    console.log('ℹ️ Git commit skipped: No changes detected');
                } else {
                    console.warn('⚠️ Git operations failed, but local backup saved');
                }
            } else {
                console.error('❌ Backup failed:', result.error);
                throw new Error(result.error);
            }
            
            return result.filepath;
            
        } catch (error) {
            console.error('Backup save failed:', error);
            throw error;
        }
    }

    /**
     * 백업 통계 정보 (개선된 버전)
     */
    getBackupStats() {
        try {
            // Git 매니저에서 백업 통계 가져오기
            const gitStats = this.gitManager.getBackupStats();
            
            return {
                ...gitStats,
                maxBackups: this.maxBackups,
                backupPath: this.backupPath
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * 전체 백업 프로세스 실행
     */
    async runBackup() {
        try {
            console.log('Starting Claude memory backup process...');
            
            // 1. 메모리 데이터 추출
            const memoryData = await this.extractClaudeMemory();
            
            // 2. 백업 파일 저장
            const backupPath = await this.saveBackup(memoryData);
            
            // 3. 백업 통계 출력
            const stats = this.getBackupStats();
            console.log('Backup stats:', stats);
            
            return {
                success: true,
                backupPath: backupPath,
                stats: stats
            };
        } catch (error) {
            console.error('Backup process failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// 실행 부분
if (require.main === module) {
    const backupSystem = new ClaudeMemoryBackupSystem();
    backupSystem.runBackup();
}

module.exports = ClaudeMemoryBackupSystem;