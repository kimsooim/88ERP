/**
 * 메모리 스키마 검증 유틸리티
 * JSON Schema 기반 메모리 데이터 유효성 검사
 */

const fs = require('fs');
const path = require('path');

class MemorySchemaValidator {
    constructor() {
        this.schemaPath = path.join(__dirname, '../schemas/memory-schema.json');
        this.schema = null;
        this.loadSchema();
    }

    /**
     * JSON 스키마 로드
     */
    loadSchema() {
        try {
            const schemaContent = fs.readFileSync(this.schemaPath, 'utf8');
            this.schema = JSON.parse(schemaContent);
            console.log('✅ Memory schema loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load schema:', error);
            throw new Error(`Schema loading failed: ${error.message}`);
        }
    }

    /**
     * 메모리 데이터 유효성 검사
     */
    validate(data) {
        try {
            // 기본 구조 검사
            this.validateBasicStructure(data);
            
            // 필수 필드 검사
            this.validateRequiredFields(data);
            
            // 데이터 타입 검사
            this.validateDataTypes(data);
            
            // 엔티티 검사
            this.validateEntities(data.entities);
            
            // 관계 검사
            this.validateRelations(data.relations);
            
            // 메타데이터 일관성 검사
            this.validateMetadata(data);
            
            console.log('✅ Schema validation passed');
            return true;
            
        } catch (error) {
            console.error('❌ Schema validation failed:', error);
            throw new Error(`Schema validation failed: ${error.message}`);
        }
    }

    /**
     * 기본 구조 검사
     */
    validateBasicStructure(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Data must be an object');
        }
    }

    /**
     * 필수 필드 검사
     */
    validateRequiredFields(data) {
        const requiredFields = ['timestamp', 'version', 'entities', 'relations', 'metadata'];
        
        for (const field of requiredFields) {
            if (!(field in data)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }

    /**
     * 데이터 타입 검사
     */
    validateDataTypes(data) {
        // timestamp 검사
        if (typeof data.timestamp !== 'string') {
            throw new Error('timestamp must be a string');
        }
        
        // ISO 8601 형식 검사
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
        if (!isoRegex.test(data.timestamp)) {
            throw new Error('timestamp must be in ISO 8601 format');
        }
        
        // version 검사
        if (typeof data.version !== 'string') {
            throw new Error('version must be a string');
        }
        
        const versionRegex = /^\d+\.\d+$/;
        if (!versionRegex.test(data.version)) {
            throw new Error('version must follow pattern X.Y (e.g., 1.0)');
        }
        
        // 배열 타입 검사
        if (!Array.isArray(data.entities)) {
            throw new Error('entities must be an array');
        }
        
        if (!Array.isArray(data.relations)) {
            throw new Error('relations must be an array');
        }
        
        // metadata 검사
        if (!data.metadata || typeof data.metadata !== 'object') {
            throw new Error('metadata must be an object');
        }
    }

    /**
     * 엔티티 유효성 검사
     */
    validateEntities(entities) {
        entities.forEach((entity, index) => {
            if (!entity || typeof entity !== 'object') {
                throw new Error(`Entity at index ${index} must be an object`);
            }
            
            // 필수 필드 검사
            if (!entity.name || typeof entity.name !== 'string') {
                throw new Error(`Entity at index ${index} missing or invalid name`);
            }
            
            if (!entity.entityType || typeof entity.entityType !== 'string') {
                throw new Error(`Entity at index ${index} missing or invalid entityType`);
            }
            
            if (!Array.isArray(entity.observations)) {
                throw new Error(`Entity at index ${index} observations must be an array`);
            }
            
            // observations 배열 내용 검사
            entity.observations.forEach((obs, obsIndex) => {
                if (typeof obs !== 'string') {
                    throw new Error(`Entity ${entity.name} observation at index ${obsIndex} must be a string`);
                }
            });
        });
    }

    /**
     * 관계 유효성 검사
     */
    validateRelations(relations) {
        relations.forEach((relation, index) => {
            if (!relation || typeof relation !== 'object') {
                throw new Error(`Relation at index ${index} must be an object`);
            }
            
            // 필수 필드 검사
            if (!relation.from || typeof relation.from !== 'string') {
                throw new Error(`Relation at index ${index} missing or invalid from`);
            }
            
            if (!relation.to || typeof relation.to !== 'string') {
                throw new Error(`Relation at index ${index} missing or invalid to`);
            }
            
            if (!relation.relationType || typeof relation.relationType !== 'string') {
                throw new Error(`Relation at index ${index} missing or invalid relationType`);
            }
        });
    }

    /**
     * 메타데이터 일관성 검사
     */
    validateMetadata(data) {
        const metadata = data.metadata;
        
        // 필수 메타데이터 필드
        const requiredMetaFields = ['entityCount', 'relationCount', 'extractedBy'];
        for (const field of requiredMetaFields) {
            if (!(field in metadata)) {
                throw new Error(`Missing required metadata field: ${field}`);
            }
        }
        
        // 숫자 타입 검사
        if (typeof metadata.entityCount !== 'number' || metadata.entityCount < 0) {
            throw new Error('entityCount must be a non-negative number');
        }
        
        if (typeof metadata.relationCount !== 'number' || metadata.relationCount < 0) {
            throw new Error('relationCount must be a non-negative number');
        }
        
        // 일관성 검사
        if (metadata.entityCount !== data.entities.length) {
            throw new Error(`entityCount mismatch: metadata says ${metadata.entityCount}, actual ${data.entities.length}`);
        }
        
        if (metadata.relationCount !== data.relations.length) {
            throw new Error(`relationCount mismatch: metadata says ${metadata.relationCount}, actual ${data.relations.length}`);
        }
        
        // extractedBy 검사
        if (typeof metadata.extractedBy !== 'string') {
            throw new Error('extractedBy must be a string');
        }
    }

    /**
     * 스키마 정보 반환
     */
    getSchemaInfo() {
        return {
            version: this.schema?.version || 'unknown',
            title: this.schema?.title || 'Memory Schema',
            description: this.schema?.description || 'No description',
            requiredFields: this.schema?.required || []
        };
    }
}

// 실행 테스트
if (require.main === module) {
    const validator = new MemorySchemaValidator();
    
    // 테스트 데이터
    const testData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        entities: [
            {
                name: 'Test Entity',
                entityType: 'Test',
                observations: ['Test observation 1', 'Test observation 2']
            }
        ],
        relations: [
            {
                from: 'Entity A',
                to: 'Entity B',
                relationType: 'test relationship'
            }
        ],
        metadata: {
            entityCount: 1,
            relationCount: 1,
            extractedBy: 'TestValidator'
        }
    };
    
    console.log('=== Schema Validator Test ===');
    console.log('Schema info:', validator.getSchemaInfo());
    
    try {
        validator.validate(testData);
        console.log('✅ Test data validation passed');
    } catch (error) {
        console.error('❌ Test data validation failed:', error);
    }
}

module.exports = MemorySchemaValidator;