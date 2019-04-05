const {Wechaty} = require('wechaty');
const wechaty = new Wechaty();
const botContext = {};

function onScan(qrcode, status) {
    botContext.qrCode = ['http://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode),].join('');
}

function onLogin(user) {
    console.log(`${user} login`)
}

function onLogout(user) {
    console.log(`${user} logout`)
}

wechaty.on('scan', onScan);
wechaty.on('login', onLogin);
wechaty.on('logout', onLogout);

wechaty.start()
    .then(() => console.log('Starter Bot Started.'))
    .catch(e => console.error(e));


module.exports = {
    wechatyBot: wechaty,
    botContext: botContext
};