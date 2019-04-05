const bot = require('./bot').wechatyBot;
const botContext = require('./bot').botContext;
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
            response.end(JSON.stringify(respBody));
        } else {
            console.log("index.html");
            response.writeHead(200, {'Content-Type': 'text/html'});
            let readStream = fs.createReadStream("index.html", "UTF-8");
            readStream.pipe(response);
        }
    });
}).listen(3000);