module.exports = function(tableName, capitalizedTableName){
    return `
    const models = require('../models/${tableName}');
    const standardLogger = require('../logger');

    async function get${capitalizedTableName}s(paginationData, fieldData){
        return {status: 200, body: await models.get${capitalizedTableName}s(paginationData, fieldData)}
    }

    async function getSpecific${capitalizedTableName}(${tableName}Id, fieldData){
        return {status: 200, body: await models.getSpecific${capitalizedTableName}(${tableName}Id, fieldData)}
    }

    async function post${capitalizedTableName}(${tableName}Data){
        return {status: 200, body: await models.post${capitalizedTableName}(${tableName}Data)}
    }

    async function update${capitalizedTableName}s(${tableName}DataArray){
        await models.update${capitalizedTableName}s(${tableName}DataArray)
        return {status: 200, body: {message: '${capitalizedTableName}s updated successfully'}}
    }

    async function updateSpecific${capitalizedTableName}(${tableName}Data){
        await models.updateSpecific${capitalizedTableName}(${tableName}Data)
        return {status: 200, body: {message: '${capitalizedTableName} updated successfully'}}
    }

    async function delete${capitalizedTableName}s(${tableName}IdList){
        await models.delete${capitalizedTableName}s(${tableName}IdList)
        return {status: 200, body: {message: '${capitalizedTableName}s deleted successfully'}}
    }

    async function deleteSpecific${capitalizedTableName}(${tableName}Id){
        await models.deleteSpecific${capitalizedTableName}(${tableName}Id)
        return {status: 200, body: {message: '${capitalizedTableName} deleted successfully'}}
    }

    module.exports = {
        get${capitalizedTableName}s,
        getSpecific${capitalizedTableName},
        post${capitalizedTableName},
        update${capitalizedTableName}s,
        updateSpecific${capitalizedTableName},
        delete${capitalizedTableName}s,
        deleteSpecific${capitalizedTableName}
    }
    `
}