const bot = require('./wechaty').wechatyBot;
const botContext = require('./wechaty').botContext;
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const {FileBox} = require('file-box');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const readLastLines = require('read-last-lines');

const endOfLine = require('os').EOL;

//创建文件上传目录
let uploadDir = path.resolve("upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const publishTask = new Set();

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'upload/')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
});

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/lifecycle/scan', (req, response) => {
    response.set('Content-Type', 'application/json').send({qrCode: botContext.qrCode});
});

let logFilePath = path.resolve(`./send_history.log`);
app.get('/lifecycle/logon/log', async (req, response) => {
    const rows = req.query.rows;
    await readLastLines.read(logFilePath, rows).then(cc => {
        let logs = cc.split(endOfLine).reverse();
        response.status(200).send(logs);
    });
});

app.get('/lifecycle/logon/contact', (req, response) => {
    let sync = req.query.sync;
    bot.Contact.findAll().then(async clist => {
        if (sync === 'true') {
            console.log(`需要同步联系人信息${sync}`);
            for (let c of clist) {
                await c.sync();
            }
        }
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

app.get('/lifecycle/logon/message/queueing', async (req, resp) => {
    if (publishTask.has(req.query.requestSession)) {
        await snooze(2000);
        resp.send(true);
    } else {
        resp.send(false);
    }
});
app.post('/lifecycle/logon/message/publish', async (req, resp) => {
    let requestSession = req.query.requestSession;
    publishTask.add(requestSession);
    resp.status(200).end();
    try {
        console.log(`收到发送请求${requestSession}`);
        let type = req.body.type;
        let content = req.body.content;
        let okContacts = req.body.contacts.filter(x => x.selected === 1);
        let sayContent;
        if (type === 'file') {
            sayContent = FileBox.fromFile('upload/' + content);
        }
        if (type === 'words') {
            sayContent = escape(content);
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
            let result;
            if (contact === null || contact.friend() === false) {
                result = `联系人不存在或不是你的好友`;
            } else {
                result = '成功';
                await contact.say(sayContent).catch(reason => {
                    result = "异常," + reason.toString();
                });
            }
            appendLog(`发送<${content}>到<${name}>结果<${result}>`);
            sendStatistic.push({name: name, alias: alias, result: result});
            await snooze();
        }
    } finally {
        console.log(`发送结束${requestSession}`);
        console.log(publishTask);
        publishTask.delete(requestSession);
    }
});
app.listen(3000);

/**
 * 在发送时休眠随意一段时间
 * @returns {Promise<*>}
 */
async function snooze(sp) {
    if (sp === undefined) {
        sp = Math.floor(Math.random() * Math.floor(1000)) + 200;
    }
    return new Promise(resolve => setTimeout(resolve, sp));
}

const stream = fs.createWriteStream(logFilePath, {flags: 'a'});

/**
 * 记录日志
 * @param log
 */
function appendLog(log) {
    let chunk = moment(new Date()).format('YYYY-MM-DD HH:mm:ss') + " " + log;
    console.log("==" + chunk + "====");
    stream.write(chunk + endOfLine);
}

/**
 * ugly code to figure things out
 * @param str
 * @returns {*}
 */
function escape(str) {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quto;');
    str = str.replace(/'/g, '&#39;');
    str = str.replace(/`/g, '&#96;');
    str = str.replace(/\//g, '&#x2F;');
    return str;
}