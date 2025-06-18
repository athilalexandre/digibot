const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const User = require('../models/user');

// Listar usuários (apenas admin)
router.get('/', auth, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Obter usuário por ID (apenas admin)
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter usuário' });
  }
});

// Atualizar usuário (apenas admin)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'isAdmin', 'isModerator'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Atualizações inválidas' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    updates.forEach(update => user[update] = req.body[update]);
    await user.save();

    res.json(user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

// Deletar usuário (apenas admin)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
});

module.exports = router; 