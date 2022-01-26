
export const normalize = (data, schema, topEntities, walk) => {
    data.forEach((entityData) => {
        schema.normalize(entityData, topEntities, walk);
    });
}

export const denormalize = (data, schema, topEntities, deWalk) => {
    const newArray = [];
    data.forEach((item, i) => {
        const newData = { ...topEntities[schema.name][item] };
        schema.denormalize(newData, topEntities, deWalk);
        newArray[i] = newData;
    })
    return newArray;
};