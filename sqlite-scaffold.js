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
    let joiSchema = []

    const includePrimaryKey = prompt('Would you like to use id as the primary key?');
    if(includePrimaryKey === 'Y' && includePrimaryKey === 'y'){
        tableSchema += `id INTEGER PRIMARY KEY ASC`;
        joiSchema.push({id: 'Joi.Number()'})
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
            joiSchema.push({
                [columnName]: sqliteToJoi[columnType]
            })
        }
    }

    tableSchema += ');';

    console.log();
    console.log('Table Schema');
    console.log(tableSchema);
    await fs.writeFile(`${process.argv[0]}/db/create-${tableName}-table.sql`);

}

async function writeModelFile(){

}

async function writeServiceFile(){

}

async function writeControllerFile(){

}

async function writeRouteFile(){

}

async function modifyOpenApiSpec(){
    
}

run();