const fs = require('fs').promises;

process.on('unhandledRejection', (reason) => {
    console.log(reason);
    process.exit(1);
})

async function main(){
    const rootFolder = await parseRootJson();
    const parsedArguments = parseCommandLineArgs();

    // runScript isnt an async function but it may return a promise
    const scriptResults = await runScript(parsedArguments);
}


function runScript(parsedArguments){
    const script = require('./' + parsedArguments.mainProcess + '/default.js');
    if(!script || (script && typeof script !== 'function') ){
        throw new Error('Main process script files must export a function');
    };
    return script(parsedArguments.flags, parsedArguments.packages);
}

async function parseRootJson(){
    const fileString = await fs.readFile('./root.json', {encoding: 'utf-8'});
    return JSON.parse(fileString);
}

function parseCommandLineArgs(){
    const arguments = process.argv.slice(2);
    console.log(arguments)
    if(!arguments){
        throw new Error('You must provide arguments to the script.')
    }
    const mainProcess = arguments[0];
    const flags = {};
    const packages = {};
    
    for(let i=1; i<arguments.length;){
        const argument = arguments[i];
        const isFlag = argument[0] === '-';
        if(isFlag){
            if(!arguments[i+1]){
                throw new Error('Flags must be followed by an argument.')
            }
            flags[argument] = arguments[i+1];
            i+=2;
        }
        else{
            packages[argument]=true;
            i++;
        }
    }

    return {
        mainProcess,
        flags,
        packages
    }
}

main();