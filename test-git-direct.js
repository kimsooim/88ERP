const GitManager = require('./lib/git-manager');

async function testDirectCommit() {
    const gitManager = new GitManager();
    
    // 실제 클로드 메모리 구조
    const realMemoryData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        entities: [
            {
                name: 'Ann',
                entityType: '사용자',
                observations: [
                    '브랜드 캐릭터 관리 담당',
                    'Windows 환경에서 작업',
                    'NAS 저장소 사용 (ds920)'
                ]
            },
            {
                name: '클로드_메모리_백업_시스템',
                entityType: '시스템',
                observations: [
                    'MCP 메모리 도구 활용',
                    'Git 자동 커밋 및 푸시',
                    '백업 파일 관리 (최대 100개)',
                    '실시간 메모리 추출'
                ]
            }
        ],
        relations: [
            {
                from: 'Ann',
                to: '클로드_메모리_백업_시스템',
                relationType: '개발'
            }
        ],
        metadata: {
            entityCount: 2,
            relationCount: 1,
            extractedBy: 'DirectGitManagerTest',
            extractionMethod: 'manual test'
        }
    };
    
    console.log('=== Direct Git Manager Test ===');
    
    try {
        const result = await gitManager.commitBackup(realMemoryData, 'direct-test-backup.json');
        console.log('✅ Direct commit result:', result);
        
        // Git 정보 확인
        const gitInfo = await gitManager.getGitInfo();
        console.log('Git info:', gitInfo);
        
    } catch (error) {
        console.error('❌ Direct test failed:', error);
    }
}

testDirectCommit();