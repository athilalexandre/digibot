const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  twitchId: {
    type: String,
    unique: true,
    sparse: true
  },
  twitchUsername: {
    type: String,
    trim: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isModerator: {
    type: Boolean,
    default: false
  },
  digimon: {
    name: String,
    level: {
      type: Number,
      default: 1
    },
    xp: {
      type: Number,
      default: 0
    },
    evolution: {
      type: String,
      default: 'Rookie'
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Método para gerar hash da senha
userSchema.pre('save', async function(next) {
  const user = this
  
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  
  next()
})

// Método para comparar senhas
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password)
}

// Método para gerar token JWT
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken')
  const config = require('../config')
  
  return jwt.sign(
    { id: this._id.toString() },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

// Método para obter dados públicos do usuário
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject()
  
  delete user.password
  delete user.__v
  
  return user
}

const User = mongoose.model('User', userSchema)

module.exports = User 