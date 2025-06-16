// Configura a conexão com MongoDB
const mongoose = require('mongoose');
const config = require('../config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri, { // Alterado de MONGODB_URI para mongodbUri
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado ao MongoDB');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message); // Melhor log de erro
    process.exit(1); // Sai do processo em caso de falha na conexão
  }
};

module.exports = connectDB;
