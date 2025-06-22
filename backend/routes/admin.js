const express = require('express');
const router = express.Router();
const { corrigirEstagios, resetGame } = require('../controllers/admin');
const authMiddleware = require('../middleware/auth'); // Protegendo as rotas

// Ambas as rotas exigem que o usuário seja um administrador
router.post('/corrigir-estagios', authMiddleware.admin, corrigirEstagios);
router.post('/reset-game', authMiddleware.admin, resetGame);

module.exports = router; 