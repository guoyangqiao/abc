const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/lifecycle/scan', (req, response) => {
    response.writeHead(200, {'Content-Type': 'application/json'});
    if (!bot.logonoff()) {
        response.send(botContext.qrCode);
    } else {
        response.send('');
    }
});
app.get('/lifecycle/logon/contact', (req, response) => {
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
            response.status(200).json(result);
        });
    });
});

app.put('/lifecycle/logon/message/:logonAction', upload.array(), (req, response) => {
    let logonAction = req.params.logonAction;
    if ('FILE' === logonAction.toUpperCase()) {
        console.log("上传文件todo");
        fs.writeFileSync('.pom.xml', req.botContext.content, 'UTF-8');
        response.status(200).end();
    }
    if ('words' === logonAction.toUpperCase()) {
        console.log("发布圣旨");
    }
});
app.listen(3000);

