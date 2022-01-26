import { Entity } from "./schema/Entity";
import * as ArraySchema from './schema/ArraySchema';
import * as ObjectSchema from './schema/ObjectSchema';
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

        let result;

        const entityName = schema.name;

        if (entityName && !topEntities[entityName]) {
            topEntities[entityName] = emptyObject();
        }

        if (isArray) {
            result = data.map((item) => item[schema.key]);
            ArraySchema.normalize(data, schema, topEntities, walk);
        } else {
            if (!(schema instanceof Entity)) {
                result = ObjectSchema.normalize(data, schema, topEntities, walk);
            } else {
                result = data[schema.key];
                schema.normalize(data, topEntities, walk);
            }
        }

        return result;
    } else {
        console.warn('[data] and [entity] 类型不一致')
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


export const denormalize = (normalizedData, entity, entities) => {
    if (!normalizedData) {
        return normalizedData;
    }
    return deWalk(normalizedData, entity, entities);


};

const deWalk = (normalizedData, entity, entities) => {
    if (verify(normalizedData, entity)) {

        const isArray = Array.isArray(normalizedData);
        const schema = isArray ? entity[0] : entity;


        if (isArray) {
            return ArraySchema.denormalize(normalizedData, schema, entities, deWalk);
        } else {
            if (!(entity instanceof Entity)) {
                return ObjectSchema.denormalize(normalizedData, schema, entities, deWalk);
            } else {
                const newData = { ...entities[schema.name][normalizedData] };
                schema.denormalize(newData, entities, deWalk);
                return newData;
            }
        }
    } else {
        console.warn('[normalizedData] and [entity] 类型不一致')
    }
};