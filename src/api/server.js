// Arquivo principal da API Express
const express = require('express');
const connectDB = require('../database/connection');
const Tammer = require('../models/Tammer');
const BotConfig = require('../models/BotConfig');
const config = require('../config');

// Conecta ao MongoDB
connectDB();

// Cria a aplicação Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Endpoint de Status
app.get('/api/bot/status', (req, res) => {
  res.json({ status: "Online", message: "Digibot API is running." });
});

// Endpoints para Tammers
app.get('/api/tammers', async (req, res) => {
  try {
    const tammers = await Tammer.find().select('-__v');
    res.json(tammers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/tammers/:twitchUserId', async (req, res) => {
  try {
    const tammer = await Tammer.findOne({ twitchUserId: req.params.twitchUserId }).select('-__v');
    if (!tammer) {
      return res.status(404).json({ message: 'Tammer not found' });
    }
    res.json(tammer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoints para Configurações do Bot
app.get('/api/config', async (req, res) => {
  try {
    let configData = await BotConfig.findOne({ configKey: 'mainConfig' }).select('-__v');
    if (!configData) {
      // Se não existir, cria uma configuração padrão e salva.
      configData = new BotConfig(); // Usa os defaults definidos no Schema
      await configData.save();
      // Remove o campo __v da nova configData antes de enviar, para consistência
      const savedConfigData = await BotConfig.findOne({ configKey: 'mainConfig' }).select('-__v');
      return res.json(savedConfigData);
    }
    res.json(configData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    // Não permitir alterar configKey diretamente pela API
    if (req.body.configKey && req.body.configKey !== 'mainConfig') {
        return res.status(400).json({ message: "Alterar configKey não é permitido." });
    }
    // Garante que estamos sempre atualizando 'mainConfig'
    const query = { configKey: 'mainConfig' };
    // Remove configKey do corpo para evitar que seja setado para algo diferente de 'mainConfig'
    const { configKey, ...updateData } = req.body;


    const updatedConfig = await BotConfig.findOneAndUpdate(
      query,
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).select('-__v');
    res.json(updatedConfig);
  } catch (error) {
    // Trata erros de validação do Mongoose
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});


// Inicia o servidor
const PORT = config.apiPort || 3000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
