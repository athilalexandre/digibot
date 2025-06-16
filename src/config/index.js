// Carrega variáveis de ambiente
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  mongodbUri: process.env.MONGODB_URI,
  twitchUsername: process.env.TWITCH_USERNAME,
  twitchPassword: process.env.TWITCH_PASSWORD, // Mantido como TWITCH_PASSWORD conforme subtask anterior
  twitchChannel: process.env.TWITCH_CHANNEL,
  twitchOAuth: process.env.TWITCH_OAUTH_TOKEN, // Adicionado TWITCH_OAUTH_TOKEN
  apiPort: process.env.API_PORT, // Mantido apiPort conforme subtask anterior
};
