const fs = require('fs').promises;

run();

async function run(){
    if(process.argv.length < 3){
        return console.log('Must include module name when invoking this script')
    }
    const moduleName=process.argv[2];
    const moduleDirectories = [
        'routes',
        'controllers',
        'services',
        'models'
    ];
    await fs.mkdir(`${process.cwd()}/${moduleName}`);
    for(let i=0; i<moduleDirectories.length; i++){
        await fs.mkdir(`${process.cwd()}/${moduleName}/${moduleDirectories[i]}`);
        await fs.writeFile(`${process.cwd()}/${moduleName}/${moduleDirectories[i]}/${moduleName}.js`, '');
        await fs.writeFile(`${process.cwd()}/${moduleName}/${moduleDirectories[i]}/${moduleName}.test.js`, '');
    }

    const rootFiles = [
        'dependencies.json',
        'open-api-specification.json',
        'environment-variables.json',
        'initialization.js',
        'post-install-instructions.txt'
    ];
    for(let i=0; i<rootFiles.length; i++){
        await fs.writeFile(`${process.cwd()}/${moduleName}/${rootFiles[i]}`, '');
    }


    await fs.writeFile(`${process.cwd()}/${moduleName}/dependencies.json`, '{"dependencies":{}, "devDependecies":{}}');
    await fs.writeFile(`${process.cwd()}/${moduleName}/environment-variables.json`, '[]');
    await fs.writeFile(`${process.cwd()}/${moduleName}/open-api-specification.json`, '{"paths":{}, "components":{"responses":{}, "schemas":{}}}');
    
}