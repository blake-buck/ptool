const fs = require('fs').promises;
const existsSync = require('fs').existsSync;
const modifyInitializationFile = require('./utils/modify-initialization-file');
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
- any remaining files+directories are written to root
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

    const dependencyInjectionDirectories = {
        'models':'model',
        'services':'service',
        'controllers':'controller'
    }
    
    moduleDirectories.forEach(async (directoryName) => {
        const directoryPath = `${modulePath}/${directoryName}`;
        const directoryExists = existsSync(directoryPath);

    

        if(directoryExists){
            const files = await fs.readdir(directoryPath, 'utf8');
            
            if(dependencyInjectionDirectories[directoryName]){
                const nonTestFiles = files.filter(name => !name.includes('.test.'));
                for(let i =0; i< nonTestFiles.length; i++){
                    const nonTestFileName = nonTestFiles[i];
                    await modifyInitializationFile(installationPath, dependencyInjectionDirectories[directoryName], nonTestFileName.replace('.js', ''))
                }
            }

            for(let i=0; i<files.length; i++){
                const fileName = files[i];
                const filePath = `${directoryName}/${fileName}`;

                await fs.writeFile(
                    `${installationPath}/${filePath}`,
                    await fs.readFile(`${modulePath}/${filePath}`, 'utf8')
                );
            }
        }
    });
}

 async function addBarrelFileEntries(installationPath, modulePath){
    const middlewareExists = existsSync(`${modulePath}/middleware`);

    if(middlewareExists){
        const middlewareFiles = await fs.readdir(`${modulePath}/middleware`);
        const nonTestMiddlewareFiles = middlewareFiles.filter(fileName => !fileName.includes('.test.'));

        let middlewareBarrelFileContents = await fs.readFile(`${installationPath}/middleware/middleware.js`, 'utf8')
        nonTestMiddlewareFiles.forEach((fileName) => {
            middlewareBarrelFileContents = middlewareBarrelFileContents.replace(
                'module.exports = {',
                `module.exports = {\n\t${fileName.replace('.js', '')}: require("./${fileName}"),`
            );
        });

        await fs.writeFile(`${installationPath}/middleware/middleware.js`, middlewareBarrelFileContents);
    }
    
    const routeFiles = await fs.readdir(`${modulePath}/routes`);
    const nonTestRouteFiles = routeFiles.filter(fileName => !fileName.includes('.test.'));

    let routeBarrelFileContents = await fs.readFile(`${installationPath}/routes/initializeRoutes.js`, 'utf8');
    nonTestRouteFiles.forEach((fileName) => {
        routeBarrelFileContents = `\nconst ${fileName.replace('.js','')}Router = require("./${fileName}");\n` + routeBarrelFileContents;
        routeBarrelFileContents = routeBarrelFileContents.replace(
            'function initializeRoutes(app){',
            `function initializeRoutes(app){\n\tapp.use(routePrefix, ${fileName.replace('.js','')}Router);\n`
        );
    });

    await fs.writeFile(`${installationPath}/routes/initializeRoutes.js`, routeBarrelFileContents);
}

 async function addOpenApiSpecificationContent(installationPath, modulePath){
    const rawBaseInstallSpecification = await fs.readFile(`${installationPath}/open-api-specification.json`, 'utf8');
    const rawModuleSpecification = await fs.readFile(`${modulePath}/open-api-specification.json`, 'utf8')
    let baseInstallSpecification = JSON.parse(rawBaseInstallSpecification);
    let moduleSpecification = JSON.parse(rawModuleSpecification);
    
    baseInstallSpecification.paths = {...baseInstallSpecification.paths, ...moduleSpecification.paths};
    baseInstallSpecification.components.responses = {
        ...baseInstallSpecification.components.responses,
        ...moduleSpecification.components.responses
    }
    baseInstallSpecification.components.schemas = {
        ...baseInstallSpecification.components.schemas,
        ...moduleSpecification.components.schemas
    }
    
    if(moduleSpecification.components.securitySchemes){
        baseInstallSpecification.components.securitySchemes = {
            ...baseInstallSpecification.components.securitySchemes,
            ...moduleSpecification.components.securitySchemes
        }
    }
    

    
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
    const rawEnvironmentVariables = await fs.readFile(`${modulePath}/environment-variables.json`, 'utf8')
    const environmentVariables = JSON.parse(rawEnvironmentVariables);
    
    let dotEnvContents = await fs.readFile(`${installationPath}/.env`, 'utf8');
    environmentVariables.forEach((envVar) => {
        dotEnvContents += `\n${envVar}=`;
    });
    await fs.writeFile(`${installationPath}/.env`, dotEnvContents);
    
    let configJsContents = await fs.readFile(`${installationPath}/config.js`, 'utf8');
    let configJsContentToAdd = environmentVariables
        .map((envVar) => `\t${envVar}: process.env.${envVar},`)
        .join('\n');

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
    const rootFiles = rootDirectoryContents.filter(dirent => dirent.includes('.'));
    const rootDirectories = rootDirectoryContents.filter(dirent => !dirent.includes('.'))
    console.log(rootDirectoryContents)
    rootFiles.forEach(async (file) => {
        await fs.writeFile(`${installationPath}/${file}`, await fs.readFile(`${modulePath}/${file}`, 'utf8'));
    });

    rootDirectories.forEach(readWriteDirectory)

    async function readWriteDirectory(dirName){
        if(!existsSync(`${installationPath}/${dirName}`)){
            await fs.mkdir(`${installationPath}/${dirName}`);
        }   
        
        const directoryContents = await fs.readdir(`${modulePath}/${dirName}`);
        directoryContents.forEach(async (file) => {
            await fs.writeFile(`${installationPath}/${dirName}/${file}`, await fs.readFile(`${modulePath}/${dirName}/${file}`, 'utf8'));
        })
    }
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



if(process.argv.length < 3){
    console.log('You must include a module name when using this script e.g. sqlite, cognito');
}
else{
    run(
        process.cwd(),
        'C:/Users/Blake/projects/ptool-modules/' + process.argv[2]
    );
}

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
})