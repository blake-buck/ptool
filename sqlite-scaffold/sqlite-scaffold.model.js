module.exports = function(schemas){
    const {
        tableName, 
        capitalizedTableName, 
        insertValues, 
        $prependedInsertValues, 
        keyPairValues,
        updateValues } = schemas;
    return `
    const dependencyInjector = require('../dependency-injector.js');
    const sqlite = dependencyInjector.inject('sqlite');

    function buildEscapedQueryValuesObject(queryObj){
        const escapedQueryValues = {};
        let query = '';
        const conversionHashmap = {
            lt: '<',
            gt: '>',
            lte: '<=',
            gte: '>=',
            ne: '!='
        };
        let precursor = 'WHERE';
        let counter = 0;
        for(const outerKey in queryObj){
            const queryValue = queryObj[outerKey];
            
            if(typeof queryValue === 'object'){
                for(const innerKey in queryValue){
    
                    const escapedQueryValue = \`$queryValue\${counter}\`;
    
                    escapedQueryValues[escapedQueryValue] = queryValue[innerKey];
                    
                    if(innerKey === 'in'){
                        query += \` \${precursor} \${outerKey} IN ( \${queryValue[innerKey]} )\`;
                        delete escapedQueryValues[escapedQueryValue];
                        
                    }
                    else if(innerKey=== 'like'){
                        escapedQueryValues[escapedQueryValue] = \`%\${queryValue[innerKey]}%\`;
                        query += \` \${precursor} \${outerKey} LIKE \${escapedQueryValue}\`;
                    }
                    else{
                        query += \` \${precursor} \${outerKey} \${conversionHashmap[innerKey]} \${escapedQueryValue}\`;
                    }
                    counter++;
                    precursor = 'AND'
                }
                
            }
            else{
                const escapedQueryValue = \`$queryValue\${counter}\`;
    
                escapedQueryValues[escapedQueryValue] = queryValue;
                query += \` \${precursor} \${outerKey}=\${escapedQueryValue}\`;
            }
            counter++
            precursor = 'AND'
        }
        return {
            query,
            escapedQueryValues
        }
    }

    function get${capitalizedTableName}s({limit, offset}, fieldData, queryObject){
        const {
            query,
            escapedQueryValues
        } = buildEscapedQueryValuesObject(queryObject);

        return new Promise((resolve, reject) => {
            sqlite.all(
                \`SELECT \${fieldData} FROM ${tableName} \${query} LIMIT $limit OFFSET $offset\`, 
                {
                    $limit: limit, 
                    $offset: offset,
                    ...escapedQueryValues
                }, 
                (err, rows) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(rows)
                }
            )
        })
    }

    function getSpecific${capitalizedTableName}(${tableName}Id, fieldData){
        return new Promise((resolve, reject) => {
            sqlite.get(
                \`SELECT \${fieldData} FROM ${tableName} WHERE id=$id\`,
                {
                    $id: ${tableName}Id
                },
                (err, row) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(row);
                }
            );
        });
    }

    function post${capitalizedTableName}({${insertValues.join(',')}}){
        return new Promise((resolve, reject) => {
            sqlite.get(
                \`INSERT INTO ${tableName}(${insertValues.join(', ')}) VALUES(${$prependedInsertValues.join(', ')});\`,
                {
                    ${keyPairValues}
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    sqlite.get(
                        \`SELECT MAX(id) FROM ${tableName}\`,
                        (err, idData) => {
                            if(err){
                                return reject(err);
                            }
                            return resolve({
                                id:idData['MAX(id)'],
                                ${insertValues.join(',')}
                            })
                        }
                    )
                }
            )
        });
    }

    function update${capitalizedTableName}s(${tableName}DataArray){
        return Promise.all(${tableName}DataArray.map(({id, ${insertValues.join(', ')}}) => {
            return new Promise((resolve, reject) => {
                sqlite.run(
                    \`UPDATE ${tableName} SET ${updateValues} WHERE id=$id\`,
                    {
                        $id: id,
                        ${keyPairValues}
                    },
                    (err) => {
                        if(err){
                            return reject(err);
                        }
                        return resolve(true);
                    }
                )
            });
        }))
    }

    function updateSpecific${capitalizedTableName}({id, ${insertValues.join(', ')}}){
        return new Promise((resolve, reject) => {
            sqlite.run(
                \`UPDATE ${tableName} SET ${updateValues} WHERE id=$id\`,
                {
                    $id:id,
                    ${keyPairValues}
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(true);
                }
            )
        });
    }

    function patch${capitalizedTableName}s(${tableName}DataArray){
        return Promise.all(${tableName}DataArray.map((${tableName}Data) => {
    
            let queryContents = 'SET';
            let queryData = {};
            queryData.$id = ${tableName}Data.id;
            delete ${tableName}Data.id
            for(let key in ${tableName}Data){
                queryContents += \` \${key}=$\${key},\`
                queryData['$' + key] = ${tableName}Data[key];
            }
            queryContents = queryContents.slice(0, queryContents.length - 1);
            queryContents += ' WHERE id=$id';
    
            return new Promise((resolve, reject) => {
                sqlite.run(
                    \`UPDATE ${tableName} \${queryContents}\`,
                    queryData,
                    (err) => {
                        if(err){
                            return reject(err);
                        }
                        return resolve(true);
                    }
                )
            });
        }))
    }
    
    function patchSpecific${capitalizedTableName}(id, ${tableName}Data){
        // description, status
        let queryContents = 'SET';
        let queryData = {};
        queryData.$id = id;
        for(let key in ${tableName}Data){
            queryContents += \` \${key}=$\${key},\`
            queryData['$' + key] = ${tableName}Data[key];
        }
        queryContents = queryContents.slice(0, queryContents.length - 1);
        queryContents += ' WHERE id=$id';
    
        return new Promise((resolve, reject) => {
            sqlite.run(
                \`UPDATE ${tableName} \${queryContents}\`,
                queryData,
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(true);
                }
            )
        });
    }

    function delete${capitalizedTableName}s(${tableName}IdList){
        return Promise.all(${tableName}IdList.map(id=> {
            return new Promise((resolve, reject) => {
                sqlite.run(
                    \`DELETE FROM ${tableName} WHERE id=$id\`,
                    {
                        $id:id
                    },
                    (err) => {
                        if(err){
                            return reject(err);
                        }
                        return resolve(true);
                    }
                )
            });
        }))
    }

    function deleteSpecific${capitalizedTableName}(${tableName}Id){
        return new Promise((resolve, reject) => {
            sqlite.run(
                \`DELETE FROM ${tableName} WHERE id=$id\`,
                {
                    $id:${tableName}Id
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    return resolve(true);
                }
            )
        });
    }

    module.exports = {
        get${capitalizedTableName}s,
        getSpecific${capitalizedTableName},
        post${capitalizedTableName},
        update${capitalizedTableName}s,
        updateSpecific${capitalizedTableName},
        patch${capitalizedTableName}s,
        patchSpecific${capitalizedTableName},
        delete${capitalizedTableName}s,
        deleteSpecific${capitalizedTableName}
    }
    `
}