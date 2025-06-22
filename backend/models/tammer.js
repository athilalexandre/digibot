const mongoose = require('mongoose');

const TammerSchema = new mongoose.Schema({
  twitchUserId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  currentDigimonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DigimonData',
    default: null,
  },
  digimonName: {
    type: String,
    default: '',
  },
  rank: {
    type: String,
    default: "Normal Tamer",
  },
  digimonXp: {
    type: Number,
    default: 0,
  },
  bits: {
    type: Number,
    default: 0,
  },
  digimonStage: {
    type: String,
    default: "Digitama",
  },
  digimonLevel: {
    type: Number,
    default: 1,
  },
  digimonHp: {
    type: Number,
    default: 10,
  },
  digimonMp: {
    type: Number,
    default: 10,
  },
  digimonStats: {
    forca: { type: Number, default: 1 },
    defesa: { type: Number, default: 1 },
    velocidade: { type: Number, default: 1 },
    sabedoria: { type: Number, default: 1 },
  },
  digimonType: {
    type: String,
    enum: ['Data', 'Virus', 'Vacina', null],
    default: null,
  },
  isFollower: {
    type: Boolean,
    default: false,
  },
  digitamaReadyAt: {
    type: Date,
    default: null,
  },
  
  // Novos campos para o sistema atualizado
  equippedWeapon: {
    id: { type: String, default: null },
    nome: { type: String, default: null },
    tipo: { type: String, default: null },
    dano: { type: Number, default: 0 },
    defesa: { type: Number, default: 0 },
    raridade: { type: String, default: null },
    emoji: { type: String, default: null }
  },
  
  // Sistema de Pontos de Batalha (PB)
  battlePoints: {
    type: Number,
    default: 0,
  },
  lastBattlePointsRegeneration: {
    type: Date,
    default: Date.now,
  },
  
  // Sistema de Cooldowns
  lastTrainingTime: {
    type: Date,
    default: null,
  },
  
  // Sistema de Itens
  inventory: {
    restaurador_energia: { type: Number, default: 0 },
    xp_booster: { type: Number, default: 0 }
  },
  
  // Sistema de Boosters
  activeBoosts: {
    xpBooster: {
      active: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null }
    }
  },
  
  // Sistema de PvP
  pvpChallenges: {
    challengedBy: { type: String, default: null },
    challengedAt: { type: Date, default: null },
    isChallenging: { type: String, default: null },
    challengingSince: { type: Date, default: null }
  }
});

// Método para verificar se pode treinar (cooldown)
TammerSchema.methods.canTrain = function() {
  if (!this.lastTrainingTime) return true;
  
  const gameConfig = require('../../src/config/gameConfig');
  const cooldownMs = gameConfig.training.cooldownSeconds * 1000;
  const timeSinceLastTraining = Date.now() - this.lastTrainingTime.getTime();
  
  return timeSinceLastTraining >= cooldownMs;
};

// Método para verificar se tem arma equipada
TammerSchema.methods.hasWeapon = function() {
  return this.equippedWeapon && this.equippedWeapon.id;
};

// Método para regenerar pontos de batalha
TammerSchema.methods.regenerateBattlePoints = function() {
  const gameConfig = require('../../src/config/gameConfig');
  const stageConfig = gameConfig.stages[this.digimonStage];
  
  if (!stageConfig) return;
  
  const regenerationTimeMs = gameConfig.battlePoints.regenerationTimeMinutes * 60 * 1000;
  const timeSinceLastRegeneration = Date.now() - this.lastBattlePointsRegeneration.getTime();
  
  if (timeSinceLastRegeneration >= regenerationTimeMs) {
    this.battlePoints = stageConfig.battlePoints;
    this.lastBattlePointsRegeneration = new Date();
  }
};

// Método para verificar se tem pontos de batalha suficientes
TammerSchema.methods.hasBattlePoints = function(required = 1) {
  this.regenerateBattlePoints();
  return this.battlePoints >= required;
};

// Método para consumir pontos de batalha
TammerSchema.methods.consumeBattlePoints = function(amount = 1) {
  if (this.battlePoints >= amount) {
    this.battlePoints -= amount;
    return true;
  }
  return false;
};

// Método para verificar se tem bits suficientes
TammerSchema.methods.hasBits = function(required) {
  return this.bits >= required;
};

// Método para consumir bits
TammerSchema.methods.consumeBits = function(amount) {
  if (this.bits >= amount) {
    this.bits -= amount;
    return true;
  }
  return false;
};

// Método para adicionar bits
TammerSchema.methods.addBits = function(amount) {
  this.bits += amount;
  if (this.bits < 0) this.bits = 0;
};

// Método para equipar arma
TammerSchema.methods.equipWeapon = function(weapon) {
  this.equippedWeapon = {
    id: weapon.id,
    nome: weapon.nome,
    tipo: weapon.tipo,
    dano: weapon.dano,
    defesa: weapon.defesa,
    raridade: weapon.raridade,
    emoji: weapon.emoji
  };
};

// Método para desequipar arma
TammerSchema.methods.unequipWeapon = function() {
  this.equippedWeapon = {
    id: null,
    nome: null,
    tipo: null,
    dano: 0,
    defesa: 0,
    raridade: null,
    emoji: null
  };
};

// Método para adicionar item ao inventário
TammerSchema.methods.addItem = function(itemId, quantity = 1) {
  if (this.inventory[itemId] !== undefined) {
    this.inventory[itemId] += quantity;
  }
};

// Método para usar item do inventário
TammerSchema.methods.useItem = function(itemId) {
  if (this.inventory[itemId] && this.inventory[itemId] > 0) {
    this.inventory[itemId]--;
    return true;
  }
  return false;
};

// Método para ativar booster de XP
TammerSchema.methods.activateXpBooster = function() {
  const gameConfig = require('../../src/config/gameConfig');
  const itemConfig = gameConfig.items.xp_booster;
  
  this.activeBoosts.xpBooster.active = true;
  this.activeBoosts.xpBooster.expiresAt = new Date(Date.now() + (itemConfig.durationMinutes * 60 * 1000));
};

// Método para verificar se booster de XP está ativo
TammerSchema.methods.hasXpBooster = function() {
  if (!this.activeBoosts.xpBooster.active) return false;
  
  if (this.activeBoosts.xpBooster.expiresAt < new Date()) {
    this.activeBoosts.xpBooster.active = false;
    this.activeBoosts.xpBooster.expiresAt = null;
    return false;
  }
  
  return true;
};

module.exports = mongoose.model('Tammer', TammerSchema); 