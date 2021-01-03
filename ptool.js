const fs = require('fs').promises;

async function main(){
    const rootFolder = await parseRootJson();
    const parsedArguments = parseCommandLineArgs();
    console.log(parsedArguments);
}


function runScript(parsedArguments){
    const script = require(parsedArguments.mainProcess);
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
            if(!argument[i+1]){
                throw new Error('Flags must be followed by an argument.')
            }
            flags[argument] = argument[i+1];
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