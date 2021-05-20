const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 每读取一个换行符，将本行存入str，调用此函数
rl.on('line', (str) => {
    // 基本要求正则表示
    // var regexp = /(0x[a-f0-9]+)|(0[1-7][0-7]*)|(if|then|else|while|do)|([a-zA-Z](?:[a-zA-Z]|\d)*)|(0|(?:[1-9][0-9]*))|(\+|-|\*|\/|>|<|=|\(|\)|;)/g;
    // 附加要求正则表示
    var regexp = /(0(?:x|X)[a-fA-F0-9]+(?:\.[0-9a-fA-F]+){0,1})|(0[0-7]+(?:\.[0-7]+){0,1})|(if|then|else|while|do)|([a-zA-Z](?:[a-zA-Z]|\d)*(?:_|\.(?:[a-zA-Z]|\d)+){0,1})|([0-9]+(?:\.[0-9]+){0,1})|(\+|-|\*|\/|>|<|=|\(|\)|;)/g;

    // 根据正则循环匹配，直到字符串为空，根据匹配到的内容进行不同的输出
    while ((rs = regexp.exec(str)) != null){
        if(rs[1]){
            // 16进制
            // 分为整数部分和小数部分
            let tmp = rs[0].split(".");
            // 整数16进制转为10进制
            let num = parseInt(eval(tmp[0]).toString(10));
            // 若存在小数，将小数转为10进制
            if(tmp.length>1)
                for(var i = 0; i < tmp[1].length; i++)
                    num += parseInt(tmp[1][i],16) / (16 ** (i + 1));
            console.log("INT 16\t",num);
        }else if(rs[2]){
            // 8进制，同16进制
            let tmp = rs[0].split(".");
            let num = parseInt(eval(tmp[0]).toString(10));
            if(tmp.length>1)
                for(var i = 0; i < tmp[1].length; i++)
                    num += parseInt(tmp[1][i],8) / (8 ** (i + 1));
            console.log("INT 8\t",num);
        }else if(rs[3]){
            // 保留关键字，转换为大写输出
            console.log(rs[0].toLocaleUpperCase(),"\t _");
        }else if(rs[4]){
            // 标识符
            console.log("IDN\t",rs[0]);
        }else if(rs[5]){
            // 10进制
            console.log("INT 10\t",rs[0]);
        }else if(rs[6]){
            // 运算符和分隔符
            console.log(rs[0],"\t _");
        }
    }
});