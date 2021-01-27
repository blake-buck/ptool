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
    let patchExampleRecordObject = {...jsExampleRecordObjectUpdated};
    delete patchExampleRecordObject.id;
    return `
    const dependencyInjector = require('../dependency-injector.js');
    const {initializeSqlite} = require('../initialization');
    initializeSqlite(':memory:');
    const ${tableName}Models = require('./${tableName}');
    
    beforeEach(async () => {
        await new Promise((resolve, reject) => {
            dependencyInjector.dependencies.sqlite.run('${tableSchema}', (err) => {
            if(err){
                reject(err);
            }
            else{
                dependencyInjector.dependencies.sqlite.run('${exampleInsertRecord}', (err) => {
                    if(err){
                        reject(err);
                    }
                    else{
                        dependencyInjector.dependencies.sqlite.run('${exampleInsertRecord}', (err) => {
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
            dependencyInjector.dependencies.sqlite.run('DROP TABLE ${tableName}', (err) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(true);
                }
            });
        })
    })

    describe('${tableName} model tests ', () => {
        it('get${capitalizedTableName} should return two records', async (done) => {
            let records = await ${tableName}Models.get${capitalizedTableName}s({limit:10, offset: 0}, '${commaSeparatedList}');
            expect(records.length).toBe(2);

            done();
        });

        it('getSpecific${capitalizedTableName} should return a singular record', async (done) => {
            let record = await ${tableName}Models.getSpecific${capitalizedTableName}(1, '${commaSeparatedList}');
            expect(record).toBeTruthy();
            expect(record.id).toBeTruthy();

            done();
        });

        it('post${capitalizedTableName} should return an object with an id', async (done) => {
            let result = await ${tableName}Models.post${capitalizedTableName}(${JSON.stringify(jsExampleRecordObjectMinusId)});
            expect(result).toBeTruthy();
            expect(result.id).toBeTruthy();

            done();
        });

        it('update${capitalizedTableName}s should update records', async (done) => {
            let result = await ${tableName}Models.update${capitalizedTableName}s([${JSON.stringify(jsExampleRecordObjectUpdated)}]);
            expect(result).toBeTruthy();

            dependencyInjector.dependencies.sqlite.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${JSON.stringify(jsExampleRecordObject)});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })

        });

        it('updateSpecific${capitalizedTableName} should update a specific record', async (done) => {
            let result = await ${tableName}Models.updateSpecific${capitalizedTableName}(${JSON.stringify(jsExampleRecordObject)});
            expect(result).toBeTruthy();

            dependencyInjector.dependencies.sqlite.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${JSON.stringify(jsExampleRecordObject)});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })
        });

        it('patch${capitalizedTableName}s should update records', async (done) => {
            let result = await ${tableName}Models.patch${capitalizedTableName}s([${JSON.stringify(jsExampleRecordObjectUpdated)}]);
            expect(result).toBeTruthy();

            dependencyInjector.dependencies.sqlite.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${JSON.stringify(jsExampleRecordObject)});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })

        });

        it('patchSpecific${capitalizedTableName} should update a specific record', async (done) => {
            let result = await ${tableName}Models.patchSpecific${capitalizedTableName}(1, ${JSON.stringify(patchExampleRecordObject)});
            expect(result).toBeTruthy();

            dependencyInjector.dependencies.sqlite.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${JSON.stringify(patchExampleRecordObject)});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })
        });

        it('delete${capitalizedTableName}s should delete records', async (done) => {
            let result = await ${tableName}Models.delete${capitalizedTableName}s([1, 2]);
            expect(result).toBeTruthy();

            dependencyInjector.dependencies.sqlite.all('SELECT * FROM ${tableName}', (err, result) => {
                expect(result.length).toBe(0);
                done();
            })
        });

        it('deleteSpecific${capitalizedTableName} should delete a specific record', async (done) => {
            let result = await ${tableName}Models.deleteSpecific${capitalizedTableName}(1);
            expect(result).toBeTruthy();

            dependencyInjector.dependencies.sqlite.all('SELECT * FROM ${tableName}', (err, result) => {
                expect(result.length).toBe(1);
                done();
            })
        })

    });
    `
}

