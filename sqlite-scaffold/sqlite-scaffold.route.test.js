module.exports = function(schemas){
    const {
        tableName, 
        tableSchema, 
        exampleInsertRecord,
        jsExampleRecordObjectMinusId,
        jsExampleRecordObjectUpdated
    } = schemas;
    return `
    const dependencyInjector = require('../dependency-injector.js');
    const express = require('express');
    const request = require('supertest');

    const {initializeSqlite, initializeStandardMiddleware} = require('../initialization');

    initializeSqlite(':memory:');
    dependencyInjector.register('${tableName}Model', require('../models/${tableName}'));
    dependencyInjector.register('${tableName}Service', require('../services/${tableName}'));
    dependencyInjector.register('${tableName}Controller', require('../controllers/${tableName}'));

    const ${tableName}Router = require('./${tableName}');

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

    describe('${tableName} routes tests ', () => {
        const app = express();
        initializeStandardMiddleware(app);
        app.use(${tableName}Router);


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
                .send(${JSON.stringify(jsExampleRecordObjectMinusId)})
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
                .send([${JSON.stringify(jsExampleRecordObjectUpdated)}])
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

        it('PATCH - /${tableName}', async (done) => {
            request(app)
                .patch('/${tableName}')
                .set('Accept', 'application/json')
                .send([${JSON.stringify(jsExampleRecordObjectUpdated)}])
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
                .send(${JSON.stringify(jsExampleRecordObjectUpdated)})
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

        it('PATCH - /${tableName}/:id', async (done) => {
            request(app)
                .patch('/${tableName}/1')
                .set('Accept', 'application/json')
                .send(${JSON.stringify(jsExampleRecordObjectMinusId)})
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
