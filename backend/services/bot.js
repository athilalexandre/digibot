const tmi = require('tmi.js')
const config = require('../config')
const logger = require('../utils/logger').createModuleLogger('BotService')
const Command = require('../models/command')
const Tammer = require('../models/tammer');
const DigimonData = require('../models/digimonData');
const digimonCatalog = require('../../src/data/digimon_catalog.json');
const fs = require('fs');
const path = require('path');
const coinConfigPath = path.join(__dirname, '../config/coinConfig.json');
const bossCatalog = require('../../src/data/boss_catalog.js');
const raidBossCatalog = require('../../src/data/raid_boss_catalog.js');

// Função utilitária para sortear um Digimon inicial
function getRandomStarterDigimon() {
  // Filtra apenas os Digimon de estágio Child (iniciais)
  const starters = digimonCatalog.filter(d => d.stage === 'Child');
  return starters[Math.floor(Math.random() * starters.length)];
}

function getCoinValue() {
  try {
    const data = fs.readFileSync(coinConfigPath, 'utf-8');
    return JSON.parse(data).coinValue || 100;
  } catch {
    return 100;
  }
}

function setCoinValue(value) {
  fs.writeFileSync(coinConfigPath, JSON.stringify({ coinValue: value }, null, 2));
}

let activeBoss = null;
let bossTimeout = null;
let raidParticipants = [];
let raidActive = false;
let duelRequests = {};

function summonRandomBoss() {
  const idx = Math.floor(Math.random() * bossCatalog.length);
  return bossCatalog[idx];
}

function summonRandomRaidBoss() {
  const idx = Math.floor(Math.random() * raidBossCatalog.length);
  return raidBossCatalog[idx];
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
    // Desativando completamente o handler de mensagens do bot antigo
    // para evitar conflitos com o novo sistema em /src/bot/bot.js.
    // Esta função não fará mais nada.
    return;

    /* CÓDIGO ANTIGO DESATIVADO
    if (self) return;

    const username = userstate['display-name'];
    const twitchUserId = userstate['user-id'];

    // ... (todo o resto do código da função foi desativado) ...

    */
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