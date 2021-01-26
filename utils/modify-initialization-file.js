const fs = require('fs').promises;

async function modifyInitializationFile(installationPath, layerType, tableName){
    // layer type = what layer of the application it is: model, service, controller, etc
    const capitalizedLayerType = `${layerType[0].toUpperCase()}${layerType.slice(1)}`;
    const pluralLayerType = `${layerType}s`;
    let initializationFileContents = await fs.readFile(`${installationPath}/${pluralLayerType}/initialize${capitalizedLayerType}s.js`, 'utf8');
    initializationFileContents = initializationFileContents.replace('}', `\tdependencyInjector.register('${tableName}${capitalizedLayerType}', require('./${tableName}'));\n}`);
    await fs.writeFile(`${installationPath}/${pluralLayerType}/initialize${capitalizedLayerType}s.js`, initializationFileContents)
}

module.exports = modifyInitializationFile;