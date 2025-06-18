const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan')
const config = require('./config')
const logger = require('./utils/logger').createModuleLogger('Server')

// Importando rotas
const authRoutes = require('./routes/auth')
const botRoutes = require('./routes/bot')
const commandRoutes = require('./routes/command')
const userRoutes = require('./routes/user')

const app = express()

// Middlewares
app.use(helmet())
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}))
app.use(express.json())
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax
})
app.use(limiter)

// Rotas
app.use('/api/auth', authRoutes)
app.use('/api/bot', botRoutes)
app.use('/api/commands', commandRoutes)
app.use('/api/users', userRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
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
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    logger.info('Conectado ao MongoDB')

    const server = app.listen(config.port, () => {
      logger.info(`Servidor rodando na porta ${config.port}`)
    })

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Encerrando servidor...')
      server.close(() => {
        logger.info('Servidor encerrado')
        mongoose.connection.close(false, () => {
          logger.info('Conexão com MongoDB encerrada')
          process.exit(0)
        })
      })
    })

    process.on('SIGTERM', () => {
      logger.info('Encerrando servidor...')
      server.close(() => {
        logger.info('Servidor encerrado')
        mongoose.connection.close(false, () => {
          logger.info('Conexão com MongoDB encerrada')
          process.exit(0)
        })
      })
    })
  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

startServer() 