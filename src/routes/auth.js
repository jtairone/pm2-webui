const Router = require('@koa/router');
const router = new Router();
const { createUser, hasAdminUser } = require('../services/user.service');
//const { createUser } = require('../services/user.service');

router.get('/setup', async (ctx) => {
  const hasAdmin = await hasAdminUser();
  if (hasAdmin) {
    return ctx.redirect('/login');
  }
  
  return ctx.render('auth/setup', {
    layout: false,
    setup: { 
      username: '', 
      password: '', 
      confirmPassword: '', 
      error: null 
    }
  });
});

router.post('/setup', async (ctx) => {
  const { username, password, confirmPassword } = ctx.request.body;
  
  const hasAdmin = await hasAdminUser();
  if (hasAdmin) {
    return ctx.redirect('/login');
  }
  
  if (password !== confirmPassword) {
    return ctx.render('auth/setup', {
      layout: false,
      setup: { 
        username, 
        password: '', 
        confirmPassword: '', 
        error: 'As senhas não coincidem' 
      }
    });
  }
  
  try {
    await createUser(username, password, true);
    ctx.session.isAuthenticated = true;
    ctx.session.user = { username };
    return ctx.redirect('/login');
  } catch (err) {
    return ctx.render('auth/setup', {
      layout: false,
      setup: { 
        username, 
        password: '', 
        confirmPassword: '', 
        error: err.message 
      }
    });
  }
});

module.exports = router;