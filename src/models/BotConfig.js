const mongoose = require('mongoose');

const BotConfigSchema = new mongoose.Schema({
  configKey: {
    type: String,
    default: "mainConfig",
    unique: true,
  },
  coinConversionRate: {
    type: Number,
    default: 10,
  },
  coinValueForEvents: {
    type: Number,
    default: 1,
  },
  xpMultiplier: {
    type: Number,
    default: 1,
  },
  minTamersForRaid: {
    type: Number,
    default: 3,
  },
});

module.exports = mongoose.model('BotConfig', BotConfigSchema);
