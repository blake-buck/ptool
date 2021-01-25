module.exports = function(schemas){
    const {tableName, capitalizedTableName} = schemas;
    return `
    const express = require('express');
    const router = express.Router();

    const dependencyInjector = require('../dependency-injector.js');
    const ${tableName}Controller = dependencyInjector.inject('${tableName}Controller');

    router.get('/${tableName}', ${tableName}Controller.get${capitalizedTableName}s);
    router.get('/${tableName}/:id', ${tableName}Controller.getSpecific${capitalizedTableName});

    router.post('/${tableName}', ${tableName}Controller.post${capitalizedTableName});

    router.put('/${tableName}', ${tableName}Controller.update${capitalizedTableName}s);
    router.put('/${tableName}/:id', ${tableName}Controller.updateSpecific${capitalizedTableName});
    
    router.patch('/${tableName}', ${tableName}Controller.patch${capitalizedTableName}s);
    router.patch('/${tableName}/:id', ${tableName}Controller.patchSpecific${capitalizedTableName});

    router.delete('/${tableName}', ${tableName}Controller.delete${capitalizedTableName}s);
    router.delete('/${tableName}/:id', ${tableName}Controller.deleteSpecific${capitalizedTableName});

    module.exports = router;
    `
}