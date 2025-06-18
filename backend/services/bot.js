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
      if (this.isConnected) {
        throw new Error('Bot já está conectado')
      }

      const client = this.initClient()
      await client.connect()
      await this.loadCommands()

      return true
    } catch (error) {
      logger.error('Erro ao iniciar bot:', error)
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