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

    function get${capitalizedTableName}s({limit, offset}, fieldData){
        return new Promise((resolve, reject) => {
            sqlite.all(
                \`SELECT \${fieldData} FROM ${tableName} LIMIT $limit OFFSET $offset\`, 
                {
                    $limit: limit, 
                    $offset: offset
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