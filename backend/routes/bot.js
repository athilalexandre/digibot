const express = require('express')
const router = express.Router()
const botController = require('../controllers/bot')
const { auth, admin } = require('../middleware/auth')

// Rotas públicas
router.get('/status', botController.getStatus)
router.get('/config', botController.getConfig)

// Rotas protegidas (requer autenticação)
router.use(auth)

// Rotas de administração
router.post('/start', admin, botController.startBot)
router.post('/stop', admin, botController.stopBot)
router.put('/config', admin, botController.updateConfig)
router.post('/message', admin, botController.sendMessage)

module.exports = router 