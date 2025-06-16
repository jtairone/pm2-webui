#!/usr/bin/env node

const config = require('./config')
const { setEnvDataSync } = require('./utils/env.util')
const { generateRandomString } = require('./utils/random.util')
const path = require('path');
const serve = require('koa-static');
const render = require('koa-ejs');
const { koaBody } = require('koa-body');
//const session = require('koa-session');
const session = require('koa-session').default;;
const Koa = require('koa');
const router = require("./routes");

// Novas dependências para WebSocket
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./sockets'); 

// Init Application

if(!config.APP_USERNAME || !config.APP_PASSWORD){
    console.log("You must first setup admin user. Run command -> npm run setup-admin-user")
    process.exit(2)
}

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
    
    // Atualiza a cada 10 segundos (envia o status de cada aplicação para atualizar!)
    const interval = setInterval(() => {
        socketHandler.emitPm2Status(socket);
    }, 10000);

    // Limpa o intervalo ao desconectar
    socket.on('disconnect', () => {
        clearInterval(interval);
        //console.log('Cliente desconectado:', socket.id);
    });
});

httpServer.listen(config.PORT, config.HOST, ()=>{
    console.log(`Aplicação Rodando em http://localhost:${config.PORT}`)
})

/* app.listen(config.PORT, config.HOST, ()=>{
    console.log(`Aplicação Rodando em http://localhost:${config.PORT}`)
}) */