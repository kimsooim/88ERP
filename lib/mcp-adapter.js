/**
 * 실제 MCP 환경용 메모리 추출기
 * Claude MCP 도구 직접 호출 버전
 */

class RealMCPMemoryExtractor {
    constructor() {
        this.schemaVersion = '1.0';
    }

    /**
     * 실제 MCP memory:read_graph 호출
     * 클로드 환경에서만 작동
     */
    async extractRealMemoryData() {
        try {
            console.log('Calling MCP memory:read_graph...');
            
            // 실제 MCP 호출 - 클로드 환경에서만 사용 가능
            // 이 코드는 Node.js 환경에서는 작동하지 않음
            
            /*
            실제 클로드 환경에서는 다음과 같이 호출:
            
            const memoryGraph = await memory:read_graph();
            
            const formatted = {
                timestamp: new Date().toISOString(),
                version: this.schemaVersion,
                entities: memoryGraph.entities.map(entity => ({
                    name: entity.name,
                    entityType: entity.entityType,
                    observations: entity.observations
                })),
                relations: memoryGraph.relations.map(relation => ({
                    from: relation.from,
                    to: relation.to,
                    relationType: relation.relationType
                })),
                metadata: {
                    entityCount: memoryGraph.entities.length,
                    relationCount: memoryGraph.relations.length,
                    extractedBy: 'RealMCPMemoryExtractor',
                    extractionMethod: 'MCP memory:read_graph'
                }
            };
            
            return formatted;
            */
            
            // Node.js 환경에서는 에러 반환
            throw new Error('MCP tools not available in Node.js environment. Use in Claude environment only.');
            
        } catch (error) {
            console.error('Real MCP extraction failed:', error);
            throw error;
        }
    }

    /**
     * 실제 MCP memory:search_nodes 호출
     */
    async searchRealMemoryNodes(query) {
        try {
            console.log(`Calling MCP memory:search_nodes with query: ${query}`);
            
            /*
            실제 클로드 환경에서는:
            
            const searchResults = await memory:search_nodes({ query: query });
            
            return {
                query: query,
                timestamp: new Date().toISOString(),
                results: searchResults
            };
            */
            
            throw new Error('MCP tools not available in Node.js environment. Use in Claude environment only.');
            
        } catch (error) {
            console.error('Real MCP search failed:', error);
            throw error;
        }
    }
}

/**
 * 환경 감지 및 적절한 추출기 선택
 */
function createMemoryExtractor() {
    // 클로드 환경 감지 (MCP 도구 사용 가능 여부)
    const isClaudeEnvironment = typeof memory !== 'undefined';
    
    if (isClaudeEnvironment) {
        console.log('Claude environment detected - using real MCP tools');
        return new RealMCPMemoryExtractor();
    } else {
        console.log('Node.js environment detected - using mock extractor');
        const MemoryExtractor = require('./memory-extractor');
        return new MemoryExtractor();
    }
}

module.exports = {
    RealMCPMemoryExtractor,
    createMemoryExtractor
};