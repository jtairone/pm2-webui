const config = require('../config')
const { setEnvDataSync } = require('../utils/env.util')
const { hashPasswordSync, comparePassword } = require('../utils/password.util')
const { validateUser } = require('./user.service');

const createAdminUser = (username, password) => {
    const adminUser = {
        APP_USERNAME: username,
        APP_PASSWORD: hashPasswordSync(password)
    }
    setEnvDataSync(config.APP_DIR, adminUser)
}

/* const validateAdminUser = async (username, password) => {
    if(username !== config.APP_USERNAME){
        throw new Error('User does not exist')
    }
    const isPasswordCorrect = await comparePassword(password, config.APP_PASSWORD)
    if(!isPasswordCorrect){
        throw new Error('Password is incorrect')
    }
    return true
} */

async function validateAdminUser(username, password) {
  const user = await validateUser(username, password);
  if (!user || !user.is_admin) {
    throw new Error('Credenciais inválidas ou usuário não é administrador');
  }
  return user;
}

module.exports = {
    createAdminUser,
    validateAdminUser
}