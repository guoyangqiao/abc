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
    response.set('Content-Type', 'application/json').send({qrCode: !bot.logonoff() ? botContext.qrCode : null});
});

app.get('/lifecycle/logon/contact', (req, response) => {
    bot.Contact.findAll().then((clist) => {
        Promise.all(clist
            .filter(c => c.type() === bot.Contact.Type.Personal)
            .filter(c => c.friend() === true)
            .map(c => c.alias().then(r => {
                    return {alias: r, name: c.name()};
                })
            ))
            .then(result => response.status(200).json(result));
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

