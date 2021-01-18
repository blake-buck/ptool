module.exports = function(installationPath, modulePath, contents){
    let baseInstallSpecification = JSON.parse(await fs.readFile(`${installationPath}/open-api-specification.json`, 'utf8'));
    let moduleSpecification =contents ? contents : JSON.parse(await fs.readFile(`${modulePath}/open-api-specification.json`, 'utf8'));
    
    baseInstallSpecification.paths = {...baseInstallSpecification.paths, ...moduleSpecification.paths};
    baseInstallSpecification.components.responses = {
        ...baseInstallSpecification.components.responses,
        ...moduleSpecification.components.responses
    }
    baseInstallSpecification.components.schemas = {
        ...baseInstallSpecification.components.schemas,
        ...moduleSpecification.components.schemas
    }

    return baseInstallSpecification;
}