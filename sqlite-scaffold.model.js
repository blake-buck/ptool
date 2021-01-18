module.exports = 
(
    tableName, 
    capitalizedTableName, 
    insertValues, 
    $prependedInsertValues, 
    keyPairValues,
    updateValues
) => {
    return `
    let {sqlite} = require('../initialization');

    function get${capitalizedTableName}s({limit, offset}, fieldData){
        return new Promise((resolve, reject) => {
            sqlite.db.all(
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
            sqlite.db.get(
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
            sqlite.db.get(
                \`INSERT INTO ${tableName}(${insertValues.join(', ')}) VALUES(${$prependedInsertValues.join(', ')});\`,
                {
                    ${keyPairValues}
                },
                (err) => {
                    if(err){
                        return reject(err);
                    }
                    sqlite.db.get(
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
                sqlite.db.run(
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

    function updateSpecific${capitalizedTableName}(${tableName}Data){
        return new Promise((resolve, reject) => {
            sqlite.db.run(
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

    function delete${capitalizedTableName}s(${tableName}IdList){
        return Promise.all(${tableName}IdList.map(id=> {
            return new Promise((resolve, reject) => {
                sqlite.db.run(
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
            sqlite.db.run(
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
        delete${capitalizedTableName}s,
        deleteSpecific${capitalizedTableName}
    }
    `
}