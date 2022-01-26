import { emptyObject } from '../util'

export const normalize = (data, schema, topEntities, walk) => {
    const newData = { ...data };
    Object.keys(schema).forEach(key => {
        if (newData[key]) {
            newData[key] = walk(newData[key], schema[key], topEntities)
        }
    });
    return newData;
}

export const denormalize = (data, schema, topEntities, deWalk) => {
    const newData = emptyObject();
    Object.keys(data).forEach(key => {
        if (schema[key]) {
            newData[key] = deWalk(data[key], schema[key], topEntities, deWalk);
        } else {
            newData[key] = data[key];
        }
    });
    return newData;
};