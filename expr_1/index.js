const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (str) => {
    var regexp = /(0x[a-f0-9]+)|(0[1-7][0-7]*)|(if|then|else|while|do)|([a-zA-Z](?:[a-zA-Z]|\d)*)|(0|(?:[1-9][0-9]*))|(\+|-|\*|\/|>|<|=|\(|\))/g;
    while ((rs = regexp.exec(str)) != null){
        if(rs[1]){
            console.log("INT 16\t",rs[0]);
        }else if(rs[2]){
            console.log("INT 8\t",rs[0]);
        }else if(rs[3]){
            console.log(rs[0].toLocaleUpperCase(),"\t_");
        }else if(rs[4]){
            console.log("IDN\t",rs[0]);
        }else if(rs[5]){
            console.log("INT 10\t",rs[0]);
        }else if(rs[6]){
            console.log(rs[0].toLocaleUpperCase(),"\t_");
        }
    }
});