const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const http = require('http');
const fs = require('fs');
let async = require('async');

function writeResponse(respBody, response) {
    let chunk = JSON.stringify(respBody);
    response.end(chunk);
}

function codeContactList(response) {
    let aliasPromise = [];
    bot.Contact.findAll().then((clist) => {
        for (let c of clist) {
            if (c.type() === bot.Contact.Type.Personal && c.friend() === true) {
                aliasPromise.push(c.alias().then(r => {
                    return {alias: r, name: c.name()};
                }));
            }
        }
        Promise.all(aliasPromise).then(result => {
            writeResponse(result, response);
        });
    });
}

http.createServer((request, response) => {
    const {headers, method, url} = request;
    let requestBody = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        requestBody.push(chunk);
    }).on('end', () => {
        requestBody = Buffer.concat(requestBody).toString();
        response.on('error', (err) => {
            console.error(err);
        });
        let area = url.toString().split('/');
        if (area.length > 2 && area[1].toUpperCase() === 'LIFECYCLE') {
            let respBody = {};
            response.writeHead(200, {'Content-Type': 'application/json'});
            let event = area[2];
            console.log("获取到数据请求,", url);
            switch (event.toUpperCase()) {
                case 'SCAN':
                    if (!bot.logonoff()) {
                        respBody.qrCode = botContext.qrCode;
                    } else {
                        respBody.qrCode = '';
                    }
                    writeResponse(respBody, response);
                    break;
                case "LOGON":
                    let act = area[3];
                    if ('CONTACT' === act.toUpperCase()) {
                        codeContactList(response);
                    }
                    if ('FILE' === act.toUpperCase()) {
                        console.log("上传文件todo");
                        respBody = "还没做";
                        writeResponse(respBody, response);
                    }
                    break;
                default:

            }
        } else {
            let code = 200;
            let readStream;
            if (url === '/') {
                readStream = fs.readFileSync('index.html', 'UTF-8');
            } else {
                let path = url.toString().substr(1);
                if (fs.existsSync(path)) {
                    readStream = fs.readFileSync(path, 'UTF-8');
                } else {
                    code = 404;
                }
            }
            response.writeHead(code, {'Content-Type': 'text/html'});
            response.end(readStream);
        }
    });
}).listen(3000);