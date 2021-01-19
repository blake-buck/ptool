// ${tableName}
// ${capitalizedTableName}
// ${tableSchema}
// ${insertExampleRecord}
// ${jsExampleRecordObject} id:1
// ${jsExampleRecordObjectUpdated}
// ${jsExampleRecordObjectMinusId}
// ${commaSeperatedList}

module.exports = function(
    tableName, 
    capitalizedTableName, 
    commaSeperatedList, 
    tableSchema, 
    insertExampleRecord,
    jsExampleRecordObjectMinusId,
    jsExampleRecordObjectUpdated,
    jsExampleRecordObject
){
    return `
    const ${tableName}Services = require('./${tableName}');

    beforeEach(async () => {
        initializeSqlite(':memory:');
        await new Promise((resolve, reject) => {
            sqlite.db.run('${tableSchema}', (err) => {
                if(err){
                    reject(err);
                }
                else{
                    sqlite.db.run('${insertExampleRecord}', (err) => {
                        if(err){
                            reject(err);
                        }
                        else{
                            sqlite.db.run('${insertExampleRecord}', (err) => {
                                if(err){
                                    reject(err);
                                }
                                else{
                                    resolve(true);
                                }
                            })
                        }
                    })
                }
            })
        });
    })

    afterEach(async () => {
        await new Promise((resolve, reject) => {
            sqlite.db.run('DROP TABLE ${tableName}', (err) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(true);
                }
            });
        })
    })

    describe('${tableName} service tests', () => {
        it('get${capitalizedTableName}s should return two records', async (done) => {
            let response = await ${tableName}Services.get${capitalizedTableName}s({limit:10, offset: 0}, ${commaSeperatedList});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.length).toBe(2);

            done();
        });

        it('getSpecific${capitalizedTableName} should return a singular record', async (done) => {
            let response = await ${tableName}Services.getSpecific${capitalizedTableName}({1, ${commaSeperatedList});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.id).toBe(1);

            done();
        });

        it('post${capitalizedTableName} should return an object with an id', async (done) => {
            let response = await ${tableName}Services.post${capitalizedTableName}(${jsExampleRecordObjectMinusId});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.id).toBeTruthy();

            done();
        });

        it('update${capitalizedTableName}s should update records', async (done) => {
            let response = await ${tableName}Services.update${capitalizedTableName}s([${jsExampleRecordObjectUpdated}]);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();

            sqlite.db.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${jsExampleRecordObject});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })

        });

        it('updateSpecific${capitalizedTableName} should update a specific record', async (done) => {
            let response = await ${tableName}Services.updateSpecific${capitalizedTableName}(${jsExampleRecordObjectUpdated});
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();
            
            sqlite.db.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${jsExampleRecordObject});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })
        });

        it('delete${capitalizedTableName}s should delete records', async (done) => {
            let response = await ${tableName}Services.delete${capitalizedTableName}s([1, 2]);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();

            sqlite.db.all('SELECT * FROM ${tableName}', (err, result) => {
                expect(result.length).toBe(0);
                done();
            })
        });

        it('deleteSpecific${capitalizedTableName} should delete a specific record', async (done) => {
            let response = await ${tableName}Services.deleteSpecific${capitalizedTableName}(1);
            expect(response.status).toBe(200);
            expect(response.body).toBeTruthy();
            expect(response.body.message).toBeTruthy();

            sqlite.db.all('SELECT * FROM ${tableName}', (err, result) => {
                expect(result.length).toBe(1);
                done();
            })
        })
    })
    `
}

