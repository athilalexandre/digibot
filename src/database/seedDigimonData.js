const fs = require('fs');
const path = require('path'); // Adicionado para construir caminho absoluto
const mongoose = require('mongoose');
const connectDB = require('./connection'); // Assumindo que connection.js exporta connectDB
const DigimonData = require('../models/DigimonData');

async function seedDB(keepConnectionAlive = false) {
  try {
    // Conecta ao MongoDB utilizando a configuração centralizada em connection.js
    // Se keepConnectionAlive for true (chamado pelo bot), assume-se que a conexão já existe.
    // Se for chamado como script standalone, connectDB() garante a conexão.
    if (mongoose.connection.readyState === 0) { // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      await connectDB();
    }

    // Ler o arquivo JSON
    // __dirname aponta para src/database, então precisamos voltar um nível para src/ e depois data/
    const filePath = path.join(__dirname, '../data/digimon_catalog.json');
    const digimonCatalogRaw = fs.readFileSync(filePath, 'utf-8');
    const digimonCatalog = JSON.parse(digimonCatalogRaw);

    if (!digimonCatalog || digimonCatalog.length === 0) {
      console.log('Arquivo do catálogo de Digimons está vazio ou não foi encontrado. Abortando o seed.');
      if (!keepConnectionAlive) {
        await mongoose.disconnect();
      }
      return false; // Indica falha ou nenhuma ação
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
      attribute: digimon.attribute, // Mapeia o atributo do catálogo
      // baseStats já está aninhado no JSON, o que é bom
      baseStats: digimon.baseStats || { hp: 10, forca: 1, defesa: 1, velocidade: 1, sabedoria: 1 },
      // evolvesTo deve ser uma string ou null.
      // Para o schema atual, evolvesTo é uma String. Se for uma fusão, talvez precise de outro campo ou lógica.
      // Por simplicidade aqui, se evolvesTo for um array, pegaremos o primeiro nome ou null.
      evolvesTo: Array.isArray(digimon.evolvesTo) ? (digimon.evolvesTo.length > 0 ? digimon.evolvesTo[0] : null) : digimon.evolvesTo,
      evolvesFrom: Array.isArray(digimon.evolvesFrom) ? (digimon.evolvesFrom.length > 0 ? digimon.evolvesFrom[0] : null) : (digimon.evolvesFrom || null),
      // 'attribute' foi mapeado acima. Se 'attribute' não estiver definido no schema DigimonData, será ignorado pelo Mongoose.
      // 'evolvesFrom' é mapeado. Se for um array no catálogo (ex: para fusões como Omnimon),
      // o primeiro nome da lista é usado, pois o schema DigimonData provavelmente espera uma String para 'evolvesFrom'.
    }));


    await DigimonData.insertMany(digimonDataToInsert);
    console.log(`${digimonCatalog.length} Digimons inseridos com sucesso!`);
    return true; // Indica sucesso

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    return false; // Indica falha
  } finally {
    // Fechar a conexão apenas se não for para manter viva (script standalone)
    if (!keepConnectionAlive && mongoose.connection.readyState !== 0) {
      console.log('Desconectando do MongoDB...');
      await mongoose.disconnect();
      console.log('Desconectado.');
    } else if (keepConnectionAlive) {
      console.log('SeedDB concluído, mantendo conexão MongoDB ativa.');
    }
  }
}

// Se o script for executado diretamente (ex: npm run db:seed:digimon), chama seedDB()
if (require.main === module) {
  seedDB().then(success => process.exit(success ? 0 : 1));
}

module.exports = seedDB; // Exportar a função para ser usada por outros módulos (ex: bot)
