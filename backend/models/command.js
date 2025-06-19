const mongoose = require('mongoose')

const commandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 20
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  usage: {
    type: String,
    required: true,
    trim: true
  },
  examples: [{
    type: String,
    trim: true
  }],
  cooldown: {
    type: Number,
    default: 0,
    min: 0
  },
  bitCost: {
    type: Number,
    default: 0,
    min: 0
  },
  isModOnly: {
    type: Boolean,
    default: false
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: true,
    enum: ['geral', 'digimon', 'jogo', 'admin', 'mod']
  },
  aliases: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUsed: {
    type: Date,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Índices
commandSchema.index({ name: 1 })
commandSchema.index({ category: 1 })
commandSchema.index({ isEnabled: 1 })

// Método para verificar se o comando pode ser usado
commandSchema.methods.canUse = function(user) {
  if (!this.isEnabled) {
    return false
  }
  
  if (this.isModOnly && !user.isModerator && !user.isAdmin) {
    return false
  }
  
  if (this.cooldown > 0 && this.lastUsed) {
    const cooldownTime = this.lastUsed.getTime() + (this.cooldown * 1000)
    if (Date.now() < cooldownTime) {
      return false
    }
  }
  
  return true
}

// Método para registrar uso do comando
commandSchema.methods.use = function() {
  this.lastUsed = new Date()
  this.usageCount += 1
  return this.save()
}

// Método para obter dados públicos do comando
commandSchema.methods.toPublicJSON = function() {
  const command = this.toObject()
  
  delete command.__v
  delete command.createdBy
  
  return command
}

const Command = mongoose.model('Command', commandSchema)

module.exports = Command 