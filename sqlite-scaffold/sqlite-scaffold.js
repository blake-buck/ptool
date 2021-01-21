// Parameters: tableName databaseName

// if process.argv < 4, display error message

// await prompt: Is the tableName singular? y/n
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
run();


const fs = require('fs').promises;

const pipe = require('../utils/pipe');
const prompt = require('../utils/prompt');



const sqliteToJoi = {
    'INTEGER': 'Joi.number().integer().required()',
    'REAL': 'Joi.number().required()',
    'TEXT': 'Joi.string().required()',
    'BLOB': 'Joi.any().required()'
}
const sqliteToOpenApi = {
    'INTEGER': 'integer',
    'REAL': 'number',
    'TEXT': 'string',
    'BLOB': 'any'
}

const properValues = {
    'INTEGER': 0,
    'REAL': 0,
    'TEXT': 'string',
    'BLOB': 'any'
}
const improperValues = {
    'INTEGER': 'string',
    'REAL': 'string',
    'TEXT': 0,
    'BLOB': 'any'
}
const currentWorkingDirectory = process.cwd();


async function run(){
    const tableName = await getTableName();

    await checkIfSingularTable();

    const {
        tableSchema,
        joiSchema,
        openApiSchema,
        controllerTest_properValues,
        controllerTest_improperValues
    } = await buildParentSchemas();

    console.log();
    console.log('Table Schema');
    console.log(tableSchema);

    await fs.writeFile(`${currentWorkingDirectory}/dbs/create-${tableName}-table.sql`, tableSchema);


    const schemas = createSchemasFromTableName(
        tableName, 
        joiSchema, 
        controllerTest_properValues, 
        controllerTest_improperValues
    );

    await writeModelFile(currentWorkingDirectory, schemas);
    await writeServiceFile(currentWorkingDirectory, schemas);
    await writeControllerFile(currentWorkingDirectory, schemas);
    await writeRouteFile(currentWorkingDirectory, schemas);

    await writeModelTestFile(schemas);
    await writeServiceTestFile(schemas);
    await writeControllerTestFile(schemas);
    await writeRouteTestFile(schemas);
    
    await modifyOpenApiSpec(currentWorkingDirectory, tableName, openApiSchema);

    console.log(`Scaffolding completed. Be sure to run the CREATE TABLE command in dbs/create-${tableName}-table.sql in your databases.`)
    process.exit();
}





async function checkIfSingularTable(){
    const isTableNameSingular = await prompt('Is the table name you provided singular? Y/N ');
    if(isTableNameSingular !== 'Y' && isTableNameSingular !== 'y'){
        console.log(
            `To maintain consistency, table names should be singular. Exiting script.`
        );
        return process.exit();
    }
    return true
}

async function getTableName(){
    if(process.argv.length < 3){
        console.log(
            `You must include a table name  in order to run this script.
            Example: node sqlite-scaffold.js tableName`
        );
        return process.exit();
    }
    return process.argv[2];
}


async function writeModelFile(installationPath, schemas){
    const sqliteModelFile = require('./sqlite-scaffold.model');

    await fs.writeFile(
        `${installationPath}/models/${schemas.tableName}.js`, 
        sqliteModelFile(schemas)
    )
}

async function writeServiceFile(installationPath, schemas){
    const sqliteServiceFile =require('../sqlite-scaffold.service');

    await fs.writeFile(
        `${installationPath}/services/${schemas.tableName}.js`,
        sqliteServiceFile(schemas)
    )
}

async function writeControllerFile(installationPath, schemas){
    const sqliteControllerFile = require('./sqlite-scaffold.controller');

    await fs.writeFile(
        `${installationPath}/controllers/${schemas.tableName}.js`,
        sqliteControllerFile(schemas)
    )
}

async function writeRouteFile(installationPath, schemas){
    const sqliteRouteFile = require('./sqlite-scaffold.route');

    await fs.writeFile(
        `${installationPath}/routes/${schemas.tableName}.js`,
        sqliteRouteFile(schemas)
    )
}

async function writeModelTestFile(schemas){
    const modelTest = require('./sqlite-scaffold.model.test');

    await fs.writeFile(
        `${process.cwd()}/models/${schemas.tableName}.test.js`,
        modelTest(schemas)
    );
}
async function writeServiceTestFile(schemas){
    const serviceTest = require('./sqlite-scaffold.service.test');

    await fs.writeFile(
        `${process.cwd()}/services/${schemas.tableName}.test.js`,
        serviceTest(schemas)
    );
}
async function writeControllerTestFile(schemas){
    const controllerTest = require('./sqlite-scaffold.controller.test');

    await fs.writeFile(
        `${process.cwd()}/controllers/${schemas.tableName}.test.js`,
        controllerTest(schemas)
    )
}
async function writeRouteTestFile(schemas){
    const routeTest = require('./sqlite-scaffold.route.test');

    await fs.writeFile(
        `${process.cwd()}/routes/${schemas.tableName}.test.js`,
        routeTest(schemas)
    )
}

async function modifyOpenApiSpec(installationPath, tableName, openApiSchema){
    const mergeApiSpecs = require('../utils/merge-api-specs');
    let openApiSchemaMinusId = {...openApiSchema};
    delete openApiSchemaMinusId.id;


    const sqliteScaffoldPath = process.argv[1]
        .split('\\')
        .filter((val) => val !== 'sqlite-scaffold.js')
        .join('/');

    const sqliteOpenApiTemplatePath = `${sqliteScaffoldPath}/sqlite-scaffold.openapi.json`;
    let sqliteOpenApiTemplateContents = await fs.readFile(sqliteOpenApiTemplatePath, 'utf8');

    const openApiContents = pipe(
        (contents) => contents.replace(/\$\{tableName\}/g, tableName),
        (contents) => contents.replace(/\"\$\{schemaProperties\}\"/, JSON.stringify(openApiSchema)),
        (contents) => contents.replace(/\"\$\{schemaPropertiesMinusId\}\"/, JSON.stringify(openApiSchemaMinusId)),
        JSON.parse
    )(sqliteOpenApiTemplateContents);

    const mergedSpecs = JSON.stringify(await mergeApiSpecs(installationPath, null, openApiContents));

    await fs.writeFile(installationPath + '/open-api-specification.json', mergedSpecs);
}

function createSchemasFromTableName(tableName, joiSchema, properValues, controllerTest_improperValues){
    const commaSeparatedList = Object.keys(joiSchema).join(',');
    const joiSchemaWithoutId = {...joiSchema};
    delete joiSchemaWithoutId.id;

    const insertValues = Object.keys(joiSchema).filter(key => key !== 'id')
    const $prependedInsertValues = insertValues.map(key => '$' + key);

    const keyPairValues = $prependedInsertValues.map((val, i) => `${val}:${insertValues[i]}`).join(', ');
    const updateValues = insertValues.map((val, i) => `${val}=${$prependedInsertValues[i]}`).join(', ');

    const capitalizedTableName = tableName[0].toUpperCase() + tableName.slice(1);

    const exampleInsertRecord = `INSERT INTO ${tableName}(${insertValues.join(', ')}) VALUES(${Object.values(properValues).slice(1).map(val => typeof val === 'string' ? JSON.stringify(val) : val).join(', ')});`;

    let jsExampleRecordObject = {...properValues};
    let jsExampleRecordObjectMinusId = {...properValues};
    delete jsExampleRecordObjectMinusId.id;
    
    let jsExampleRecordObjectUpdated = {...properValues};
    for(let key in jsExampleRecordObjectUpdated){
        const val = jsExampleRecordObjectUpdated[key];
        if(typeof val === 'number'){
            jsExampleRecordObject[key] += 1;
        }
        else if(typeof val === 'string'){
            jsExampleRecordObject[key] += 'a';
        }
    }
    
    return {
        insertValues,
        $prependedInsertValues,
        keyPairValues,
        updateValues,
        capitalizedTableName,
        commaSeparatedList,
        joiSchema,
        joiSchemaWithoutId,
        properValues,
        improperValues: controllerTest_improperValues,
        controllerTest_properValues:properValues,
        controllerTest_improperValues,

        exampleInsertRecord,
        jsExampleRecordObject,
        jsExampleRecordObjectMinusId,
        jsExampleRecordObjectUpdated
    }
    
}

async function buildParentSchemas(){
    console.log('# BUILD TABLE SCHEMA #');
    console.log('# Valid Types: INTEGER, REAL, TEXT, BLOB');

    let tableSchema = '';
    let joiSchema = {}
    let openApiSchema = {}
    let controllerTest_properValues = {};
    let controllerTest_improperValues = {};
    

    tableSchema += `id INTEGER PRIMARY KEY ASC`;
    joiSchema.id = 'Joi.number().integer().required()';
    openApiSchema.id = {type: 'integer'}
    controllerTest_properValues.id = 1;
    controllerTest_improperValues.id = 'string';

    while(true){
        const userInput = await prompt(
            `Enter your column name and type in the following format: columnName COLUMN_TYPE
            To quit, type "quit"
            `
        );

        if(userInput === 'quit'){
            break;
        }

        const [columnName, columnType] = userInput.split(' ');
        tableSchema += `, ${columnName} ${columnType}`;
        joiSchema[columnName] = sqliteToJoi[columnType];
        openApiSchema[columnName] = {type: sqliteToOpenApi[columnType]};
        controllerTest_properValues[columnName] = properValues[columnType];
        controllerTest_improperValues[columnName] = improperValues[columnType];
    }

    tableSchema += `CREATE TABLE ${tableName}(${tableSchema});`;

    return {
        tableSchema,
        joiSchema,
        openApiSchema,
        controllerTest_properValues,
        controllerTest_improperValues
    }
}