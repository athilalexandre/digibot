const botService = require('../services/bot')
const config = require('../config')
const logger = require('../utils/logger').createModuleLogger('BotController')

// Iniciar bot
exports.startBot = async (req, res) => {
  try {
    // Atualize as configs globais do backend com os dados recebidos do frontend
    const { username, oauth, channel } = req.body;
    if (username) config.botUsername = username;
    if (oauth) config.botOauthToken = oauth;
    if (channel) config.channelName = channel;
    await botService.start()
    res.json({ message: 'Bot iniciado com sucesso!' })
  } catch (error) {
    if (error.message === 'Bot já está conectado') {
      res.status(200).json({ message: 'Bot já está conectado.' })
    } else {
      logger.error('Erro ao iniciar bot:', error)
      res.status(500).json({ message: 'Erro ao iniciar bot' })
    }
  }
}

// Parar bot
exports.stopBot = async (req, res) => {
  try {
    await botService.stop()
    res.json({ message: 'Bot parado com sucesso' })
  } catch (error) {
    logger.error('Erro ao parar bot:', error)
    res.status(500).json({ message: 'Erro ao parar bot' })
  }
}

// Status do bot
exports.getStatus = async (req, res) => {
  try {
    const status = botService.getStatus()
    res.json(status)
  } catch (error) {
    logger.error('Erro ao obter status do bot:', error)
    res.status(500).json({ message: 'Erro ao obter status do bot' })
  }
}

// Configurações do bot
exports.getConfig = async (req, res) => {
  try {
    res.json({
      username: config.botUsername,
      channel: config.channelName,
      mongoPath: config.mongoPath,
      mongoUri: config.mongoUri
    })
  } catch (error) {
    logger.error('Erro ao obter configurações do bot:', error)
    res.status(500).json({ message: 'Erro ao obter configurações do bot' })
  }
}

// Atualizar configurações
exports.updateConfig = async (req, res) => {
  try {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'channel', 'mongoPath', 'mongoUri']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Atualizações inválidas' })
    }

    // TODO: Implementar atualização de configurações
    res.json({ message: 'Configurações atualizadas com sucesso' })
  } catch (error) {
    logger.error('Erro ao atualizar configurações:', error)
    res.status(500).json({ message: 'Erro ao atualizar configurações' })
  }
}

// Enviar mensagem
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body
    await botService.sendMessage(message)
    res.json({ message: 'Mensagem enviada com sucesso' })
  } catch (error) {
    logger.error('Erro ao enviar mensagem:', error)
    res.status(500).json({ message: 'Erro ao enviar mensagem' })
  }
} 