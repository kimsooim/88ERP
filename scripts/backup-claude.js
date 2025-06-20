#!/usr/bin/env node

/**
 * 클로드 메모리 백업 실행 스크립트
 * 독립 실행용 백업 도구
 */

const ClaudeMemoryBackupSystem = require('../lib/memory-backup');

async function main() {
    console.log('=== Claude Memory Backup Script ===');
    console.log(`Started at: ${new Date().toLocaleString()}`);
    
    try {
        const backupSystem = new ClaudeMemoryBackupSystem();
        const result = await backupSystem.runBackup();
        
        if (result.success) {
            console.log('✅ Backup completed successfully');
            console.log(`📁 Backup saved to: ${result.backupPath}`);
            console.log(`📊 Stats:`, result.stats);
        } else {
            console.error('❌ Backup failed:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
    
    console.log(`Finished at: ${new Date().toLocaleString()}`);
}

// 실행
main();