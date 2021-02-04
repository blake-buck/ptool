// ${tableName}
// ${capitalizedTableName}
// ${tableSchema}
// ${exampleInsertRecord}
// ${jsExampleRecordObject} id:1
// ${jsExampleRecordObjectUpdated}
// ${jsExampleRecordObjectMinusId}
// ${commaSeparatedList}

module.exports = function(schemas){
    const {
        tableName, 
        capitalizedTableName, 
        commaSeparatedList, 
        tableSchema, 
        exampleInsertRecord,
        jsExampleRecordObjectMinusId,
        jsExampleRecordObjectUpdated,
        jsExampleRecordObject
    } = schemas;
    let patchSpecificExampleRecordObjectUpdated = {...jsExampleRecordObjectUpdated};
    delete patchSpecificExampleRecordObjectUpdated.id;

    return `
    const dependencyInjector = require('../dependency-injector.js');
    dependencyInjector.register('${tableName}Model', () => ({
        get${capitalizedTableName}s: () => [{id: 1}, {id: 2}],
        getSpecific${capitalizedTableName}: () => ({id: 1}),
        post${capitalizedTableName}: () => ({id: 1}),
        update${capitalizedTableName}s: () => true,
        updateSpecific${capitalizedTableName}: () => true,
        patch${capitalizedTableName}s: () => true,
        patchSpecific${capitalizedTableName}: () => true,
        delete${capitalizedTableName}s : () => true,
        deleteSpecific${capitalizedTableName}: () => true
    }));
    const ${tableName}Services = require('./${tableName}');


    describe('${tableName} service tests', () => {
        it('get${capitalizedTableName}s should return status 200 and two records', async (done) => {
            let response = await ${tableName}Services.get${capitalizedTableName}s({value: {limit:10, offset: 0, fields:'${commaSeparatedList}'}});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.length).toBe(2);

            done();
        });

        it('getSpecific${capitalizedTableName} should return status 200 and a singular record', async (done) => {
            let response = await ${tableName}Services.getSpecific${capitalizedTableName}(1,'${commaSeparatedList}');
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.id).toBe(1);

            done();
        });

        it('post${capitalizedTableName} should return status 200 and an object with an id', async (done) => {
            let response = await ${tableName}Services.post${capitalizedTableName}(${JSON.stringify(jsExampleRecordObjectMinusId)});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.id).toBeTruthy();

            done();
        });

        it('update${capitalizedTableName}s should return status 200 and a body with a message property', async (done) => {
            let response = await ${tableName}Services.update${capitalizedTableName}s([${JSON.stringify(jsExampleRecordObjectUpdated)}]);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            done();
        });

        it('updateSpecific${capitalizedTableName} should return status 200 and a body with a message property', async (done) => {
            let response = await ${tableName}Services.updateSpecific${capitalizedTableName}(${JSON.stringify(jsExampleRecordObjectUpdated)});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            done();
        });

        it('patch${capitalizedTableName}s should return status 200 and a body with a message property', async (done) => {
            let response = await ${tableName}Services.patch${capitalizedTableName}s([${JSON.stringify(jsExampleRecordObjectUpdated)}]);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            done();
        });

        it('patchSpecific${capitalizedTableName} should return status 200 and a body with a message property', async (done) => {
            let response = await ${tableName}Services.patchSpecific${capitalizedTableName}(1, ${JSON.stringify(patchSpecificExampleRecordObjectUpdated)});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            done();
        });

        it('delete${capitalizedTableName}s return status 200 and a body with a message property', async (done) => {
            let response = await ${tableName}Services.delete${capitalizedTableName}s([1, 2]);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            done();
        });

        it('deleteSpecific${capitalizedTableName} return status 200 and a body with a message property', async (done) => {
            let response = await ${tableName}Services.deleteSpecific${capitalizedTableName}(1);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            done();
        })
    })
    `
}

