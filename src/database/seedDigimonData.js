const fs = require('fs');
const path = require('path'); // Adicionado para construir caminho absoluto
const mongoose = require('mongoose');
const connectDB = require('./connection'); // Assumindo que connection.js exporta connectDB
const DigimonData = require('../models/DigimonData');
const config = require('../config'); // Para MONGODB_URI se connectDB não o usar diretamente

async function seedDB() {
  try {
    // Conectar ao DB. Se connectDB já usa config.mongodbUri, não precisa passar aqui.
    // Se connectDB não estiver configurado para pegar a URI do config,
    // você pode precisar passar config.mongodbUri explicitamente ou garantir que mongoose.connect seja chamado com ela.
    await connectDB();

    // Ler o arquivo JSON
    // __dirname aponta para src/database, então precisamos voltar um nível para src/ e depois data/
    const filePath = path.join(__dirname, '../data/digimon_catalog.json');
    const digimonCatalogRaw = fs.readFileSync(filePath, 'utf-8');
    const digimonCatalog = JSON.parse(digimonCatalogRaw);

    if (!digimonCatalog || digimonCatalog.length === 0) {
      console.log('Arquivo do catálogo de Digimons está vazio ou não foi encontrado. Abortando o seed.');
      await mongoose.disconnect();
      return;
    }

    // Limpar a coleção
    console.log('Limpando a coleção DigimonData...');
    await DigimonData.deleteMany({});
    console.log('Coleção DigimonData limpa.');

    // Inserir os dados
    console.log(`Inserindo ${digimonCatalog.length} Digimons na coleção...`);
    // Com o schema atualizado (attribute: String, evolvesFrom: Mixed),
    // o Mongoose deve conseguir mapear diretamente os campos do JSON.
    // O evolvesTo do JSON também deve ser uma string ou null para corresponder ao schema.
    // Se evolvesTo no JSON for um array, isso precisaria ser tratado (ex: pegar o primeiro).
    // O JSON de exemplo já parece ter evolvesTo como string ou null.
    await DigimonData.insertMany(digimonCatalog);
    console.log(`${digimonCatalog.length} Digimons inseridos com sucesso!`);

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    // Fechar a conexão
    console.log('Desconectando do MongoDB...');
    await mongoose.disconnect();
    console.log('Desconectado.');
  }
}

seedDB();
