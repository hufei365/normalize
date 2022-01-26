
export class Entity {
    constructor(name, entityParams = {}, entityConfig = {}) {
        if (!name) {
            throw ('params [key] can not be empty')
        }

        this.name = name;
        this.entityParams = entityParams; // 定义外键
        this.key = entityConfig.idAttribute || 'id';
    }

    normalize(data, topEntities, walk) {
        const entityName = this.name;
        const schemaEntity = topEntities[entityName];

        const cloneData = { ...data };

        // 嵌套实体的处理
        const entityParams = this.entityParams || {};
        Object.keys(entityParams).forEach((key) => {
            const subEntity = entityParams[key];
            if (cloneData[key]) {
                cloneData[key] = walk(cloneData[key], subEntity, topEntities);
            }
        });
        
        // 当前实体
        schemaEntity[data[this.key]] = cloneData;
    }
}