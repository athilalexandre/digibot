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
    // Ajuste para corresponder ao schema DigimonData (especialmente evolvesTo e baseStats)
    const digimonDataToInsert = digimonCatalog.map(digimon => ({
      name: digimon.name,
      stage: digimon.stage,
      type: digimon.type || null, // Garante null se não especificado
      // baseStats já está aninhado no JSON, o que é bom
      baseStats: digimon.baseStats || { hp: 10, forca: 1, defesa: 1, velocidade: 1, sabedoria: 1 },
      // evolvesTo deve ser uma string ou null. Se for array (como Omnimon), precisa decidir como tratar.
      // Para o schema atual, evolvesTo é uma String. Se for uma fusão, talvez precise de outro campo ou lógica.
      // Por simplicidade aqui, se evolvesTo for um array, pegaremos o primeiro nome ou null.
      evolvesTo: Array.isArray(digimon.evolvesTo) ? (digimon.evolvesTo.length > 0 ? digimon.evolvesTo[0] : null) : digimon.evolvesTo,
      // O schema DigimonData não tem 'attribute' ou 'evolvesFrom' diretamente.
      // Esses campos precisariam ser adicionados ao schema DigimonData.js se forem necessários.
      // Por enquanto, eles serão ignorados pelo Mongoose se não estiverem no schema.
    }));


    await DigimonData.insertMany(digimonDataToInsert);
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
