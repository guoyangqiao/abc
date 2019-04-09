const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const {FileBox} = require('file-box');
const {fs} = require('fs');

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
    let sayContent;
    if (type === 'file') {
        sayContent = FileBox.fromFile('upload/' + "ccc.file");
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
            result = '发送成功';
            await contact.say(sayContent).catch(reason => {
                console.log("发送失败", reason);
                result = reason.toString();
            });
        }
        console.log(`${name}${result}`);
        sendStatistic.push({name: name, alias: alias, result: result});
        await snooze();
    }
    resp.status(200).send(sendStatistic);
});
app.listen(3000);

/**
 * 在发送时休眠随意一段时间
 * @returns {Promise<*>}
 */
async function snooze() {
    let sleepPeriod = getRandomInt(1000) + 200;
    return new Promise(resolve => setTimeout(resolve, sleepPeriod));
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

const stream = fs.createWriteStream(path.resolve(`./send_history.log`), {flags: 'a'});

/**
 * 记录日志
 * @param log
 */
function log(log) {
    stream.write(log);
}