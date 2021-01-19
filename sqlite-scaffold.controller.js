module.exports = function(tableName, capitalizedTableName, commaSeparatedList, joiSchema, joiSchemaWithoutId){
    return `
    const controllerWrapper = require('./controllerWrapper.js');
    const Joi = require('joi');

    const ${tableName}Service = require('../services/${tableName}');

    const get${capitalizedTableName}sSchema = Joi.object({
        limit: Joi.number().default(10),
        offset: Joi.number().default(0),
        fields: Joi.string().pattern(/^[\\w+,*]+$/i).default('${commaSeparatedList}')
    });
    async function get${capitalizedTableName}s(request, response){
        const validationResult = get${capitalizedTableName}sSchema.validate(request.query);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const paginationData = {limit, offset} = validationResult.value;
        const fieldData = validationResult.value.fields;

        const result = await ${tableName}Service.get${capitalizedTableName}s(paginationData, fieldData);
        return response.status(result.status).json(result.body);
    }

    const getSpecific${capitalizedTableName}Schema = Joi.object({
        fields: Joi.string().pattern(/^[\\w+,*]+$/i).default('${commaSeparatedList}')
    })
    async function getSpecific${capitalizedTableName}(request, response){
        const validationResult = getSpecific${capitalizedTableName}Schema.validate(request.query);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const fieldData = validationResult.value.fields;

        const result = await ${tableName}Service.getSpecific${capitalizedTableName}(request.params.id, fieldData);
        return response.status(result.status).json(result.body);
    }

    const post${capitalizedTableName}Schema = Joi.object(${JSON.stringify(joiSchemaWithoutId).replace(/\"/g, '')})
    async function post${capitalizedTableName}(request, response){
        const validationResult = post${capitalizedTableName}Schema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.post${capitalizedTableName}(request.body);
        return response.status(result.status).json(result.body);
    }

    const update${capitalizedTableName}sSchema = Joi.array().items(${JSON.stringify(joiSchema).replace(/\"/g, '')}) 
    async function update${capitalizedTableName}s(request, response){
        const validationResult = update${capitalizedTableName}sSchema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.update${capitalizedTableName}s(request.body);
        return response.status(result.status).json(result.body);
    }

    const updateSpecific${capitalizedTableName}Schema = Joi.object(${JSON.stringify(joiSchema).replace(/\"/g, '')})
    async function updateSpecific${capitalizedTableName}(request, response){
        const validationResult = updateSpecific${capitalizedTableName}Schema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.updateSpecific${capitalizedTableName}(request.body);
        return response.status(result.status).json(result.body);
    }

    const delete${capitalizedTableName}sSchema = Joi.array().items(Joi.number());
    async function delete${capitalizedTableName}s(request, response){
        const validationResult = delete${capitalizedTableName}sSchema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.delete${capitalizedTableName}s(request.body);
        return response.status(result.status).json(result.body);
    }

    const deleteSpecific${capitalizedTableName}Schema = Joi.object({
        id: Joi.number()
    });
    async function deleteSpecific${capitalizedTableName}(request, response){
        const validationResult = deleteSpecific${capitalizedTableName}Schema.validate(request.params);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.deleteSpecific${capitalizedTableName}(validationResult.value.id);
        return response.status(result.status).json(result.body);
    }

    module.exports = {
        get${capitalizedTableName}s: controllerWrapper(get${capitalizedTableName}s),
        getSpecific${capitalizedTableName}: controllerWrapper(getSpecific${capitalizedTableName}),
        post${capitalizedTableName}: controllerWrapper(post${capitalizedTableName}),
        update${capitalizedTableName}s: controllerWrapper(update${capitalizedTableName}s),
        updateSpecific${capitalizedTableName}: controllerWrapper(updateSpecific${capitalizedTableName}),
        delete${capitalizedTableName}s: controllerWrapper(delete${capitalizedTableName}s),
        deleteSpecific${capitalizedTableName}: controllerWrapper(deleteSpecific${capitalizedTableName})
    }
    `
}