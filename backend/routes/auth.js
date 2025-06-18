const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { auth } = require('../middleware/auth');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/me', auth, authController.getCurrentUser);
router.put('/me', auth, authController.updateUser);

module.exports = router; 