const express = require('express')
const router = express.Router()
const botController = require('../controllers/bot')
// const { auth, admin } = require('../middleware/auth')

// Rotas públicas
router.get('/status', botController.getStatus)
router.get('/config', botController.getConfig)
router.post('/start', botController.startBot)
router.post('/stop', botController.stopBot)
router.put('/config', botController.updateConfig)
router.post('/message', botController.sendMessage)

module.exports = router 