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
    enum: ['Data', 'Virus', 'Vacina'],
    default: null,
  },
  attribute: {
    type: String,
    enum: ['Fogo', 'Planta', 'Água', 'Elétrico', 'Vento', 'Terra', 'Luz', 'Escuridão', 'Neutro', null],
    default: 'Neutro'
  },
  baseStats: {
    hp: { type: Number, default: 10 },
    forca: { type: Number, default: 1 },
    defesa: { type: Number, default: 1 },
    velocidade: { type: Number, default: 1 },
    sabedoria: { type: Number, default: 1 },
  },
  evolvesTo: {
    type: [String],
    default: [],
  },
  evolvesFrom: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  }
});

module.exports = mongoose.model('DigimonData', DigimonDataSchema); 