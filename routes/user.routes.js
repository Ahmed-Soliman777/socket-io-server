const express = require('express')
const { registerUser, handleLogin, getUsers } = require('../controllers/user.ctrl')
const { authenticate } = require('../middleware/auth.middleware.js')

const route = express()

route.get('/users', authenticate, getUsers)
route.post('/register', registerUser)
route.post('/login', handleLogin)

module.exports = route