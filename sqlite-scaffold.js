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
const pipe = require('./utils/pipe');

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

    tableSchema += `id INTEGER PRIMARY KEY ASC`;
    joiSchema.id = 'Joi.Number()';

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
    await fs.writeFile(`${process.argv[0]}/dbs/create-${tableName}-table.sql`);

}

const sqliteModelFile = require('./sqlite-scaffold.model');
async function writeModelFile(tableName){
    const {
        insertValues,
        $prependedInsertValues,
        keyPairValues,
        updateValues,
        capitalizedTableName
    } = createSchemasFromTableName(tableName);
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
async function writeServiceFile(tableName){
    const { capitalizedTableName } = createSchemasFromTableName(tableName);
    await fs.writeFile(
        `${installationPath}/services/${tableName}.js`,
        sqliteServiceFile(tableName, capitalizedTableName)
    )
}

const sqliteControllerFile = require('./sqlite-scaffold.controller');
async function writeControllerFile(tableName){
    const { capitalizedTableName, commaSeparatedList } = createSchemasFromTableName(tableName);
    await fs.writeFile(
        `${installationPath}/controllers/${tableName}.js`,
        sqliteControllerFile(tableName, capitalizedTableName, commaSeparatedList)
    )
}

const sqliteRouteFile = require('./sqlite-scaffold.route');
async function writeRouteFile(tableName){
    const { capitalizedTableName } = createSchemasFromTableName(tableName);
    await fs.writeFile(
        `${installationPath}/routes/${tableName}.js`,
        sqliteRouteFile(tableName, capitalizedTableName)
    )
}

const mergeApiSpecs = require('./utils/merge-api-specs');
async function modifyOpenApiSpec(installationPath, tableName){
    const openApiContents = pipe(
        (contents) => contents.replace('${tableName}', tableName),
        JSON.parse
    )(await fs.readFile('./sqlite-scaffold.openapi.json'));

    const mergedSpecs = pipe(
        () => mergeApiSpecs(installationPath, '', openApiContents),
        JSON.stringify
    )();

    await fs.writeFile(installationPath + '/open-api-specification.json', mergedSpecs);
}

function createSchemasFromTableName(tableName){
    const commaSeparatedList = Object.keys(joiSchema).join(',');
    const joiSchemaWithoutId = {...joiSchema};
    delete joiSchemaWithoutId.id;

    const insertValues = Object.keys(joiSchema).filter(key => key !== 'id')
    const $prependedInsertValues = insertValues.map(key => '$' + key);

    const keyPairValues = $prependedInsertValues.map((val, i) => `${val}:${insertValues[i]}`).join(', ');
    const updateValues = insertValues.map((val, i) => `${val}=${$prependedInsertValues[i]}`).join(', ');

    const capitalizedTableName = tableName[0].toUppercase() + tableName.slice(1);


    return {
        insertValues,
        $prependedInsertValues,
        keyPairValues,
        updateValues,
        capitalizedTableName,
        commaSeparatedList
    }
}

run();