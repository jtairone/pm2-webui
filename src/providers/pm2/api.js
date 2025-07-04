const pm2 = require('pm2');
const path = require('path')
const { bytesToSize, timeSince } = require('./ux.helper')

function listApps(){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.list((err, apps) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                apps = apps.map((app) => {
                    return {
                        name: app.name,
                        status: app.pm2_env.status,
                        version: app.pm2_env.version,
                        cpu: app.monit.cpu,
                        memory: bytesToSize(app.monit.memory),
                        uptime: timeSince(app.pm2_env.pm_uptime),
                        created: timeSince(app.pm2_env.created_at),
                        watch: app.pm2_env.watch,
                        pm_id: app.pm_id
                    }
                })
                resolve(apps)
            })
        })
    })
}

function describeApp(appName){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.describe(appName, (err, apps) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                if(Array.isArray(apps) && apps.length > 0){
                    const app = {
                        name: apps[0].name,
                        status: apps[0].pm2_env.status,
                        cpu: apps[0].monit.cpu,
                        memory: bytesToSize(apps[0].monit.memory),
                        uptime: timeSince(apps[0].pm2_env.pm_uptime),
                        pm_id: apps[0].pm_id, 
                        pm_out_log_path: apps[0].pm2_env.pm_out_log_path,
                        pm_err_log_path: apps[0].pm2_env.pm_err_log_path,
                        pm2_env_cwd: apps[0].pm2_env.pm_cwd
                    }
                    resolve(app)
                }
                else{
                    resolve(null)
                }
            })
        })
    })
}

function reloadApp(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.reload(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function stopApp(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.stop(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function restartApp(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.restart(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function reloadAllApp(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.reload(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function restartAllApp(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.restart(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function stopAllApps(process){
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err)
            }
            pm2.stop(process, (err, proc) => {
                pm2.disconnect()
                if (err) {
                    reject(err)
                }
                resolve(proc)
            })
        })
    })
}

function deleteApp(process) {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                reject(err);
                return;
            }

            pm2.delete(process, (err, proc) => {
                pm2.disconnect();
                if (err) {
                    reject(err);
                } else {
                    resolve(proc);
                }
            });
        });
    });
}

function addApp(appConfig) {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) return reject(err);
            
            const fullConfig = {
                name: appConfig.name,
                script: appConfig.script,
                cwd: path.dirname(appConfig.script), // Importante!
                args: appConfig.args ? appConfig.args.split(' ') : [],
                env: {
                    ...(appConfig.nodeEnv && { NODE_ENV: appConfig.nodeEnv }),
                    ...(appConfig.port && { PORT: appConfig.port }),
                    NODE_CONFIG_DIR: path.join(path.dirname(appConfig.script), 'config')
                }
            };

            pm2.start(fullConfig, (err, apps) => {
                pm2.disconnect();
                if (err) return reject(err);
                resolve(apps);
            });
        });
    });
}

module.exports = {
    listApps,
    describeApp,
    reloadApp,
    stopApp,
    restartApp,
    reloadAllApp,
    restartAllApp,
    stopAllApps,
    addApp,
    deleteApp
}

