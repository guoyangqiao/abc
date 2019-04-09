const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'upload/')
        },
        filename: function (req, file, cb) {
            console.log(file);
            cb(null, file.originalname)
        }
    })
});

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/lifecycle/scan', (req, response) => {
    console.log("加载二维码");
    response.set('Content-Type', 'application/json').send({qrCode: !bot.logonoff() ? botContext.qrCode : null});
});

app.get('/lifecycle/logon/contact', (req, response) => {
    console.log("加载联系人列表");
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

app.post('/lifecycle/logon/message/file', upload.single('recfile'), (req, response) => {
    console.log("上传文件");
    // fs.writeFileSync('.pom.xml', text, 'UTF-8');
    response.status(200).end();
});

app.post('/lifecycle/logon/message/publish', (req, resp) => {
    // type: inputType, content: content, contacts: contacts
    console.log(req.body.type);
    console.log(req.body.content);
    console.log(req.body.contacts);
    resp.status(200).end();
});
app.listen(3000);

