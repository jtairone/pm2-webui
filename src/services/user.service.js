const bcrypt = require('bcryptjs');
const { db } = require('../config/database');
const fs = require('fs')

async function createUser(username, password, isAdmin = false, photoUrl = null) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return db('users').insert({
    username,
    password: hashedPassword,
    is_admin: isAdmin,
    photo_url: photoUrl
  });
}

async function updateUser(id, { username, password, isAdmin, photoUrl }) {
  const currentUser = await db('users').where({ id }).first();
  if (!currentUser) {
    throw new Error('Usuário não encontrado');
  }
  const updateData = {
    username: username || currentUser.username,
    is_admin: isAdmin !== undefined ? isAdmin : currentUser.is_admin,
    updated_at: db.fn.now()
  };
  if (password && password.trim() !== '') {
    updateData.password = await bcrypt.hash(password, 10);
  }
  if (photoUrl) {
    updateData.photo_url = photoUrl;
  }
  return db('users')
    .where({ id })
    .update(updateData);
}

async function deleteUserById(userId) {
  return db('users').where({ id: userId }).del();
}

async function getUserByUsername(username) {
  return db('users').where({ username }).first();
}

async function getUserById(id) {
  const user = await db('users').where({ id }).first();
  if (!user) return null;
  return {
    ...user,
    photoUrl: user.photo_url || null
  };
}

async function getAllUsers() {
  const users = await db('users').select('*');
  return users.map(user => ({
    ...user,
    photoUrl: user.photo_url || null
  }));
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
  updateUser,
  deleteUserById,
  getUserByUsername,
  getUserById,
  getAllUsers,
  validateUser,
  hasAdminUser
};