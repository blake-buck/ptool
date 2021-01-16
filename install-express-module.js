const fs = require('fs').promises;
/*
# Structure of a module
```
- controllers
- middleware
- models
- routes
- services
cognito-cloudformation.json
dependencies.json
environment-variables.json
initialization.js
open-api-specification.json
post-install-instructions.txt
```

# Installing a module
- every file in a directory gets written to its corresponding directory in the base installation
- added middleware & routes get added to their respective barrel files
- the open-api-specification contents get added to the root open-api document
- dependencies.json contents get added to package.json
- environment-variables contents get written to .env and config.js
- initialization contents get added to initialization.js
- any remaining files are written to root
- post-install-instructions.txt is printed to the console
*/

 async function writeDirectoryFilesToBaseInstall(installationPath, modulePath){
    const moduleDirectories = [
        'controllers',
        'middleware',
        'models',
        'routes',
        'services'
    ];
    
    async function writeModuleFilesToBaseInstall(directoryName){
        if(require('fs').existsSync(`${modulePath}/${directoryName}`)){
            const files = await fs.readdir(`${modulePath}/${directoryName}`, 'utf8');
            for(let i=0; i<files.length; i++){
                const fileName = files[i];
                await fs.writeFile(
                    `${installationPath}/${directoryName}/${fileName}`,
                    await fs.readFile(`${modulePath}/${directoryName}/${fileName}`, 'utf8')
                );
            }
        }
    }
    
    moduleDirectories.forEach(writeModuleFilesToBaseInstall);
}

 async function addBarrelFileEntries(installationPath, modulePath){

    const middlewareFiles = (await fs.readdir(`${modulePath}/middleware`)).filter(fileName => !fileName.includes('.test.'));
    let middlewareBarrelFileContents = await fs.readFile(`${installationPath}/middleware/middleware.js`, 'utf8')
    middlewareFiles.forEach(writeToMiddlewareBarrelFile);
    
    async function writeToMiddlewareBarrelFile(fileName){
        middlewareBarrelFileContents = middlewareBarrelFileContents.replace(
            'module.exports = {',
            `module.exports = {\n\t${fileName.replace('.js', '')}: require("./${fileName}"),`
        );
    }
    await fs.writeFile(`${installationPath}/middleware/middleware.js`, middlewareBarrelFileContents);
    
    const routeFiles = (await fs.readdir(`${modulePath}/routes`)).filter(fileName => !fileName.includes('.test.'));
    routeFiles.forEach(writeToRouteBarrelFile);
    
    async function writeToRouteBarrelFile(fileName){
        let fileContents = await fs.readFile(`${installationPath}/routes/routes.js`, 'utf8');
        fileContents = `\nconst ${fileName.replace('.js','')}Router = require("./${fileName}");\n` + fileContents;
        fileContents = fileContents.replace(
            'function initializeRoutes(app){',
            `function initializeRoutes(app){\n\tapp.use(${fileName.replace('.js','')}Router);\n`
        );
        await fs.writeFile(`${installationPath}/routes/routes.js`, fileContents);
    }
    
}

 async function addOpenApiSpecificationContent(installationPath, modulePath){
    let baseInstallSpecification = JSON.parse(await fs.readFile(`${installationPath}/open-api-specification.json`, 'utf8'));
    let moduleSpecification = JSON.parse(await fs.readFile(`${modulePath}/open-api-specification.json`, 'utf8'));
    
    baseInstallSpecification.paths = {...baseInstallSpecification.paths, ...moduleSpecification.paths};
    
    await fs.writeFile(`${installationPath}/open-api-specification.json`, JSON.stringify(baseInstallSpecification));
}

 async function addDependenciesToPacakgeJson(installationPath, modulePath){
    let baseInstallDependencies = JSON.parse(await fs.readFile(`${installationPath}/package.json`, 'utf8'));
    let moduleDependencies = JSON.parse(await fs.readFile(`${modulePath}/dependencies.json`, 'utf8'));
    
    baseInstallDependencies.dependencies = {
        ...baseInstallDependencies.dependencies,
        ...moduleDependencies.dependencies
    }
    baseInstallDependencies.devDependencies = {
        ...baseInstallDependencies.devDependencies,
        ...moduleDependencies.devDependencies
    }
    
    await fs.writeFile(`${installationPath}/package.json`, JSON.stringify(baseInstallDependencies));
}

async function writeConfigurationVariables(installationPath, modulePath){
    const environmentVariables = JSON.parse(await fs.readFile(`${modulePath}/environment-variables.json`, 'utf8'));
    
    let dotEnvContents = await fs.readFile(`${installationPath}/.env`, 'utf8');
    environmentVariables.forEach((envVar) => {
        dotEnvContents += `\n${envVar}=`;
    });
    await fs.writeFile(`${installationPath}/.env`, dotEnvContents);
    
    let configJsContents = await fs.readFile(`${installationPath}/config.js`, 'utf8');
    let configJsContentToAdd = environmentVariables.map((envVar) => `\t${envVar}: process.env.${envVar},`).join('\n');
    await fs.writeFile(
        `${installationPath}/config.js`, 
        configJsContents.replace(
            'module.exports = {',
            `module.exports = {\n${configJsContentToAdd}`
        )
    )
}

async function addInitializationContent(installationPath, modulePath){
    let baseInstallInitializationContents = await fs.readFile(`${installationPath}/initialization.js`, 'utf8');
    let moduleInitializationContents = await fs.readFile(`${modulePath}/initialization.js`, 'utf8');
    
    baseInstallInitializationContents += '\n' + moduleInitializationContents;
    
    await fs.writeFile(`${installationPath}/initialization.js`, baseInstallInitializationContents);
}

async function writeRemainingFilesToRoot(installationPath, modulePath){
    const filesToNotWriteToRoot = {
        'middleware':true,
        'controllers':true,
        'routes':true,
        'models':true,
        'services':true,
        'dependencies.json':true,
        'environment-variables.json':true,
        'initialization.js':true,
        'open-api-specification.json':true,
        'post-install-instructions.txt':true
    }
    
    const rootDirectoryContents = (await fs.readdir(`${modulePath}/`, 'utf8')).filter(dirent => !filesToNotWriteToRoot[dirent]);
    console.log(rootDirectoryContents)
    rootDirectoryContents.forEach(async (file) => {
        await fs.writeFile(`${installationPath}/${file}`, await fs.readFile(`${modulePath}/${file}`, 'utf8'));
    })
}

async function printPostInstallInstructions(installationPath, modulePath){
    console.log(await fs.readFile(`${modulePath}/post-install-instructions.txt`, 'utf8'));
}

async function run(installationPath, modulePath){
    await writeDirectoryFilesToBaseInstall(installationPath, modulePath);
    await addBarrelFileEntries(installationPath, modulePath);
    await addOpenApiSpecificationContent(installationPath, modulePath);
    await addDependenciesToPacakgeJson(installationPath, modulePath);
    await writeConfigurationVariables(installationPath, modulePath);
    await addInitializationContent(installationPath, modulePath);
    await writeRemainingFilesToRoot(installationPath, modulePath);
    await printPostInstallInstructions(installationPath, modulePath);
}

run(
    'C:/Users/Blake/projects/ptool-express-boilerplate',
    'C:/Users/Blake/projects/ptool-modules/firebase_auth'
);

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
})