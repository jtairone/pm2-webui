const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

async function createUser(username, password, isAdmin = false) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return db('users').insert({
    username,
    password: hashedPassword,
    is_admin: isAdmin
  });
}

async function getUserByUsername(username) {
  return db('users').where({ username }).first();
}

async function validateUser(username, password) {
  const user = await getUserByUsername(username);
  if (!user) return false;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : false;
}

async function hasAdminUser() {
  const admin = await db('users').where({ is_admin: true }).first();
  return !!admin;
}

module.exports = {
  createUser,
  getUserByUsername,
  validateUser,
  hasAdminUser
};