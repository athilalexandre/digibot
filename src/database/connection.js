// Utilitário para conectar ao MongoDB APENAS para scripts isolados. NÃO use este arquivo junto com o backend rodando.
const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
// NÃO execute connectDB() automaticamente aqui!
