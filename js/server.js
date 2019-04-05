const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const http = require('http');
const fs = require('fs');

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
            switch (event.toUpperCase()) {
                case 'SCAN':
                    if (!bot.logonoff()) {
                        respBody.qrCode = botContext.qrCode;
                    } else {
                        respBody.qrCode = '';
                    }
                    break;
                default:
            }
            let chunk = JSON.stringify(respBody);
            response.end(chunk);
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