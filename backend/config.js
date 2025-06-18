require('dotenv').config()

module.exports = {
  // Configurações do servidor
  port: process.env.PORT || 3000,
  
  // Configurações do MongoDB
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/digibot',
  mongoPath: process.env.MONGO_PATH || 'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
  
  // Configurações do Twitch
  twitchClientId: process.env.TWITCH_CLIENT_ID,
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET,
  twitchRedirectUri: process.env.TWITCH_REDIRECT_URI || 'http://localhost:8080/auth/callback',
  
  // Configurações do JWT
  jwtSecret: process.env.JWT_SECRET || 'digibot-secret-key',
  jwtExpiresIn: '7d',
  
  // Configurações do CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  
  // Configurações do bot
  botUsername: process.env.BOT_USERNAME,
  botOauthToken: process.env.BOT_OAUTH_TOKEN,
  channelName: process.env.CHANNEL_NAME,
  
  // Configurações de logs
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Configurações de segurança
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por windowMs
  }
} 