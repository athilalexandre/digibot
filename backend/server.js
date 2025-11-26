const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan')
const config = require('./config')
const logger = require('./utils/logger').createModuleLogger('Server')
const botService = require('./services/bot')
const { initializeBot: startNewBot } = require('../src/bot/bot')

// Importando rotas
const authRoutes = require('./routes/auth')
const botRoutes = require('./routes/bot')
const commandRoutes = require('./routes/command')
const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')

const app = express()

// Middlewares
app.use(helmet())
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: mobile, curl)
    if (!origin) return callback(null, true);
    if (config.corsOrigin.includes(origin)) {
      return callback(null, true);
    } else {
      logger.warn(`CORS bloqueado para origem: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5000 // Limite alto para evitar 429 em ambiente local
})
app.use(limiter)

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/bot', botRoutes)
app.use('/api/commands', commandRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const { getStatus: getNewBotStatus } = require('../src/bot/bot');
  const botStatus = getNewBotStatus();

  res.json({
    status: 'ok',
    mongodbConnected: isMongoConnected,
    botOnline: botStatus.isConnected === true,
    activeUsers: 0
  });
})

// Logs avançados de conexão MongoDB
mongoose.connection.on('connecting', () => {
  console.log('[MongoDB] Tentando conectar...')
})
mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Conectado com sucesso!')
})
mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Erro de conexão:', err)
})
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Desconectado!')
})
mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconectado!')
})

// Error handling
app.use((err, req, res, next) => {
  logger.error('Erro na aplicação:', err)
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  })
})

// Inicialização do servidor
async function startServer() {
  try {
    console.log('[MongoDB] URI usada:', config.mongoUri)
    await mongoose.connect(config.mongoUri)
    console.log('[MongoDB] Conexão inicial estabelecida.')
    logger.info('Conectado ao MongoDB')

    // Inicia o novo bot automaticamente ao iniciar o servidor
    await startNewBot();

    const server = app.listen(config.port, () => {
      logger.info(`Servidor rodando na porta ${config.port}`)
    })

    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Encerrando servidor...')
      server.close(async () => {
        logger.info('Servidor encerrado')
        try {
          await mongoose.connection.close(false)
          logger.info('Conexão com MongoDB encerrada')
        } catch (err) {
          logger.error('Erro ao fechar conexão do MongoDB:', err)
        }
        process.exit(0)
      })
    })

    process.on('SIGTERM', async () => {
      logger.info('Encerrando servidor...')
      server.close(async () => {
        logger.info('Servidor encerrado')
        try {
          await mongoose.connection.close(false)
          logger.info('Conexão com MongoDB encerrada')
        } catch (err) {
          logger.error('Erro ao fechar conexão do MongoDB:', err)
        }
        process.exit(0)
      })
    })
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer() 