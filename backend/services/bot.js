const tmi = require('tmi.js')
const config = require('../config')
const logger = require('../utils/logger').createModuleLogger('BotService')
const Command = require('../models/command')

class BotService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.commands = new Map()
  }

  // Inicializa o cliente Twitch
  initClient() {
    if (this.client) {
      return this.client
    }

    const clientConfig = {
      options: {
        debug: process.env.NODE_ENV === 'development'
      },
      connection: {
        secure: true,
        reconnect: true
      },
      identity: {
        username: config.botUsername,
        password: config.botOauthToken
      },
      channels: [config.channelName]
    }

    this.client = new tmi.client(clientConfig)

    // Eventos do cliente
    this.client.on('connected', (addr, port) => {
      logger.info(`Conectado ao Twitch em ${addr}:${port}`)
      this.isConnected = true
      // Logs avançados para diagnóstico
      logger.info(`Bot username: ${config.botUsername}`)
      logger.info(`Canal configurado: ${config.channelName}`)
      if (config.botOauthToken) {
        logger.info(`Token OAuth: ${config.botOauthToken.slice(0, 8)}...${config.botOauthToken.slice(-4)} (tamanho: ${config.botOauthToken.length})`)
      } else {
        logger.warn('Token OAuth não configurado!')
      }
      logger.info(`Status de conexão do client: ${this.client.readyState}`)
      // Mensagem automática de boas-vindas no chat, com tratamento de erro
      this.client.say(config.channelName, '🤖 DigiBot está online! Use !entrar para começar sua aventura.')
        .then(() => {
          logger.info('Mensagem de boas-vindas enviada com sucesso.')
        })
        .catch(err => {
          logger.error('Erro ao enviar mensagem de boas-vindas no chat da Twitch:', err && (err.stack || err.message || err))
        })
    })

    this.client.on('disconnected', (reason) => {
      logger.warn(`Desconectado do Twitch: ${reason}`)
      this.isConnected = false
    })

    this.client.on('message', this.handleMessage.bind(this))

    return this.client
  }

  // Inicia o bot
  async start() {
    try {
      logger.info('Iniciando processo de start do bot...')
      if (this.isConnected) {
        logger.warn('Tentativa de iniciar bot, mas ele já está conectado.')
        throw new Error('Bot já está conectado')
      }

      logger.info('Inicializando cliente Twitch...')
      const client = this.initClient()
      logger.info('Conectando cliente Twitch...')
      await client.connect()
      logger.info('Cliente Twitch conectado.')

      // Garante que o mongoose está conectado antes de carregar comandos
      const mongoose = require('mongoose')
      logger.info('Verificando conexão com MongoDB...')
      if (mongoose.connection.readyState !== 1) {
        logger.warn('MongoDB não está conectado, aguardando evento de conexão...')
        await new Promise((resolve, reject) => {
          mongoose.connection.once('connected', () => {
            logger.info('MongoDB conectado (evento).')
            resolve()
          })
          mongoose.connection.once('error', (err) => {
            logger.error('Erro ao conectar ao MongoDB:', err)
            reject(new Error('Erro ao conectar ao MongoDB: ' + err))
          })
        })
      } else {
        logger.info('MongoDB já está conectado.')
      }
      logger.info('Carregando comandos do banco de dados...')
      await this.loadCommands()
      logger.info('Comandos carregados com sucesso.')

      return true
    } catch (error) {
      logger.error('Erro ao iniciar bot (detalhado):', error)
      throw error
    }
  }

  // Para o bot
  async stop() {
    try {
      if (!this.isConnected) {
        throw new Error('Bot não está conectado')
      }

      await this.client.disconnect()
      this.client = null
      this.isConnected = false
      this.commands.clear()

      return true
    } catch (error) {
      logger.error('Erro ao parar bot:', error)
      throw error
    }
  }

  // Carrega os comandos do banco de dados
  async loadCommands() {
    try {
      const commands = await Command.find({ isEnabled: true })
      this.commands.clear()

      for (const command of commands) {
        this.commands.set(command.name, command)
        if (command.aliases && command.aliases.length > 0) {
          for (const alias of command.aliases) {
            this.commands.set(alias, command)
          }
        }
      }

      logger.info(`Carregados ${this.commands.size} comandos`)
    } catch (error) {
      logger.error('Erro ao carregar comandos:', error)
      throw error
    }
  }

  // Manipula mensagens recebidas
  async handleMessage(channel, userstate, message, self) {
    if (self) return

    try {
      // Verifica se é um comando
      if (!message.startsWith('!')) return

      const [commandName, ...args] = message.slice(1).split(' ')
      const command = this.commands.get(commandName)

      if (!command) return

      // Verifica se o comando pode ser usado
      const canUse = await command.canUse(userstate)
      if (!canUse) {
        await this.client.say(channel, `@${userstate.username}, você não pode usar este comando agora`)
        return
      }

      // Registra o uso do comando
      await command.use()

      // TODO: Implementar lógica de execução do comando
      await this.client.say(channel, `@${userstate.username}, comando ${commandName} executado com sucesso!`)
    } catch (error) {
      logger.error('Erro ao processar mensagem:', error)
    }
  }

  // Envia uma mensagem para o chat
  async sendMessage(message) {
    try {
      if (!this.isConnected) {
        throw new Error('Bot não está conectado')
      }

      await this.client.say(config.channelName, message)
      return true
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error)
      throw error
    }
  }

  // Obtém o status do bot
  getStatus() {
    return {
      isConnected: this.isConnected,
      channel: config.channelName,
      username: config.botUsername,
      commandsCount: this.commands.size
    }
  }
}

module.exports = new BotService() 