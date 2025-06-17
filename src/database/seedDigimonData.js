const fs = require('fs');
const path = require('path'); // Adicionado para construir caminho absoluto
const mongoose = require('mongoose');
const connectDB = require('./connection'); // Assumindo que connection.js exporta connectDB
const DigimonData = require('../models/DigimonData');
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

    // Limpar a coleção
    console.log('Limpando a coleção DigimonData...');
    await DigimonData.deleteMany({});
    console.log('Coleção DigimonData limpa.');

    // Inserir os dados
    console.log(`Inserindo ${digimonCatalog.length} Digimons na coleção...`);
    await DigimonData.insertMany(digimonCatalog);
    console.log(`${digimonCatalog.length} Digimons inseridos com sucesso!`);

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
    throw error; // Propaga o erro para ser tratado pelo chamador
  }
}

module.exports = seedDB;
