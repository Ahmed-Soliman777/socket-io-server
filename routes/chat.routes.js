const express = require('express')
const { authenticate } = require('../middleware/auth.middleware')
const { accessChat, getChat, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require('../controllers/chat.ctrl')
const route = express()

route.post('/chats', authenticate, accessChat)
route.get('/chats', authenticate, getChat)
route.post('/gChats', authenticate, createGroupChat)
route.put('/rename', authenticate, renameGroup)
route.put('/add', authenticate, addToGroup)
route.put('/remove', authenticate, removeFromGroup)


module.exports = route