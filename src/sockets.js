//const pm2 = require('pm2');
const { listApps, describeApp } = require('./providers/pm2/api')
module.exports = {
    /**
     * Obtém os dados do PM2 e envia via Socket.io
     */
    emitPm2Status: (socket) => {
        listApps().then((apps)=>{
            socket.emit('pm2-status', apps);
        });
    },
};