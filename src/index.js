import { Entity } from "./schema/entity";
import * as arraySchema from './schema/arraySchema';
import * as objectSchema from './schema/objectSchema';
import { emptyObject } from "./util"

export const schema = {
    Entity,
};

const walk = (data, entity, topEntities) => {
    if (typeof data !== 'object' || !data) {
        return data;
    }
    if (verify(data, entity)) {
        const isArray = Array.isArray(data);
        const schema = isArray ? entity[0] : entity;

        const result = isArray
        ? data.map((item) => {
            return item[schema.key];
        })
        : data[schema.key];

        const entityName = schema.name;

        if (!topEntities[entityName]) {
            topEntities[entityName] = emptyObject();
        }

        if(isArray){
            arraySchema.normalize(data, schema, topEntities, walk);
        } else {
            objectSchema.normalize(data, schema, topEntities, walk);
        }
        
        return result;
    }
};

export const normalize = (data, entity) => {

    const entities = emptyObject();

    const result = walk(data, entity, entities, entities);

    return {
        result,
        entities
    }
};

export const denormalize = (normalizedData, entity, entities) => {
    
};



const verify = (data, entity) => {
    const dataIsArray = Array.isArray(data);
    const schemaIsArray = Array.isArray(entity);

    if (dataIsArray && !schemaIsArray) {
        throw new TypeError(`params [entity] should be a 'Array'`);
    }
    if (!dataIsArray && schemaIsArray) {
        throw new TypeError(`params [entity] should be a 'Object'`);
    }

    return true;
}

// 1. 传入一个实体，判断实体类型（Object ? Array ?)
// 2. 根据实体遍历数据，获取对应实体列表
// 3. 遍历过程中，修改原始数据，将对应的实体数据替换为key
// 4. 如何避免对原数据的修改
