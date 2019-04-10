const {Wechaty} = require('wechaty');
const wechaty = Wechaty.instance({profile: 'autoLogin'});
const botContext = {qrCode: ''};

function onScan(qrcode, status) {
    let qrCode = ['http://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode),].join('');
    console.log("服务启动结束, 在浏览器中访问地址 localhost:3000");
    botContext.qrCode = qrCode;
}

function onLogin(user) {
    console.log(`${user} login`);
    console.log(`登录成功, 加载联系人列表`);
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