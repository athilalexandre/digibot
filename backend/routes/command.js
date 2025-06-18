const express = require('express');
const router = express.Router();
const commandController = require('../controllers/command');
const { auth, admin } = require('../middleware/auth');

// Rotas públicas
router.get('/', commandController.listCommands);
router.get('/:name', commandController.getCommand);

// Rotas protegidas
router.use(auth);

// Rotas de administração
router.post('/', admin, commandController.createCommand);
router.put('/:name', admin, commandController.updateCommand);
router.delete('/:name', admin, commandController.deleteCommand);
router.post('/execute', commandController.executeCommand);

module.exports = router; 