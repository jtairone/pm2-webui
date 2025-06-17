const config = require('../config')
const RateLimit = require('koa2-ratelimit').RateLimit;
const Router = require('@koa/router');
const router = new Router();
const { listApps, describeApp, reloadApp, restartApp, stopApp, reloadAllApp, restartAllApp, stopAllApps, addApp, deleteApp } = require('../providers/pm2/api')
const { validateAdminUser } = require('../services/admin.service')
const  { readLogsReverse } = require('../utils/read-logs.util')
const { getCurrentGitBranch, getCurrentGitCommit } = require('../utils/git.util')
const { getEnvFileContent } = require('../utils/env.util')
const { isAuthenticated, checkAuthentication }= require('../middlewares/auth')
const AnsiConverter = require('ansi-to-html');
const ansiConvert = new AnsiConverter();

const loginRateLimiter = RateLimit.middleware({
    interval: 2*60*1000, // 2 minutes
    max: 100,
    prefixKey: '/login' // to allow the bdd to Differentiate the endpoint 
  });

router.get('/', async (ctx) => {
    return ctx.redirect('/login')
})

router.get('/login', loginRateLimiter, checkAuthentication, async (ctx) => {
    return await ctx.render('auth/login', {layout : false, login: { username: '', password:'', error: null }})
})

router.post('/login', loginRateLimiter, checkAuthentication, async (ctx) => {
    const { username, password } = ctx.request.body;
    try {
        await validateAdminUser(username, password)
        ctx.session.isAuthenticated = true;
        return ctx.redirect('/apps')
    }
    catch(err){
        return await ctx.render('auth/login', {layout : false, login: { username, password, error: err.message }})
    }
})

router.get('/apps', isAuthenticated, async (ctx) => {
    const apps =  await listApps()
    return await ctx.render('apps/dashboard', {
      apps
    });
});

router.get('/logout', (ctx)=>{
    ctx.session = null;
    return ctx.redirect('/login')
})

router.get('/apps/add-app', async (ctx) => {
  await ctx.render('apps/add-app'); // Renderiza add-app.html
});

router.get('/apps/:appName', isAuthenticated, async (ctx) => {
    const { appName } = ctx.params
    let app =  await describeApp(appName)
    if(app){
        app.git_branch = await getCurrentGitBranch(app.pm2_env_cwd)
        app.git_commit = await getCurrentGitCommit(app.pm2_env_cwd)
        app.env_file = await getEnvFileContent(app.pm2_env_cwd)
        const stdout = await readLogsReverse({filePath: app.pm_out_log_path})
        const stderr = await readLogsReverse({filePath: app.pm_err_log_path})
        stdout.lines = stdout.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        stderr.lines = stderr.lines.map(log => {
            return  ansiConvert.toHtml(log)
        }).join('<br/>')
        return await ctx.render('apps/app', {
            app,
            logs: {
                stdout,
                stderr
            }
        });
    }
    return ctx.redirect('/apps')
});

router.get('/api/apps/:appName/logs/:logType', isAuthenticated, async (ctx) => {
    const { appName, logType } = ctx.params
    const { linePerRequest, nextKey } = ctx.query
    if(logType !== 'stdout' && logType !== 'stderr'){
        return ctx.body = {
            'error': 'Log Type must be stdout or stderr'
        }
    }
    const app =  await describeApp(appName)
    const filePath = logType === 'stdout' ? app.pm_out_log_path: app.pm_err_log_path
    let logs = await readLogsReverse({filePath, nextKey})
    logs.lines = logs.lines.map(log => {
        return  ansiConvert.toHtml(log)
    }).join('<br/>')
    return ctx.body = {
        logs
    };
});

router.post('/api/apps/:appName/reload', isAuthenticated, async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await reloadApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/apps/:appName/restart', isAuthenticated,  async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await restartApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        console.log(err)
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/apps/:appName/stop', isAuthenticated, async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await stopApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/apps/all/reload', isAuthenticated, async (ctx) => {
    try{
        let apps =  await reloadAllApp('all')
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/apps/all/restart', isAuthenticated, async (ctx) => {
    try{
        let apps =  await restartAllApp('all')
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/apps/all/stop', isAuthenticated, async (ctx) => {
    try{
        let apps =  await stopAllApps('all')
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

router.post('/api/apps/:appName/delete', isAuthenticated, async (ctx) => {
    try{
        let { appName } = ctx.params
        let apps =  await deleteApp(appName)
        if(Array.isArray(apps) && apps.length > 0){
            return ctx.body = {
                success: true
            }
        }
        return ctx.body = {
            success: false
        }
    }
    catch(err){
        return ctx.body = {
            'error':  err
        }
    }
});

// Rota para adicionar uma nova aplicação
router.post('/api/apps/add', async (ctx) => {
    const { name, script, port, args, nodeEnv } = ctx.request.body;

    if (!name || !script) {
    ctx.status = 400;
    ctx.body = { message: "Nome e caminho do script são obrigatórios!" };
    return;
    }

    try { 
    const appConfig = {
        name,
        script,
        ...(args && { args }),  // Adiciona os argumentos se existirem
        ...(port && { env: { PORT: port } }), // Adiciona porta se existir
        ...(nodeEnv && { nodeEnv }) // Passa apenas se definido
    };

    await addApp(appConfig)

    ctx.status = 200;
    ctx.body = { message: "Aplicação adicionada e iniciada com sucesso!" };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: `Erro ao adicionar aplicação: ${err.message}` };
    }
});

module.exports = router;
