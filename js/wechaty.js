const {Wechaty} = require('wechaty');
const wechaty = new Wechaty();
const botContext = {qrCode: '', messageQueue: []};

function onScan(qrcode, status) {
    let qrCode = ['http://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode),].join('');
    console.log(qrCode);
    botContext.qrCode = qrCode;
}

function onLogin(user) {
    console.log(`${user} login`)
}

function onLogout(user) {
    console.log(`${user} logout`)
}

function onMessage(message) {
    botContext.messageQueue.push(message.text());
    console.log("12312", botContext);
}

wechaty.on('scan', onScan);
wechaty.on('login', onLogin);
wechaty.on('logout', onLogout);


wechaty.on('message', onMessage);

wechaty.start()
    .then(() => console.log('Starter Bot Started.'))
    .catch(e => console.error(e));


module.exports = {
    wechatyBot: wechaty,
    botContext: botContext
};