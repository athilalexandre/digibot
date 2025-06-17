const mongoose = require('mongoose');

const DigimonDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  stage: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Data', 'Virus', 'Vacina', null],
    default: null,
  },
  baseStats: {
    hp: { type: Number, default: 10 },
    forca: { type: Number, default: 1 },
    defesa: { type: Number, default: 1 },
    velocidade: { type: Number, default: 1 },
    sabedoria: { type: Number, default: 1 },
  },
  evolvesTo: {
    type: String,
    default: null,
  },
  evolvesFrom: { // Campo adicionado
    type: String,
    default: null,
  }
});

module.exports = mongoose.model('DigimonData', DigimonDataSchema);
