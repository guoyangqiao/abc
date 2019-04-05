const {Wechaty} = require('wechaty');
const bot = new Wechaty();
const botContext = {};

function onScan(qrcode, status) {
    botContext.qrCode = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode),].join('');
}

function onLogin(user) {
    console.log(`${user} login`)
}

function onLogout(user) {
    console.log(`${user} logout`)
}

bot.on('scan', onScan);
bot.on('login', onLogin);
bot.on('logout', onLogout);

bot.start()
    .then(() => console.log('Starter Bot Started.'))
    .catch(e => console.error(e));


module.exports = {
    wechatyBot: bot,
    botContext: botContext
};