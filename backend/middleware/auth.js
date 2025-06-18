const jwt = require('jsonwebtoken')
const config = require('../config')
const User = require('../models/user')

// Middleware para verificar o token JWT
const auth = async (req, res, next) => {
  try {
    // Obtém o token do header
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' })
    }

    // Verifica o token
    const decoded = jwt.verify(token, config.jwtSecret)
    
    // Busca o usuário
    const user = await User.findOne({ _id: decoded.id })
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' })
    }

    // Adiciona o usuário e o token à requisição
    req.user = user
    req.token = token
    
    next()
  } catch (error) {
    res.status(401).json({ message: 'Não autorizado' })
  }
}

// Middleware para verificar se o usuário é admin
const admin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado' })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar permissões' })
  }
}

// Middleware para verificar se o usuário é moderador
const moderator = async (req, res, next) => {
  try {
    if (!req.user.isModerator && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Acesso negado' })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar permissões' })
  }
}

module.exports = {
  auth,
  admin,
  moderator
} 