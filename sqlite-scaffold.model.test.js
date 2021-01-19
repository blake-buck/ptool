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
    const ${tableName}Models = require('./${tableName}');
    const {initializeSqlite, sqlite} = require('../initialization');

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

    describe('${tableName} model tests ', () => {
        it('get${capitalizedTableName} should return two records', async (done) => {
            let records = await ${tableName}Models.get${capitalizedTableName}s({limit:10, offset: 0}, '${commaSeperatedList}');
            expect(records.length).toBe(2);

            done();
        });

        it('getSpecific${capitalizedTableName} should return a singular record', async (done) => {
            let record = await ${tableName}Models.getSpecific${capitalizedTableName}(1, '${commaSeperatedList}');
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

            sqlite.db.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${JSON.stringify(jsExampleRecordObject)});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })

        });

        it('updateSpecific${capitalizedTableName} should update a specific record', async (done) => {
            let result = await ${tableName}Models.updateSpecific${capitalizedTableName}(${JSON.stringify(jsExampleRecordObject)});
            expect(result).toBeTruthy();

            sqlite.db.get('SELECT * FROM ${tableName} WHERE id=1', (err, row) => {
                const oldRecord = JSON.stringify(${JSON.stringify(jsExampleRecordObject)});
                const updatedRecord = JSON.stringify(row);

                expect(oldRecord === updatedRecord).toBe(false);
                done();
            })
        });

        it('delete${capitalizedTableName}s should delete records', async (done) => {
            let result = await ${tableName}Models.delete${capitalizedTableName}s([1, 2]);
            expect(result).toBeTruthy();

            sqlite.db.all('SELECT * FROM ${tableName}', (err, result) => {
                expect(result.length).toBe(0);
                done();
            })
        });

        it('deleteSpecific${capitalizedTableName} should delete a specific record', async (done) => {
            let result = await ${tableName}Models.deleteSpecific${capitalizedTableName}(1);
            expect(result).toBeTruthy();

            sqlite.db.all('SELECT * FROM ${tableName}', (err, result) => {
                expect(result.length).toBe(1);
                done();
            })
        })

    });
    `
}

