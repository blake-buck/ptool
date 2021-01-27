module.exports = function(schemas){
    const {tableName, capitalizedTableName} = schemas;
    return `
    const dependencyInjector = require('../dependency-injector.js');
    const ${tableName}Model = dependencyInjector.inject('${tableName}Model');

    const standardLogger = require('../logger');

    async function get${capitalizedTableName}s(validationResult){
        const paginationData = {limit, offset} = validationResult.value;
        const fieldData = validationResult.value.fields;
        
        const queryObject = {...validationResult.value};
        delete queryObject.limit;
        delete queryObject.offset;
        delete queryObject.fields;

        return {status: 200, body: await ${tableName}Model.get${capitalizedTableName}s(paginationData, fieldData, queryObject)}
    }

    async function getSpecific${capitalizedTableName}(${tableName}Id, fieldData){
        return {status: 200, body: await ${tableName}Model.getSpecific${capitalizedTableName}(${tableName}Id, fieldData)}
    }

    async function post${capitalizedTableName}(${tableName}Data){
        return {status: 200, body: await ${tableName}Model.post${capitalizedTableName}(${tableName}Data)}
    }

    async function update${capitalizedTableName}s(${tableName}DataArray){
        await ${tableName}Model.update${capitalizedTableName}s(${tableName}DataArray)
        return {status: 200, body: {message: '${capitalizedTableName}s updated successfully'}}
    }

    async function updateSpecific${capitalizedTableName}(${tableName}Data){
        await ${tableName}Model.updateSpecific${capitalizedTableName}(${tableName}Data)
        return {status: 200, body: {message: '${capitalizedTableName} updated successfully'}}
    }

    async function patch${capitalizedTableName}s(${tableName}DataArray){
        await ${tableName}Model.patch${capitalizedTableName}s(${tableName}DataArray)
        return {status: 200, body: {message: '${capitalizedTableName}s patched successfully'}}
    }

    async function patchSpecific${capitalizedTableName}(id, ${tableName}Data){
        await ${tableName}Model.patchSpecific${capitalizedTableName}(id, ${tableName}Data)
        return {status: 200, body: {message: '${capitalizedTableName} patched successfully'}}
    }

    async function delete${capitalizedTableName}s(${tableName}IdList){
        await ${tableName}Model.delete${capitalizedTableName}s(${tableName}IdList)
        return {status: 200, body: {message: '${capitalizedTableName}s deleted successfully'}}
    }

    async function deleteSpecific${capitalizedTableName}(${tableName}Id){
        await ${tableName}Model.deleteSpecific${capitalizedTableName}(${tableName}Id)
        return {status: 200, body: {message: '${capitalizedTableName} deleted successfully'}}
    }

    module.exports = {
        get${capitalizedTableName}s,
        getSpecific${capitalizedTableName},
        post${capitalizedTableName},
        update${capitalizedTableName}s,
        updateSpecific${capitalizedTableName},
        patch${capitalizedTableName}s,
        patchSpecific${capitalizedTableName},
        delete${capitalizedTableName}s,
        deleteSpecific${capitalizedTableName}
    }
    `
}