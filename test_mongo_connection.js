const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/digibot';

console.log('[Teste] Iniciando teste de conexão com MongoDB...');
console.log('[Teste] URI usada:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('[Teste] Conexão com MongoDB estabelecida com sucesso!');
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('[Teste] Desconectado do MongoDB.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Teste] Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }); 