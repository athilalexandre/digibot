const fs = require('fs');
const path = require('path'); // Adicionado para construir caminho absoluto
const mongoose = require('mongoose');
const connectDB = require('./connection'); // Assumindo que connection.js exporta connectDB
const DigimonData = require('../../backend/models/digimonData');
const config = require('../config'); // Para MONGODB_URI se connectDB não o usar diretamente

async function seedDB() {
  try {
    // Ler o arquivo JSON
    const filePath = path.join(__dirname, '../data/digimon_catalog.json');
    const digimonCatalogRaw = fs.readFileSync(filePath, 'utf-8');
    const digimonCatalog = JSON.parse(digimonCatalogRaw);

    if (!digimonCatalog || digimonCatalog.length === 0) {
      console.log('Arquivo do catálogo de Digimons está vazio ou não foi encontrado. Abortando o seed.');
      return;
    }

    // Inserir ou atualizar os dados usando bulkWrite para evitar erros de chave duplicada
    console.log(`Processando ${digimonCatalog.length} Digimons...`);

    const operations = digimonCatalog.map(digimon => ({
      updateOne: {
        filter: { name: digimon.name },
        update: { $set: digimon },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await DigimonData.bulkWrite(operations);
      console.log('Catálogo de Digimons atualizado com sucesso!');
    }

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    throw error; // Propaga o erro para ser tratado pelo chamador
  }
}

module.exports = seedDB;
