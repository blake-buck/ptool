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


const fs = require('fs').promises;

const pipe = require('./utils/pipe');
const prompt = require('./utils/prompt');

const modelTest = require('./sqlite-scaffold.model.test');
const serviceTest = require('./sqlite-scaffold.service.test');
const controllerTest = require('./sqlite-scaffold.controller.test');
const routeTest = require('./sqlite-scaffold.route.test');

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

async function run(){
    if(process.argv.length < 4){
        return console.log(
            `You must include a table name and database name in order to run this script.
            Example: node sqlite-scaffold.js TABLE_NAME DATABASE_NAME`
        );
    }
    const tableName = process.argv[2];
    const databaseName = process.argv[3];

    const isTableNameSingular = await prompt('Is the table name you provided singular? Y/N');
    if(isTableNameSingular !== 'Y' && isTableNameSingular !== 'y'){
        return console.log(
            `To maintain consistency, table names should be singular. Exiting script.`
        );
    }

    console.log('# BUILD TABLE SCHEMA #');
    console.log('# Valid Types: INTEGER, REAL, TEXT, BLOB')
    let tableSchema = `CREATE TABLE ${tableName}(`;
    let joiSchema = {}
    let openApiSchema = {}
    let controllerTest_properValues = {};
    let controllerTest_improperValues = {};
    

    tableSchema += `id INTEGER PRIMARY KEY ASC`;
    joiSchema.id = 'Joi.number().integer().required()';
    openApiSchema.id = {type: 'integer'}
    controllerTest_properValues.id = 1;
    controllerTest_improperValues.id = 'string';

    let userIsAddingColumns = true;
    while(userIsAddingColumns){
        const userInput = await prompt(
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
            };
            openApiSchema[columnName] = {type: sqliteToOpenApi[columnType]};
            controllerTest_properValues[columnName] = properValues[columnType];
            controllerTest_improperValues[columnName] = improperValues[columnType];
        }
    }

    tableSchema += ');';

    console.log();
    console.log('Table Schema');
    console.log(tableSchema);
    await fs.writeFile(`${process.cwd()}/dbs/create-${tableName}-table.sql`, tableSchema);
    await writeModelFile(process.cwd(), tableName, joiSchema);
    await writeServiceFile(process.cwd(), tableName, joiSchema);
    await writeControllerFile(process.cwd(), tableName, joiSchema);
    await writeRouteFile(process.cwd(), tableName, joiSchema);
    await modifyOpenApiSpec(process.cwd(), tableName, joiSchema, openApiSchema);

    console.log('AHHHHHHHHHHHHHHHHHHHHHH')
    console.log(controllerTest_properValues);
    console.log('AHHHHHHHHHHHHHHHHHHHHHH')

    const {
        insertValues,
        $prependedInsertValues,
        keyPairValues,
        updateValues,
        capitalizedTableName,
        commaSeparatedList,
        joiSchemaWithoutId,
        exampleInsertRecord,
        jsExampleRecordObject,
        jsExampleRecordObjectMinusId,
        jsExampleRecordObjectUpdated
    } = createSchemasFromTableName(tableName, joiSchema, controllerTest_properValues);

    await fs.writeFile(
        `${process.cwd()}/models/${tableName}.test.js`,
        modelTest(
            tableName,
            capitalizedTableName,
            commaSeparatedList,
            tableSchema,
            exampleInsertRecord,
            jsExampleRecordObjectMinusId,
            jsExampleRecordObjectUpdated,
            jsExampleRecordObject
        )
    );

    await fs.writeFile(
        `${process.cwd()}/services/${tableName}.test.js`,
        serviceTest(
            tableName,
            capitalizedTableName,
            commaSeparatedList,
            tableSchema,
            exampleInsertRecord,
            jsExampleRecordObjectMinusId,
            jsExampleRecordObjectUpdated,
            jsExampleRecordObject
        )
    );

    await fs.writeFile(
        `${process.cwd()}/controllers/${tableName}.test.js`,
        controllerTest(
            tableName, 
            capitalizedTableName, 
            controllerTest_properValues, 
            controllerTest_improperValues
        )
    )
    
    await fs.writeFile(
        `${process.cwd()}/routes/${tableName}.test.js`,
        routeTest(
            tableName, 
            tableSchema, 
            exampleInsertRecord, 
            jsExampleRecordObjectMinusId, 
            jsExampleRecordObjectUpdated
        )
    )

    process.exit();
}

const sqliteModelFile = require('./sqlite-scaffold.model');
async function writeModelFile(installationPath, tableName, joiSchema){
    const {
        insertValues,
        $prependedInsertValues,
        keyPairValues,
        updateValues,
        capitalizedTableName
    } = createSchemasFromTableName(tableName, joiSchema);
    await fs.writeFile(
        `${installationPath}/models/${tableName}.js`, 
        sqliteModelFile(
            tableName, 
            capitalizedTableName, 
            insertValues, 
            $prependedInsertValues, 
            keyPairValues,
            updateValues
        )
    )
}

const sqliteServiceFile =require('./sqlite-scaffold.service');
async function writeServiceFile(installationPath, tableName, joiSchema){
    const { capitalizedTableName } = createSchemasFromTableName(tableName, joiSchema);
    await fs.writeFile(
        `${installationPath}/services/${tableName}.js`,
        sqliteServiceFile(tableName, capitalizedTableName)
    )
}

const sqliteControllerFile = require('./sqlite-scaffold.controller');
async function writeControllerFile(installationPath, tableName, joiSchema){
    const { capitalizedTableName, commaSeparatedList, joiSchemaWithoutId } = createSchemasFromTableName(tableName, joiSchema);
    await fs.writeFile(
        `${installationPath}/controllers/${tableName}.js`,
        sqliteControllerFile(tableName, capitalizedTableName, commaSeparatedList, joiSchema, joiSchemaWithoutId)
    )
}

const sqliteRouteFile = require('./sqlite-scaffold.route');
async function writeRouteFile(installationPath, tableName, joiSchema){
    const { capitalizedTableName } = createSchemasFromTableName(tableName, joiSchema);
    await fs.writeFile(
        `${installationPath}/routes/${tableName}.js`,
        sqliteRouteFile(tableName, capitalizedTableName)
    )
}

const mergeApiSpecs = require('./utils/merge-api-specs');
async function modifyOpenApiSpec(installationPath, tableName, joiSchema, openApiSchema){
    let openApiSchemaMinusId = {...openApiSchema};
    delete openApiSchemaMinusId.id;
    const openApiContents = pipe(
        (contents) => contents
                        .replace(/\$\{tableName\}/g, tableName)
                        .replace(/\"\$\{schemaProperties\}\"/, JSON.stringify(openApiSchema))
                        .replace(/\"\$\{schemaPropertiesMinusId\}\"/, JSON.stringify(openApiSchemaMinusId)),
        (contents) => {
            console.log(contents);
            return contents
        },
        JSON.parse

    )(await fs.readFile(process.argv[1].split('\\').filter((val) => val !== 'sqlite-scaffold.js').join('/') + '/sqlite-scaffold.openapi.json', 'utf8'));

    const mergedSpecs = pipe(
        JSON.stringify
    )(await mergeApiSpecs(installationPath, '', openApiContents));

    await fs.writeFile(installationPath + '/open-api-specification.json', mergedSpecs);
}

function createSchemasFromTableName(tableName, joiSchema, properValues){
    const commaSeparatedList = Object.keys(joiSchema).join(',');
    const joiSchemaWithoutId = {...joiSchema};
    delete joiSchemaWithoutId.id;

    const insertValues = Object.keys(joiSchema).filter(key => key !== 'id')
    const $prependedInsertValues = insertValues.map(key => '$' + key);

    const keyPairValues = $prependedInsertValues.map((val, i) => `${val}:${insertValues[i]}`).join(', ');
    const updateValues = insertValues.map((val, i) => `${val}=${$prependedInsertValues[i]}`).join(', ');

    const capitalizedTableName = tableName[0].toUpperCase() + tableName.slice(1);

    if(properValues){
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
            joiSchemaWithoutId,
    
            exampleInsertRecord,
            jsExampleRecordObject,
            jsExampleRecordObjectMinusId,
            jsExampleRecordObjectUpdated
        }
    }
    return {
        insertValues,
        $prependedInsertValues,
        keyPairValues,
        updateValues,
        capitalizedTableName,
        commaSeparatedList,
        joiSchemaWithoutId
    }
    
}

run();