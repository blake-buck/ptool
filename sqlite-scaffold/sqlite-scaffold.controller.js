module.exports = function(schemas){
    const {tableName, capitalizedTableName, commaSeparatedList, joiSchema, joiSchemaWithoutId} = schemas;
    const patchSpecificSchema = {...joiSchema};
    delete patchSpecificSchema.id;

    let joiSchemaWithDisplay = JSON.stringify(joiSchema).replace(/\"/g, '');
    let joiSchemaWithoutIdDisplay = JSON.stringify(joiSchemaWithoutId).replace(/\"/g, '');

    let batchPatchDisplay=JSON.stringify(joiSchema).replace(/\"/g, '').replace(/\.required\(\)/g, '').replace(/id:Joi\.number\(\).integer\(\)/, 'id:Joi.number().integer().required()');
    let batchSpecific = JSON.stringify(patchSpecificSchema).replace(/\"/g, '').replace(/\.required\(\)/g, '');

    return `
    const controllerWrapper = require('./controllerWrapper.js');
    const Joi = require('joi');

    const dependencyInjector = require('../dependency-injector.js');
    const ${tableName}Service = dependencyInjector.inject('${tableName}Service');

    const specificParametersSchema = Joi.object({
        id: Joi.number().integer().required()
    })

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
        const headerValidation = specificParametersSchema.validate(request.params);
        if(headerValidation.error){
            throw new Error(headerValidation.error);
        }
        const validationResult = getSpecific${capitalizedTableName}Schema.validate(request.query);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const fieldData = validationResult.value.fields;

        const result = await ${tableName}Service.getSpecific${capitalizedTableName}(request.params.id, fieldData);
        return response.status(result.status).json(result.body);
    }

    const post${capitalizedTableName}Schema = Joi.object(${joiSchemaWithoutIdDisplay})
    async function post${capitalizedTableName}(request, response){
        const validationResult = post${capitalizedTableName}Schema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.post${capitalizedTableName}(request.body);
        return response.status(result.status).json(result.body);
    }

    const update${capitalizedTableName}sSchema = Joi.array().items(${joiSchemaWithDisplay}) 
    async function update${capitalizedTableName}s(request, response){
        const validationResult = update${capitalizedTableName}sSchema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.update${capitalizedTableName}s(request.body);
        return response.status(result.status).json(result.body);
    }

    const updateSpecific${capitalizedTableName}Schema = Joi.object(${joiSchemaWithDisplay})
    async function updateSpecific${capitalizedTableName}(request, response){
        const headerValidation = specificParametersSchema.validate(request.params);
        if(headerValidation.error){
            throw new Error(headerValidation.error);
        }

        const validationResult = updateSpecific${capitalizedTableName}Schema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.updateSpecific${capitalizedTableName}(request.body);
        return response.status(result.status).json(result.body);
    }

    const patch${capitalizedTableName}sSchema = Joi.array().items(${batchPatchDisplay}) 
    async function patch${capitalizedTableName}s(request, response){
        const validationResult = patch${capitalizedTableName}sSchema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.patch${capitalizedTableName}s(request.body);
        return response.status(result.status).json(result.body);
    }

    const patchSpecific${capitalizedTableName}Schema = Joi.object(${batchSpecific})
    async function patchSpecific${capitalizedTableName}(request, response){
        const headerValidation = specificParametersSchema.validate(request.params);
        if(headerValidation.error){
            throw new Error(headerValidation.error);
        }

        const validationResult = patchSpecific${capitalizedTableName}Schema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.patchSpecific${capitalizedTableName}(request.params.id, request.body);
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

    async function deleteSpecific${capitalizedTableName}(request, response){
        const headerValidation = specificParametersSchema.validate(request.params);
        if(headerValidation.error){
            throw new Error(headerValidation.error);
        }

        const result = await ${tableName}Service.deleteSpecific${capitalizedTableName}(headerValidation.value.id);
        return response.status(result.status).json(result.body);
    }

    module.exports = {
        get${capitalizedTableName}s: controllerWrapper(get${capitalizedTableName}s),
        getSpecific${capitalizedTableName}: controllerWrapper(getSpecific${capitalizedTableName}),
        post${capitalizedTableName}: controllerWrapper(post${capitalizedTableName}),
        update${capitalizedTableName}s: controllerWrapper(update${capitalizedTableName}s),
        updateSpecific${capitalizedTableName}: controllerWrapper(updateSpecific${capitalizedTableName}),
        patch${capitalizedTableName}s: controllerWrapper(patch${capitalizedTableName}s),
        patchSpecific${capitalizedTableName}: controllerWrapper(patchSpecific${capitalizedTableName}),
        delete${capitalizedTableName}s: controllerWrapper(delete${capitalizedTableName}s),
        deleteSpecific${capitalizedTableName}: controllerWrapper(deleteSpecific${capitalizedTableName})
    }
    `
}