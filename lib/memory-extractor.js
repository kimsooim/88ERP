/**
 * MCP 메모리 추출 전용 모듈
 * Claude MCP 메모리 도구를 활용한 데이터 추출 및 변환
 */

const fs = require('fs');
const path = require('path');
const MemorySchemaValidator = require('./schema-validator');

class MemoryExtractor {
    constructor() {
        this.schemaVersion = '1.0';
        this.schemaPath = path.join(__dirname, '../schemas/memory-schema.json');
        this.validator = new MemorySchemaValidator();
    }

    /**
     * MCP 메모리 그래프 데이터 추출
     * 실제 환경에서는 memory:read_graph MCP 도구 사용
     */
    async extractMemoryData() {
        try {
            console.log('Extracting memory data using MCP tools...');
            
            // MCP memory:read_graph() 호출 시뮬레이션
            // 실제 환경에서는 MCP 서버를 통해 호출
            const mockMemoryData = await this.getMockMemoryData();
            
            // 데이터 포맷팅
            const formatted = {
                timestamp: new Date().toISOString(),
                version: this.schemaVersion,
                entities: mockMemoryData.entities.map(entity => this.formatEntity(entity)),
                relations: mockMemoryData.relations.map(relation => this.formatRelation(relation)),
                metadata: {
                    entityCount: mockMemoryData.entities.length,
                    relationCount: mockMemoryData.relations.length,
                    extractedBy: 'MemoryExtractor',
                    extractionMethod: 'MCP memory:read_graph'
                }
            };

            // 스키마 유효성 검사
            this.validator.validate(formatted);
            
            console.log(`✅ Memory data extracted: ${formatted.metadata.entityCount} entities, ${formatted.metadata.relationCount} relations`);
            return formatted;

        } catch (error) {
            console.error('❌ Memory extraction failed:', error);
            throw new Error(`Memory extraction failed: ${error.message}`);
        }
    }

    /**
     * 엔티티 데이터 포맷팅
     */
    formatEntity(entity) {
        if (!entity || typeof entity !== 'object') {
            throw new Error('Invalid entity data');
        }

        return {
            name: String(entity.name || ''),
            entityType: String(entity.entityType || 'unknown'),
            observations: Array.isArray(entity.observations) 
                ? entity.observations.map(obs => String(obs))
                : []
        };
    }

    /**
     * 관계 데이터 포맷팅
     */
    formatRelation(relation) {
        if (!relation || typeof relation !== 'object') {
            throw new Error('Invalid relation data');
        }

        return {
            from: String(relation.from || ''),
            to: String(relation.to || ''),
            relationType: String(relation.relationType || 'unknown')
        };
    }

    /**
     * 메모리 스키마 유효성 검사
     */
    async validateMemorySchema(data) {
        try {
            // 기본 구조 검사
            const requiredFields = ['timestamp', 'version', 'entities', 'relations', 'metadata'];
            for (const field of requiredFields) {
                if (!(field in data)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // 데이터 타입 검사
            if (!Array.isArray(data.entities)) {
                throw new Error('Entities must be an array');
            }

            if (!Array.isArray(data.relations)) {
                throw new Error('Relations must be an array');
            }

            // 엔티티 유효성 검사
            data.entities.forEach((entity, index) => {
                if (!entity.name || !entity.entityType || !Array.isArray(entity.observations)) {
                    throw new Error(`Invalid entity at index ${index}`);
                }
            });

            // 관계 유효성 검사
            data.relations.forEach((relation, index) => {
                if (!relation.from || !relation.to || !relation.relationType) {
                    throw new Error(`Invalid relation at index ${index}`);
                }
            });

            // 메타데이터 일치성 검사
            if (data.metadata.entityCount !== data.entities.length) {
                data.metadata.entityCount = data.entities.length;
            }

            if (data.metadata.relationCount !== data.relations.length) {
                data.metadata.relationCount = data.relations.length;
            }

            console.log('✅ Schema validation passed');
            return data;

        } catch (error) {
            console.error('❌ Schema validation failed:', error);
            throw new Error(`Schema validation failed: ${error.message}`);
        }
    }

    /**
     * MCP 도구 시뮬레이션 (개발/테스트용)
     * 실제 환경에서는 제거하고 실제 MCP 호출 사용
     */
    async getMockMemoryData() {
        // 실제 클로드 메모리 구조 시뮬레이션
        return {
            entities: [
                {
                    name: "Ann",
                    entityType: "사용자",
                    observations: [
                        "브랜드 캐릭터 관리 담당",
                        "Windows 환경에서 작업",
                        "NAS 저장소 사용 (ds920)"
                    ]
                },
                {
                    name: "88ERP",
                    entityType: "Project",
                    observations: [
                        "위치: \\\\ds920\\\\web\\\\88ERP",
                        "Notion 연동 기능",
                        "NAS 연동 기능"
                    ]
                }
            ],
            relations: [
                {
                    from: "Ann",
                    to: "88ERP",
                    relationType: "프로젝트 진행"
                }
            ]
        };
    }

    /**
     * 메모리 검색 기능 (MCP memory:search_nodes 활용)
     */
    async searchMemoryNodes(query) {
        try {
            console.log(`Searching memory nodes for: ${query}`);
            
            // 실제 환경에서는 memory:search_nodes MCP 도구 사용
            const memoryData = await this.extractMemoryData();
            
            // 간단한 텍스트 검색 구현
            const matchingEntities = memoryData.entities.filter(entity => {
                const searchText = `${entity.name} ${entity.entityType} ${entity.observations.join(' ')}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            const matchingRelations = memoryData.relations.filter(relation => {
                const searchText = `${relation.from} ${relation.to} ${relation.relationType}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            return {
                query: query,
                timestamp: new Date().toISOString(),
                results: {
                    entities: matchingEntities,
                    relations: matchingRelations,
                    totalMatches: matchingEntities.length + matchingRelations.length
                }
            };

        } catch (error) {
            console.error('Memory search failed:', error);
            throw error;
        }
    }

    /**
     * 메모리 통계 정보
     */
    async getMemoryStats() {
        try {
            const memoryData = await this.extractMemoryData();
            
            // 엔티티 타입별 통계
            const entityTypes = {};
            memoryData.entities.forEach(entity => {
                entityTypes[entity.entityType] = (entityTypes[entity.entityType] || 0) + 1;
            });

            // 관계 타입별 통계
            const relationTypes = {};
            memoryData.relations.forEach(relation => {
                relationTypes[relation.relationType] = (relationTypes[relation.relationType] || 0) + 1;
            });

            return {
                timestamp: new Date().toISOString(),
                totalEntities: memoryData.entities.length,
                totalRelations: memoryData.relations.length,
                entityTypes: entityTypes,
                relationTypes: relationTypes,
                version: memoryData.version
            };

        } catch (error) {
            console.error('Memory stats failed:', error);
            throw error;
        }
    }
}

// 실행 부분
if (require.main === module) {
    async function test() {
        const extractor = new MemoryExtractor();
        
        console.log('=== Memory Extractor Test ===');
        
        try {
            // 메모리 추출 테스트
            const memoryData = await extractor.extractMemoryData();
            console.log('Memory data:', JSON.stringify(memoryData, null, 2));
            
            // 검색 테스트
            const searchResults = await extractor.searchMemoryNodes('Ann');
            console.log('Search results:', searchResults);
            
            // 통계 테스트
            const stats = await extractor.getMemoryStats();
            console.log('Memory stats:', stats);
            
        } catch (error) {
            console.error('Test failed:', error);
        }
    }
    
    test();
}

module.exports = MemoryExtractor;