const { validateUser } = require('../services/user.service');

/* const checkAuthentication = async (ctx, next) => {
    if(ctx.session.isAuthenticated){
        return ctx.redirect('/apps')
    }
    await next()
}

const isAuthenticated = async (ctx, next) => {
    if(!ctx.session.isAuthenticated){
        return ctx.redirect('/login')
    }
    await next()
}
 */

async function isAuthenticated(ctx, next) {
    if (ctx.session.isAuthenticated) {
        return next();
    }
    ctx.redirect('/login');
}

async function checkAuthentication(ctx, next) {
    if (ctx.session.isAuthenticated) {
        return ctx.redirect('/apps');
    }
    return next();
}

module.exports = {
    isAuthenticated,
    checkAuthentication,
};