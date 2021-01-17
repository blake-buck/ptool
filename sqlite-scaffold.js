// Parameters: tableName databaseName

// if process.argv < 4, display error message

// Prompt: Is the tableName singular? y/n
// if no, print "To maintain consistency, table names should be singular. Exiting process."

// Build schema 
// Display SQLite column types, foreign keys, etc
//      Primary Key? y/n
//      COLUMN_NAME COLUMN_TYPE
//      type "end" to finish process

// Print out ADD TABLE statement
// write statement to file create-${tableName}-table.sql

// write 
//      model: Add all CRUD functionality
//      service: call model functions
//      controller: create joi verification schemas, call service functionality
//      route: build router
// write to routes.js file

// modify open-api.specification.json

// print finished message to console
const fs = require('fs').promises;

const sqliteToJoi = {
    'INTEGER': 'Joi.number().integer()',
    'REAL': 'Joi.number()',
    'TEXT': 'Joi.string()',
    'BLOB': 'Joi.any()'
}

async function run(){
    if(process.argv.length < 4){
        return console.log(
            `You must include a table name and database name in order to run this script.
            Example: node sqlite-scaffold.js TABLE_NAME DATABASE_NAME`
        );
    }
    const tableName = process.argv[2];
    const databaseName = process.argv[3];

    const isTableNameSingular = prompt('Is the table name you provided singular? Y/N');
    if(isTableNameSingular !== 'Y' && isTableNameSingular !== 'y'){
        return console.log(
            `To maintain consistency, table names should be singular. Exiting script.`
        );
    }

    console.log('# BUILD TABLE SCHEMA #');
    let tableSchema = `CREATE TABLE ${tableName}(`;
    let joiSchema = {}

    const includePrimaryKey = prompt('Would you like to use id as the primary key?');
    if(includePrimaryKey === 'Y' && includePrimaryKey === 'y'){
        tableSchema += `id INTEGER PRIMARY KEY ASC`;
        joiSchema = {
            ...joiSchema,
            id: 'Joi.Number()'
        }
    }

    let userIsAddingColumns = true;
    while(userIsAddingColumns){
        const userInput = prompt(
            `Enter your column name and type in the following format: COLUMN_NAME COLUMN_TYPE
            To quit, type "quit"`
        );

        if(userInput === 'quit'){
            userIsAddingColumns=false;
        }
        else{
            const [columnName, columnType] = userInput.split(' ');
            tableSchema += `, ${columnName} ${columnType}`;
            joiSchema = {
                ...joiSchema,
                [columnName]: sqliteToJoi[columnType]
            }
        }
    }

    tableSchema += ');';

    console.log();
    console.log('Table Schema');
    console.log(tableSchema);
    await fs.writeFile(`${process.argv[0]}/db/create-${tableName}-table.sql`);

}

async function writeModelFile(tableName){
    const insertValues = Object.keys(joiSchema).filter(key => key !== 'id')
    const $prependedInsertValues = insertValues.map(key => '$' + key);

    const keyPairValues = $prependedInsertValues.map((val, i) => `${val}:${insertValues[i]}`).join(', ');
    const updateValues = insertValues.map((val, i) => `${val}=${$prependedInsertValues[i]}`).join(', ');

    const capitalizedTableName = tableName[0].toUppercase() + tableName.slice(1);
    `
    let {sqlite} = require('../initialization');

    function get${capitalizedTableName}s({limit, offset}, fieldData){
        return new Promise((resolve, reject) => {
            sqlite.db.all(
                \`SELECT \${fieldData} FROM ${tableName} LIMIT $limit OFFSET $offset\`, 
                {
                    $limit: limit, 
                    $offset: offset
                }, 
                (err, rows) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(rows)
                }
            )
        })
    }

    function getSpecific${capitalizedTableName}(${tableName}Id, fieldData){
        return new Promise((resolve, reject) => {
            sqlite.db.get(
                \`SELECT \${fieldData} FROM ${tableName} WHERE id=$id\`,
                {
                    $id: ${tableName}Id
                },
                (err, row) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(row);
                }
            );
        });
    }

    function post${capitalizedTableName}({${insertValues.join(',')}}){
        return new Promise((resolve, reject) => {
            sqlite.db.get(
                \`INSERT INTO ${tableName}(${insertValues.join(', ')}) VALUES(${$prependedInsertValues.join(', ')});\`,
                {
                    ${keyPairValues}
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    sqlite.db.get(
                        \`SELECT MAX(id) FROM ${tableName}\`,
                        (err, idData) => {
                            if(err){
                                return reject(err);
                            }
                            return resolve({
                                id:idData['MAX(id)'],
                                ${insertValues.join(',')}
                            })
                        }
                    )
                }
            )
        });
    }

    function update${capitalizedTableName}s(${tableName}DataArray){
        return Promise.all(${tableName}DataArray.map(({id, ${insertValues.join(', ')}}) => {
            return new Promise((resolve, reject) => {
                sqlite.db.run(
                    \`UPDATE ${tableName} SET ${updateValues} WHERE id=$id\`,
                    {
                        $id: id,
                        ${keyPairValues}
                    },
                    (err) => {
                        if(err){
                            return reject(err);
                        }
                        return resolve(true);
                    }
                )
            });
        }))
    }

    function updateSpecific${capitalizedTableName}(${tableName}Data){
        return new Promise((resolve, reject) => {
            sqlite.db.run(
                \`UPDATE ${tableName} SET ${updateValues} WHERE id=$id\`,
                {
                    $id:id,
                    ${keyPairValues}
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(true);
                }
            )
        });
    }

    function delete${capitalizedTableName}s(${tableName}IdList){
        return Promise.all(${tableName}IdList.map(id=> {
            return new Promise((resolve, reject) => {
                sqlite.db.run(
                    \`DELETE FROM ${tableName} WHERE id=$id\`,
                    {
                        $id:id
                    },
                    (err) => {
                        if(err){
                            return reject(err);
                        }
                        return resolve(true);
                    }
                )
            });
        }))
    }

    function deleteSpecific${capitalizedTableName}(${tableName}Id){
        return new Promise((resolve, reject) => {
            sqlite.db.run(
                \`DELETE FROM ${tableName} WHERE id=$id\`,
                {
                    $id:${tableName}Id
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(true);
                }
            )
        });
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

async function writeServiceFile(tableName){
    const capitalizedTableName = tableName[0].toUppercase() + tableName.slice(1);
    `
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

async function writeControllerFile(tableName){
    const capitalizedTableName = tableName[0].toUppercase() + tableName.slice(1);
    `
    const controllerWrapper = require('./controllerWrapper.js');
    const Joi = require('joi');

    const ${tableName}Service = require('../services/${tableName}');

    const get${capitalizedTableName}sSchema = Joi.object({
        limit: Joi.number().default(10),
        offset: Joi.number().default(0),
        fields: Joi.string().pattern(/^[\w+,*]+$/i).default('id,description')
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
        fields: Joi.string().pattern(/^[\w+,*]+$/i).default('id,description')
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

    const post${capitalizedTableName}Schema = Joi.object({
        description: Joi.string(),
        status: Joi.number()
    })
    async function post${capitalizedTableName}(request, response){
        const validationResult = post${capitalizedTableName}Schema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.post${capitalizedTableName}(request.body);
        return response.status(result.status).json(result.body);
    }

    const update${capitalizedTableName}sSchema = Joi.array().items({
        id: Joi.number(),
        description: Joi.string(),
        status: Joi.number()
    }) 
    async function update${capitalizedTableName}s(request, response){
        const validationResult = update${capitalizedTableName}sSchema.validate(request.body);
        if(validationResult.error){
            throw new Error(validationResult.error);
        }

        const result = await ${tableName}Service.update${capitalizedTableName}s(request.body);
        return response.status(result.status).json(result.body);
    }

    const updateSpecific${capitalizedTableName}Schema = Joi.object({
        id: Joi.number(),
        description: Joi.string(),
        status: Joi.number()
    })
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

async function writeRouteFile(tableName){
    const capitalizedTableName = tableName[0].toUppercase() + tableName.slice(1);
    `
    const express = require('express');
    const router = express.Router();

    const {
        get${capitalizedTableName}s,
        getSpecific${capitalizedTableName},
        post${capitalizedTableName},
        update${capitalizedTableName}s,
        updateSpecific${capitalizedTableName},
        delete${capitalizedTableName}s,
        deleteSpecific${capitalizedTableName}
    } = require('../controllers/${tableName}');

    router.get('/${tableName}', get${capitalizedTableName}s);
    router.get('/${tableName}/:id', getSpecific${capitalizedTableName});

    router.post('/${tableName}', post${capitalizedTableName});

    router.put('/${tableName}', update${capitalizedTableName}s);
    router.put('/${tableName}/:id', updateSpecific${capitalizedTableName});

    router.delete('/${tableName}', delete${capitalizedTableName}s);
    router.delete('/${tableName}/:id', deleteSpecific${capitalizedTableName});

    module.exports = router;
    `
}

async function modifyOpenApiSpec(tableName){
    `
    {
        "/${tableName}":{
            get:{
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{

                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post:{
                "requestBody":{
                    "application/json":{
                        "schema":{
                            "type":"object",
                            "properties":{

                            }
                        }
                    }
                },
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            },
            put:{
                "requestBody":{
                    "application/json":{
                        "schema":{
                            "type":"object",
                            "properties":{

                            }
                        }
                    }
                },
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            },
            delete:{
                "requestBody":{
                    "application/json":{
                        "schema":{
                            "type":"object",
                            "properties":{

                            }
                        }
                    }
                },
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/${tableName}/:id":{
            get:{
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            },
            put:{
                "requestBody":{
                    "application/json":{
                        "schema":{
                            "type":"object",
                            "properties":{

                            }
                        }
                    }
                },
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            },
            delete:{
                "requestBody":{
                    "application/json":{
                        "schema":{
                            "type":"object",
                            "properties":{

                            }
                        }
                    }
                },
                "responses":{
                    "200":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "400":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    },
                    "500":{
                        "content":{
                            "application/json":{
                                "schema":{
                                    "type":"object",
                                    "properties":{
                                        
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    `
}

run();