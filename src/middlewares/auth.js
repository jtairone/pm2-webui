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

function checkAdmin(ctx, next) {
    if (ctx.session.isAuthenticated && ctx.session.isAdmin) {
        return next();
    } else {
        //ctx.status = 403; // Forbidden
        return ctx.redirect('/apps'); // Ou redirecione para outra página
    }
}

module.exports = {
    isAuthenticated,
    checkAuthentication,
    checkAdmin
};