const {Wechaty} = require('wechaty');
const wechaty = Wechaty.instance({profile: 'autoLogin'});
const botContext = {qrCode: ''};

function onScan(qrcode, status) {
    if (status === 0) {
        console.log("服务启动结束, 在浏览器中访问地址 localhost:3000");
    }
    botContext.qrCode = ['http://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode),].join('');
}

function onLogin(user) {
    console.log(`${user}登录成功, 加载联系人列表`);
}

function onLogout(user) {
    console.log(`${user} 退出登录`)
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