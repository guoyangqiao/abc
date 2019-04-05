const bot = require('./bot').wechatyBot;
const botContext = require('./bot').botContext;
const http = require('http');

http.createServer((request, response) => {
    const {headers, method, url} = request;
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.on('error', (err) => {
            console.error(err);
        });
        let respBody = {};
        let area = url.toString().split('/');
        if (area.length > 2 && area[1].toUpperCase() === 'LIFECYCLE') {
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
        }
        response.end(JSON.stringify(respBody));
    });
}).listen(3000);