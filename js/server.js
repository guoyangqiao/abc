const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const {FileBox} = require('file-box');

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
    response.status(200).end();
});

app.post('/lifecycle/logon/message/publish', async (req, resp) => {
    let type = req.body.type;
    let content = req.body.content;
    let okContacts = req.body.contacts.filter(x => x.selected === 1);
    let sayContent = null;
    if (type === 'file') {
        sayContent = FileBox.fromFile('upload/' + content);
    }
    if (type === 'words') {
        sayContent = content;
    }
    let sendStatistic = [];
    for (let i = 0; i < okContacts.length; i++) {
        let okContact = okContacts[i];
        let alias = okContact.alias;
        let name = okContact.name;
        let contact;
        if (alias !== null) {
            contact = await bot.Contact.find({alias: alias});
        } else {
            contact = await bot.Contact.find({name: name});
        }
        let result = '';
        if (contact === null || contact.friend() === false) {
            result = `联系人不存在或不是你的好友`;
        } else {
            await contact.say(sayContent);
            result = '发送成功';
        }
        console.log(`${name}${result}`);
        sendStatistic.push({name: name, alias: alias, result: result})
    }
    resp.status(200).end();
});
app.listen(3000);

