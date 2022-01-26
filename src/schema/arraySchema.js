
export const normalize = (data, schema, topEntities, walk) => {
    data.forEach((entityData) => {
        schema.normalize(entityData, topEntities, walk);
    });
}

export const denormalize = () => {

}