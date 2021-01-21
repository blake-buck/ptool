const GET_tests = (tableName, capitalizedTableName) => {
    const properLimit = 10;
    const improperLimit = '"string"';
    
    const properOffset = 0;
    const improperOffset = '"string"';

    const properFields = '"string,string"';
    const improperFields = false;

    const properId = 1;
    const improperId = '"string"';

    return `
    it('get${capitalizedTableName}s - improper offset fails validation', () => {
        ${tableName}Controllers.get${capitalizedTableName}s(
            {
                query:{
                    offset: ${improperOffset},
                    limit: ${properLimit},
                    fields: ${properFields}
                }
            },
            mockResponse(),
            mockNext
        );
    })
    it('get${capitalizedTableName}s - improper limit fails validation', () => {
        ${tableName}Controllers.get${capitalizedTableName}s(
            {
                query:{
                    offset: ${properOffset},
                    limit: ${improperLimit},
                    fields: ${properFields}
                }
            },
            mockResponse(),
            mockNext
        );
    })
    it('get${capitalizedTableName}s - improper fields fails validation', () => {
        ${tableName}Controllers.get${capitalizedTableName}s(
            {
                query:{
                    offset: ${properOffset},
                    limit: ${properLimit},
                    fields: ${improperFields}
                }
            },
            mockResponse(),
            mockNext
        );
    })

    it('getSpecific${capitalizedTableName} - improper id fails validation', () => {
        ${tableName}Controllers.get${capitalizedTableName}s(
            {
                query:{
                    fields: ${properFields}
                },
                param:{
                    id: ${improperId}
                }
            },
            mockResponse(),
            mockNext
        );
    })
    it('getSpecific${capitalizedTableName} - improper fields fails validation', () => {
        ${tableName}Controllers.get${capitalizedTableName}s(
            {
                query:{
                    fields: ${improperFields}
                },
                param:{
                    id: ${properId}
                }
            },
            mockResponse(),
            mockNext
        );
    })
`
}

const POST_tests = (tableName, capitalizedTableName, properValues, improperValues) => {
    let postTests = '';
    const recordProperties = Object.keys(properValues);
    for(let i=0; i<recordProperties.length; i++){
        const propertyName = recordProperties[i];
        const improperProperty = typeof improperValues[propertyName] === 'string' ? JSON.stringify(improperValues[propertyName]) : improperValues[propertyName];
        postTests += `
        it('post${capitalizedTableName} - improper ${propertyName} fails validation', () => {
            ${tableName}Controllers.post${capitalizedTableName}(
                {
                    body:{
                        ...properValues,
                        ${propertyName}:${improperProperty}
                    }
                },
                mockResponse(),
                mockNext
            )
        });
        
        `
    }

    return postTests;
}

const PUT_tests = (tableName, capitalizedTableName, properValues, improperValues) => {
    let putTests = '';
    const recordProperties = Object.keys(properValues);
    for(let i=0; i<recordProperties.length; i++){
        const propertyName = recordProperties[i];
        const improperProperty = typeof improperValues[propertyName] === 'string' ? JSON.stringify(improperValues[propertyName]) : improperValues[propertyName];
        putTests += `
        it('update${capitalizedTableName}s - improper ${propertyName} fails validation', () => {
            ${tableName}Controllers.update${capitalizedTableName}s(
                {
                    body:[{
                        ...properValues,
                        ${propertyName}:${improperProperty}
                    }]
                },
                mockResponse(),
                mockNext
            )
        })

        `
    }

    for(let i=0; i<recordProperties.length; i++){
        const propertyName = recordProperties[i];
        const improperProperty = typeof improperValues[propertyName] === 'string' ? JSON.stringify(improperValues[propertyName]) : improperValues[propertyName];
        putTests += `
        it('updateSpecific${capitalizedTableName} - improper ${propertyName} fails validation', () => {
            ${tableName}Controllers.updateSpecific${capitalizedTableName}(
                {
                    body:{
                        ...properValues,
                        ${propertyName}:${improperProperty}
                    }
                },
                mockResponse(),
                mockNext
            )
        })

        `
    }
    
    return putTests
}

const PATCH_tests = (tableName, capitalizedTableName, properValues, improperValues) => {
    let patchTests = '';
    const recordProperties = Object.keys(properValues);
    for(let i=0; i<recordProperties.length; i++){
        const propertyName = recordProperties[i];
        const improperProperty = typeof improperValues[propertyName] === 'string' ? JSON.stringify(improperValues[propertyName]) : improperValues[propertyName];
        patchTests += `
        it('patch${capitalizedTableName}s - improper ${propertyName} fails validation', () => {
            ${tableName}Controllers.patch${capitalizedTableName}s(
                {
                    body:[{
                        ...properValues,
                        ${propertyName}:${improperProperty}
                    }]
                },
                mockResponse(),
                mockNext
            )
        })

        `
    }

    for(let i=0; i<recordProperties.length; i++){
        const propertyName = recordProperties[i];
        const improperProperty = typeof improperValues[propertyName] === 'string' ? JSON.stringify(improperValues[propertyName]) : improperValues[propertyName];
        patchTests += `
        it('patchSpecific${capitalizedTableName} - improper ${propertyName} fails validation', () => {
            ${tableName}Controllers.patchSpecific${capitalizedTableName}(
                {
                    body:{
                        ...patchSpecificProperValues,
                        ${propertyName}:${improperProperty}
                    }
                },
                mockResponse(),
                mockNext
            )
        })

        `
    }
    
    return patchTests
}

const DELETE_tests = (tableName, capitalizedTableName) => `
    it('delete${capitalizedTableName}s - improper request fails validation', () => {
        ${tableName}Controllers.delete${capitalizedTableName}s(
            {
                body:[
                    "string"
                ]
            },
            mockResponse(),
            mockNext
        );
    });

    it('deleteSpecific${capitalizedTableName} - improper id fails validation', () => {
        ${tableName}Controllers.delete${capitalizedTableName}s(
            {
                params:{
                    id:"string"
                }
            },
            mockResponse(),
            mockNext
        );
    });
`

module.exports = function(tableName, capitalizedTableName, properValues, improperValues){
    let patchSpecificProperValues = {...properValues};
    delete patchSpecificProperValues.id;
    return `
        const ${tableName}Controllers = require('./${tableName}');

        const properValues = ${JSON.stringify(properValues)};
        const patchSpecificProperValues = ${JSON.stringify(patchSpecificProperValues)}

        const mockResponse = () => {
            const res = {};
            res.status = (passedInStatus) => {
                res.status = passedInStatus
                return res;
            };
            res.json = (passedInBody) => {
                res.body = passedInBody;
                return res;
            }
        
            return res;
        };
        
        const mockNext = (e) => {
            expect(e).toBeTruthy();
        }

        describe('${tableName} controller tests', () => {
            ${GET_tests(tableName, capitalizedTableName, properValues, improperValues)}
            ${POST_tests(tableName, capitalizedTableName, properValues, improperValues)}
            ${PUT_tests(tableName, capitalizedTableName, properValues, improperValues)}
            ${PATCH_tests(tableName, capitalizedTableName, properValues, improperValues)}
            ${DELETE_tests(tableName, capitalizedTableName, properValues, improperValues)}
        })
    `
}