const express = require('express');
const router = express.Router();
const { corrigirEstagios, resetGame } = require('../controllers/admin');

// Removido o middleware de autenticação para permitir acesso direto, conforme solicitado.
router.post('/corrigir-estagios', corrigirEstagios);
router.post('/reset-game', resetGame);

module.exports = router; 