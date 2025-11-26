// Carrega variáveis de ambiente
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const SETTINGS_FILE = path.join(__dirname, '../../backend/config/bot-settings.json');

// Função para carregar configurações
function loadConfig() {
  // Tenta ler do arquivo bot-settings.json primeiro
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      return {
        mongodbUri: settings.mongoUri || process.env.MONGODB_URI,
        twitchUsername: settings.twitchUsername || process.env.TWITCH_USERNAME,
        twitchPassword: settings.twitchOAuth || process.env.TWITCH_PASSWORD,
        twitchChannel: settings.twitchChannel || process.env.TWITCH_CHANNEL,
        twitchOAuth: settings.twitchOAuth || process.env.TWITCH_OAUTH_TOKEN,
        apiPort: process.env.API_PORT,
      };
    } catch (error) {
      console.error('Erro ao ler bot-settings.json, usando .env:', error);
    }
  }

  // Fallback para .env
  return {
    mongodbUri: process.env.MONGODB_URI,
    twitchUsername: process.env.TWITCH_USERNAME,
    twitchPassword: process.env.TWITCH_PASSWORD,
    twitchChannel: process.env.TWITCH_CHANNEL,
    twitchOAuth: process.env.TWITCH_OAUTH_TOKEN,
    apiPort: process.env.API_PORT,
  };
}

let config = loadConfig();

// Função para recarregar configurações
function reloadConfig() {
  config = loadConfig();
  return config;
}

module.exports = config;
module.exports.reloadConfig = reloadConfig;
