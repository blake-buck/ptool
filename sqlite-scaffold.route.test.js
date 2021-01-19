module.exports = function(
    tableName, 
    tableSchema, 
    insertExampleRecord,
    jsExampleRecordObjectMinusId,
    jsExampleRecordObjectUpdated
){
    return `
    const ${tableName}Router = require('./${tableName}');

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

    describe('${tableName} controller tests ', () => {

        it('GET - /${tableName}', async (done) => {
            request(app)
                .get('/${tableName}')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
                    expect(res.body).toBeTruthy();
                    done();
                });
        });

        it('POST - /${tableName}', async (done) => {
            request(app)
                .post('/${tableName}')
                .set('Accept', 'application/json')
                .send(${jsExampleRecordObjectMinusId})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
    
                    expect(res.body).toBeTruthy();
    
                    done();
                });
        });

        it('PUT - /${tableName}', async (done) => {
            request(app)
                .put('/${tableName}')
                .set('Accept', 'application/json')
                .send([${jsExampleRecordObjectUpdated}])
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
    
                    expect(res.body).toBeTruthy();
    
                    done();
                });
        });

        it('DELETE - /${tableName}', async (done) => {
            request(app)
                .delete('/${tableName}')
                .set('Accept', 'application/json')
                .send([1,2])
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
    
                    expect(res.body).toBeTruthy();
    
                    done();
                });
        });
    

    
        it('GET - /${tableName}/:id', async (done) => {
            request(app)
                .get('/${tableName}/1')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
    
                    expect(res.body).toBeTruthy();
    
                    done();
                });
        });

        it('PUT - /${tableName}/:id', async (done) => {
            request(app)
                .put('/${tableName}/1')
                .set('Accept', 'application/json')
                .send(${jsExampleRecordObjectUpdated})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
    
                    expect(res.body).toBeTruthy();
    
                    done();
                });
        });

        it('DELETE - /${tableName}/:id', async (done) => {
            request(app)
                .delete('/${tableName}/1')
                .set('Accept', 'application/json')
                .send({})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(async (err, res) => {
                    if(err){
                        console.error(err);
                        console.log(res.error)
                        done();
                    }
    
                    expect(res.body).toBeTruthy();
    
                    done();
                });
        });
    
    })
    `
}
