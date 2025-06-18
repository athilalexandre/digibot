const User = require('../models/user')
const logger = require('../utils/logger').createModuleLogger('AuthController')

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Busca o usuário
    const user = await User.findOne({ username })
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    // Verifica a senha
    const isMatch = await user.comparePassword(password)
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' })
    }

    // Atualiza último login
    user.lastLogin = new Date()
    await user.save()

    // Gera o token
    const token = user.generateAuthToken()

    res.json({
      token,
      user: user.toPublicJSON()
    })
  } catch (error) {
    logger.error('Erro no login:', error)
    res.status(500).json({ message: 'Erro ao fazer login' })
  }
}

// Registro
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'Usuário ou email já cadastrado'
      })
    }

    // Cria o usuário
    const user = new User({
      username,
      email,
      password
    })

    await user.save()

    // Gera o token
    const token = user.generateAuthToken()

    res.status(201).json({
      token,
      user: user.toPublicJSON()
    })
  } catch (error) {
    logger.error('Erro no registro:', error)
    res.status(500).json({ message: 'Erro ao registrar usuário' })
  }
}

// Logout
exports.logout = async (req, res) => {
  try {
    // O token é invalidado no frontend
    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    logger.error('Erro no logout:', error)
    res.status(500).json({ message: 'Erro ao fazer logout' })
  }
}

// Obter usuário atual
exports.getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: req.user.toPublicJSON()
    })
  } catch (error) {
    logger.error('Erro ao obter usuário atual:', error)
    res.status(500).json({ message: 'Erro ao obter usuário' })
  }
}

// Atualizar usuário
exports.updateUser = async (req, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Atualizações inválidas' })
    }

    updates.forEach(update => req.user[update] = req.body[update])
    await req.user.save()

    res.json({
      user: req.user.toPublicJSON()
    })
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error)
    res.status(500).json({ message: 'Erro ao atualizar usuário' })
  }
} 