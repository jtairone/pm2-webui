#!/usr/bin/env node

const config = require('./config')
const { setEnvDataSync } = require('./utils/env.util')
const { generateRandomString } = require('./utils/random.util')
const path = require('path');
const serve = require('koa-static');
const render = require('koa-ejs');
const { koaBody } = require('koa-body');
const session = require('koa-session').default;;
const Koa = require('koa');
const router = require("./routes");
const { initializeDatabase } = require('./config/database');
const os = require('os')

// Novas dependências para WebSocket
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./sockets'); 

// Init Application

if(!config.APP_SESSION_SECRET){
    const randomString = generateRandomString()
    setEnvDataSync(config.APP_DIR, { APP_SESSION_SECRET: randomString})
    config.APP_SESSION_SECRET = randomString
}

// Create App Instance
const app = new Koa();

// App Settings
app.proxy = true;
app.keys = [config.APP_SESSION_SECRET];

// Middlewares
app.use(session(app));
app.use(koaBody());
app.use(serve(path.join(__dirname, 'public')));
app.use(router.routes());

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'base',
    viewExt: 'html',
    cache: false,
    debug: false
});

// Cria o servidor HTTP para o Socket.io
const httpServer = createServer(app.callback());
const io = new Server(httpServer);

// Configura o Socket.io
io.on('connection', (socket) => {
    //console.log('Novo cliente conectado:', socket.id);

    // Envia os dados do PM2 assim que conecta
    socketHandler.emitPm2Status(socket);
    
    // Atualiza a cada 3 segundos (envia o status de cada aplicação para atualizar!)
    const interval = setInterval(() => {
        socketHandler.emitPm2Status(socket);
    }, 3000);

    // Limpa o intervalo ao desconectar
    socket.on('disconnect', () => {
        clearInterval(interval);
        //console.log('Cliente desconectado:', socket.id);
    });
});

function getLocalExternalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            return iface.address;
        }
        }
    }
    return 'localhost';
}

initializeDatabase().then(() => {
    httpServer.listen(config.PORT, ()=>{
        const ip = getLocalExternalIP();
        console.log(`Aplicação PM2-WebUi Rodando em http://${ip}:${config.PORT}`)
    });
})