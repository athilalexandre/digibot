const tmi = require('tmi.js')
const config = require('../config')
const logger = require('../utils/logger').createModuleLogger('BotService')
const Command = require('../models/command')
const Tammer = require('../../src/models/Tammer');
const DigimonData = require('../../src/models/DigimonData');
const digimonCatalog = require('../../src/data/digimon_catalog.json');

// Função utilitária para sortear um Digimon inicial
function getRandomStarterDigimon() {
  // Filtra apenas os Digimon de estágio Child (iniciais)
  const starters = digimonCatalog.filter(d => d.stage === 'Child');
  return starters[Math.floor(Math.random() * starters.length)];
}

class BotService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.commands = new Map()
    this.isConnecting = false
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
      if (this.isConnecting) {
        logger.warn('Tentativa de iniciar bot, mas ele já está em processo de conexão.')
        throw new Error('Bot está conectando')
      }
      this.isConnecting = true;
      logger.info('Inicializando cliente Twitch...')
      const client = this.initClient()
      logger.info('Conectando cliente Twitch...')
      await client.connect()
      logger.info('Cliente Twitch conectado.')
      // Garante que o mongoose está conectado antes de carregar comandos, mas não bloqueia resposta
      const mongoose = require('mongoose')
      logger.info('Verificando conexão com MongoDB...')
      if (mongoose.connection.readyState !== 1) {
        logger.warn('MongoDB não está conectado, aguardando evento de conexão...')
        mongoose.connection.once('connected', async () => {
          logger.info('MongoDB conectado, carregando comandos...')
          await this.loadCommands()
          this.isConnected = true
          this.isConnecting = false
        })
        mongoose.connection.once('error', (err) => {
          logger.error('Erro ao conectar ao MongoDB: ' + err)
          this.isConnecting = false
        })
        // Retorna sucesso imediatamente, comandos serão carregados em background
        return 'Bot está conectando (MongoDB em background)';
      }
      await this.loadCommands()
      this.isConnected = true
      this.isConnecting = false
      return true
    } catch (error) {
      this.isConnecting = false
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

    // Garante que o MongoDB está conectado antes de processar comandos
    const mongoose = require('mongoose')
    if (mongoose.connection.readyState !== 1) {
      await this.client.say(channel, '⏳ O sistema está inicializando. Tente novamente em alguns segundos!')
      return
    }

    // Log avançado de recebimento de mensagem
    logger.info(`[handleMessage] Mensagem recebida | Canal: ${channel} | Usuário: ${userstate.username} | Mensagem: ${message}`)

    try {
      // Verifica se é um comando
      if (!message.startsWith('!')) return

      const [commandName, ...args] = message.slice(1).split(' ')
      logger.info(`[handleMessage] Comando detectado: ${commandName} | Args: ${args.join(' ')} | Usuário: ${userstate.username}`)
      const command = this.commands.get(commandName)
      const username = userstate.username
      const twitchUserId = userstate['user-id']

      // Lógica real dos comandos principais
      if (commandName === 'entrar') {
        logger.info(`[handleMessage] Executando !entrar para ${username} (${twitchUserId})`)
        let tammer = await Tammer.findOne({ twitchUserId })
        logger.info(`[handleMessage] Tammer encontrado: ${!!tammer}`)
        if (tammer) {
          await this.client.say(channel, `@${username}, você já iniciou sua jornada! Use !digimon para ver seu status.`)
          return
        }
        const starter = getRandomStarterDigimon()
        logger.info(`[handleMessage] Starter sorteado: ${starter.name}`)
        let digimonData = await DigimonData.findOne({ name: starter.name })
        logger.info(`[handleMessage] DigimonData encontrado: ${!!digimonData}`)
        if (!digimonData) {
          digimonData = await DigimonData.create(starter)
          logger.info(`[handleMessage] DigimonData criado: ${digimonData.name}`)
        }
        tammer = await Tammer.create({
          twitchUserId,
          username,
          currentDigimonId: digimonData._id,
          digimonName: digimonData.name,
          digimonStage: digimonData.stage,
          digimonLevel: 1,
          digimonHp: digimonData.baseStats.hp,
          digimonMp: 10,
          digimonStats: {
            forca: digimonData.baseStats.forca,
            defesa: digimonData.baseStats.defesa,
            velocidade: digimonData.baseStats.velocidade,
            sabedoria: digimonData.baseStats.sabedoria
          },
          coins: 100
        })
        logger.info(`[handleMessage] Tammer criado: ${tammer.username}`)
        await this.client.say(channel, `@${username}, parabéns! Você entrou no DigiBot e recebeu um Digitama: ${digimonData.name}. Use !digimon para ver seu status.`)
        return
      }
      if (commandName === 'digimon') {
        logger.info(`[handleMessage] Executando !digimon para ${username} (${twitchUserId})`)
        const tammer = await Tammer.findOne({ twitchUserId })
        logger.info(`[handleMessage] Tammer encontrado: ${!!tammer}`)
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`)
          return
        }
        const digimon = await DigimonData.findById(tammer.currentDigimonId)
        logger.info(`[handleMessage] DigimonData encontrado: ${!!digimon}`)
        if (!digimon) {
          await this.client.say(channel, `@${username}, seu Digimon não foi encontrado. Contate um admin.`)
          return
        }
        await this.client.say(channel, `@${username} | Digimon: ${digimon.name} | Nível: ${tammer.digimonLevel} | XP: ${tammer.digimonXp} | HP: ${tammer.digimonHp} | Stage: ${digimon.stage} | Coins: ${tammer.coins}`)
        return
      }
      if (commandName === 'givecoins' && args.length === 2) {
        // !givecoins <username> <quantidade>
        const [targetUser, amountStr] = args
        const amount = parseInt(amountStr)
        if (isNaN(amount) || amount <= 0) {
          await this.client.say(channel, `@${username}, valor inválido para coins.`)
          return
        }
        const targetTammer = await Tammer.findOne({ username: targetUser })
        if (!targetTammer) {
          await this.client.say(channel, `@${username}, usuário alvo não encontrado.`)
          return
        }
        targetTammer.coins += amount
        await targetTammer.save()
        await this.client.say(channel, `@${username} deu ${amount} coins para ${targetUser}.`)
        return
      }
      if (commandName === 'removecoins' && args.length === 2) {
        // !removecoins <username> <quantidade>
        const [targetUser, amountStr] = args
        const amount = parseInt(amountStr)
        if (isNaN(amount) || amount <= 0) {
          await this.client.say(channel, `@${username}, valor inválido para coins.`)
          return
        }
        const targetTammer = await Tammer.findOne({ username: targetUser })
        if (!targetTammer) {
          await this.client.say(channel, `@${username}, usuário alvo não encontrado.`)
          return
        }
        targetTammer.coins = Math.max(0, targetTammer.coins - amount)
        await targetTammer.save()
        await this.client.say(channel, `@${username} removeu ${amount} coins de ${targetUser}.`)
        return
      }
      if (commandName === 'setcoinvalue' && args.length === 1) {
        // !setcoinvalue <valor>
        const value = parseInt(args[0])
        if (isNaN(value) || value < 0) {
          await this.client.say(channel, `@${username}, valor inválido para coin value.`)
          return
        }
        // Aqui você pode salvar em algum config global, por simplicidade só responde
        await this.client.say(channel, `@${username}, valor base das coins definido para ${value}. (Ajuste real em config não implementado)`)
        return
      }

      // Comandos já integrados: !treinar, !batalhar, !atacar, !fugir
      // Delegar para os módulos existentes
      const { processTrainingCommands } = require('../../src/bot/game_mechanics/training/training_commands')
      const { processBattleCommands } = require('../../src/bot/game_mechanics/battle/battle_commands')
      if (await processTrainingCommands(channel, userstate, message, this.client)) return
      if (await processBattleCommands(channel, userstate, message, this.client)) return

      // Se não reconhecido, responde padrão
      if (command) {
        await this.client.say(channel, `@${username}, comando ${commandName} executado com sucesso!`)
      }
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