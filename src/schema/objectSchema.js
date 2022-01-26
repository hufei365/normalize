export const normalize = (data, schema, topEntities, walk) => {
    schema.normalize(data, topEntities, walk);
}

export const denormalize = () => {};