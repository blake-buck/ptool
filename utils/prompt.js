const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const prompt = (question) => {
    return new Promise((resolve, reject) => {
        rl.question(question, (output) => {
            resolve(output);
        })
    })
}
module.exports = prompt;