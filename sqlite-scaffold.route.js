module.exports = function(tableName, capitalizedTableName){
    return `
    const express = require('express');
    const router = express.Router();

    const {
        get${capitalizedTableName}s,
        getSpecific${capitalizedTableName},
        post${capitalizedTableName},
        update${capitalizedTableName}s,
        updateSpecific${capitalizedTableName},
        delete${capitalizedTableName}s,
        deleteSpecific${capitalizedTableName}
    } = require('../controllers/${tableName}');

    router.get('/${tableName}', get${capitalizedTableName}s);
    router.get('/${tableName}/:id', getSpecific${capitalizedTableName});

    router.post('/${tableName}', post${capitalizedTableName});

    router.put('/${tableName}', update${capitalizedTableName}s);
    router.put('/${tableName}/:id', updateSpecific${capitalizedTableName});

    router.delete('/${tableName}', delete${capitalizedTableName}s);
    router.delete('/${tableName}/:id', deleteSpecific${capitalizedTableName});

    module.exports = router;
    `
}