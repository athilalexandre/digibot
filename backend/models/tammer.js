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
});

module.exports = mongoose.model('Tammer', TammerSchema); 