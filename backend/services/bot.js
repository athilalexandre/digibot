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
        const digitamaStats = { forca: 1, defesa: 1, velocidade: 1, sabedoria: 1 };
        tammer = await Tammer.create({
          twitchUserId,
          username,
          currentDigimonId: null,
          digimonName: 'Digitama',
          digimonStage: 'Digitama',
          digimonLevel: 1,
          digimonXp: 0,
          digimonHp: 10,
          digimonMp: 10,
          digimonStats: digitamaStats,
          bits: 100
        })
        logger.info(`[handleMessage] Tammer criado: ${tammer.username}`)
        await this.client.say(channel, `@${username}, parabéns! Você entrou no DigiBot e recebeu um Digitama. Ganhe XP para chocá-lo usando !chocar quando estiver pronto!`)
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
        await this.client.say(channel, `@${username} | Digimon: ${digimon.name} | Nível: ${tammer.digimonLevel} | XP: ${tammer.digimonXp} | HP: ${tammer.digimonHp} | Stage: ${digimon.stage} | Bits: ${tammer.bits}`)
        return
      }
      if ((commandName === 'givebits' || commandName === 'removebits' || commandName === 'setcoinvalue')) {
        // Checagem de permissão: só mods/admins
        const isMod = userstate.mod || userstate['user-type'] === 'mod' || userstate.badges?.broadcaster === '1';
        if (!isMod) {
          await this.client.say(channel, `@${username}, você não tem permissão para usar este comando.`);
          return;
        }
      }
      if (commandName === 'givebits' && args.length === 2) {
        // !givebits <username> <quantidade>
        const [targetUser, amountStr] = args
        const amount = parseInt(amountStr)
        if (isNaN(amount) || amount <= 0) {
          await this.client.say(channel, `@${username}, valor inválido para bits.`)
          return
        }
        const targetTammer = await Tammer.findOne({ username: targetUser })
        if (!targetTammer) {
          await this.client.say(channel, `@${username}, usuário alvo não encontrado.`)
          return
        }
        targetTammer.bits += amount
        await targetTammer.save()
        await this.client.say(channel, `@${username} deu ${amount} bits para ${targetUser}.`)
        return
      }
      if (commandName === 'removebits' && args.length === 2) {
        // !removebits <username> <quantidade>
        const [targetUser, amountStr] = args
        const amount = parseInt(amountStr)
        if (isNaN(amount) || amount <= 0) {
          await this.client.say(channel, `@${username}, valor inválido para bits.`)
          return
        }
        const targetTammer = await Tammer.findOne({ username: targetUser })
        if (!targetTammer) {
          await this.client.say(channel, `@${username}, usuário alvo não encontrado.`)
          return
        }
        targetTammer.bits = Math.max(0, targetTammer.bits - amount)
        await targetTammer.save()
        await this.client.say(channel, `@${username} removeu ${amount} bits de ${targetUser}.`)
        return
      }
      if (commandName === 'setcoinvalue' && args.length === 1) {
        // !setcoinvalue <valor>
        const value = parseInt(args[0])
        if (isNaN(value) || value < 0) {
          await this.client.say(channel, `@${username}, valor inválido para coin value.`)
          return
        }
        setCoinValue(value)
        await this.client.say(channel, `@${username}, valor base das bits definido para ${value}.`)
        return
      }
      if (commandName === 'resetgame') {
        // Checagem de permissão: só mods/admins
        const isMod = userstate.mod || userstate['user-type'] === 'mod' || userstate.badges?.broadcaster === '1';
        if (!isMod) {
          await this.client.say(channel, `@${username}, você não tem permissão para usar este comando.`);
          return;
        }
        await Tammer.deleteMany({});
        await this.client.say(channel, `@${username}, todos os jogadores foram resetados. O jogo foi reiniciado!`);
        return;
      }
      if (commandName === 'chocar') {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        const xpToHatch = 100;
        if (tammer.digimonStage !== 'Digitama') {
          await this.client.say(channel, `@${username}, seu Digitama já chocou!`);
          return;
        }
        if (tammer.digimonXp < xpToHatch) {
          await this.client.say(channel, `@${username}, seu Digitama precisa de mais XP para chocar! (XP atual: ${tammer.digimonXp}/${xpToHatch})`);
          return;
        }
        const starter = getRandomStarterDigimon();
        let digimonData = await DigimonData.findOne({ name: starter.name });
        if (!digimonData) {
          digimonData = await DigimonData.create(starter);
        }
        tammer.currentDigimonId = digimonData._id;
        tammer.digimonName = digimonData.name;
        tammer.digimonStage = digimonData.stage;
        tammer.digimonLevel = 1;
        tammer.digimonHp = digimonData.baseStats.hp;
        tammer.digimonStats = { ...digimonData.baseStats };
        tammer.digimonXp = 0;
        await tammer.save();
        await this.client.say(channel, `@${username}, parabéns! Seu Digitama chocou e virou ${digimonData.name} (${digimonData.stage})!`);
        return;
      }
      if (commandName === 'rank') {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        await this.client.say(channel, `@${username}, seu rank atual é: ${tammer.rank || 'Normal Tamer'}`);
        return;
      }
      if (commandName === 'rankup') {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        const ranks = [
          'Normal Tamer', 'Bronze Tamer', 'Silver Tamer', 'Gold Tamer', 'Platinum Tamer', 'Elite Tamer', 'Legendary Tamer'
        ];
        const xpReqs = [0, 1000, 3000, 6000, 10000, 20000, 40000];
        const coinReqs = [0, 100, 300, 600, 1000, 2000, 4000];
        const timeReqs = [0, 1, 3, 6, 12, 24, 48]; // horas desde createdAt
        const currentRankIdx = ranks.indexOf(tammer.rank || 'Normal Tamer');
        if (currentRankIdx === -1 || currentRankIdx === ranks.length - 1) {
          await this.client.say(channel, `@${username}, você já está no rank máximo!`);
          return;
        }
        const nextIdx = currentRankIdx + 1;
        const now = new Date();
        const diffHours = (now - (tammer.createdAt || now)) / (1000 * 60 * 60);
        if (
          tammer.digimonXp < xpReqs[nextIdx] ||
          tammer.bits < coinReqs[nextIdx] ||
          diffHours < timeReqs[nextIdx]
        ) {
          await this.client.say(channel, `@${username}, requisitos para subir de rank (${ranks[nextIdx]}): XP: ${xpReqs[nextIdx]}, Bits: ${coinReqs[nextIdx]}, Tempo: ${timeReqs[nextIdx]}h. Seu XP: ${tammer.digimonXp}, Bits: ${tammer.bits}, Tempo: ${Math.floor(diffHours)}h.`);
          return;
        }
        tammer.rank = ranks[nextIdx];
        tammer.bits -= coinReqs[nextIdx];
        await tammer.save();
        await this.client.say(channel, `@${username}, parabéns! Você subiu para o rank ${tammer.rank}!`);
        return;
      }
      if (commandName === 'summonboss') {
        // Só mod/admin
        const isMod = userstate.mod || userstate['user-type'] === 'mod' || userstate.badges?.broadcaster === '1';
        if (!isMod) {
          await this.client.say(channel, `@${username}, você não tem permissão para usar este comando.`);
          return;
        }
        if (activeBoss) {
          await this.client.say(channel, `Já existe um boss ativo: ${activeBoss.name}. Use !boss para enfrentá-lo!`);
          return;
        }
        activeBoss = summonRandomBoss();
        await this.client.say(channel, `⚡ Um Boss selvagem apareceu: ${activeBoss.name} (Stage: ${activeBoss.stage})! Use !boss para desafiar!`);
        // Boss some após 2 minutos se não for derrotado
        bossTimeout = setTimeout(() => { activeBoss = null; this.client.say(channel, 'O boss desapareceu!'); }, 2 * 60 * 1000);
        return;
      }
      if (commandName === 'boss') {
        if (!activeBoss) {
          await this.client.say(channel, `Não há boss ativo no momento. Aguarde um admin invocar com !summonboss.`);
          return;
        }
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        if (tammer.digimonStage === 'Digitama') {
          await this.client.say(channel, `@${username}, seu Digitama não pode batalhar!`);
          return;
        }
        // Lógica simples de batalha de boss
        const playerPower = tammer.digimonStats.forca + tammer.digimonStats.defesa + tammer.digimonStats.velocidade + tammer.digimonStats.sabedoria;
        const bossPower = activeBoss.baseStats.forca + activeBoss.baseStats.defesa + activeBoss.baseStats.velocidade + activeBoss.baseStats.sabedoria;
        if (playerPower >= bossPower) {
          const xp = 500 + Math.floor(Math.random() * 500);
          const bits = 200 + Math.floor(Math.random() * 200);
          tammer.digimonXp += xp;
          tammer.bits += bits;
          await tammer.save();
          await this.client.say(channel, `@${username}, você derrotou o boss ${activeBoss.name}! Ganhou ${xp} XP e ${bits} bits!`);
          activeBoss = null;
          if (bossTimeout) clearTimeout(bossTimeout);
        } else {
          tammer.digimonHp = Math.max(0, tammer.digimonHp - 20);
          await tammer.save();
          await this.client.say(channel, `@${username}, você perdeu para o boss ${activeBoss.name} e perdeu 20 HP!`);
        }
        return;
      }
      if (commandName === 'raid') {
        if (raidActive) {
          await this.client.say(channel, `Uma raid já está em andamento! Aguarde terminar.`);
          return;
        }
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        if (tammer.digimonStage === 'Digitama') {
          await this.client.say(channel, `@${username}, seu Digitama não pode participar de raids!`);
          return;
        }
        if (raidParticipants.find(u => u.twitchUserId === twitchUserId)) {
          await this.client.say(channel, `@${username}, você já está na fila da raid!`);
          return;
        }
        raidParticipants.push({ twitchUserId, username });
        await this.client.say(channel, `@${username} entrou na raid! (${raidParticipants.length}/3)`);
        if (raidParticipants.length >= 3) {
          raidActive = true;
          const boss = summonRandomRaidBoss();
          await this.client.say(channel, `🔥 A RAID começou! Boss: ${boss.name} (Stage: ${boss.stage})!`);
          // Calcular força total dos jogadores
          const tammers = await Tammer.find({ twitchUserId: { $in: raidParticipants.map(u => u.twitchUserId) } });
          const totalPlayerDef = tammers.reduce((sum, t) => sum + (t.digimonStats.defesa || 0), 0);
          const bossPower = boss.baseStats.forca + boss.baseStats.defesa + boss.baseStats.velocidade + boss.baseStats.sabedoria;
          if (bossPower > totalPlayerDef) {
            // Raid falhou
            for (const t of tammers) {
              t.digimonHp = Math.max(0, Math.floor(t.digimonHp * 0.7));
              await t.save();
            }
            await this.client.say(channel, `A raid falhou! Todos perderam 30% do HP. Se ficou com menos de 3, seu Digimon virou Digitama.`);
          } else {
            // Raid vencida
            for (const t of tammers) {
              t.digimonXp += 500;
              t.bits += 200;
              await t.save();
            }
            await this.client.say(channel, `Parabéns! Vocês venceram a raid e ganharam 500 XP e 200 bits cada!`);
          }
          raidParticipants = [];
          raidActive = false;
        }
        return;
      }
      if (commandName === 'duelo' && args.length === 1) {
        const targetUser = args[0].toLowerCase();
        if (targetUser === username.toLowerCase()) {
          await this.client.say(channel, `@${username}, você não pode duelar contra si mesmo!`);
          return;
        }
        duelRequests[targetUser] = username;
        await this.client.say(channel, `@${targetUser}, você foi desafiado para um duelo por @${username}! Use !aceitar para aceitar.`);
        return;
      }
      if (commandName === 'aceitar') {
        const challenger = duelRequests[username.toLowerCase()];
        if (!challenger) {
          await this.client.say(channel, `@${username}, você não foi desafiado para um duelo!`);
          return;
        }
        const tammer1 = await Tammer.findOne({ username: challenger });
        const tammer2 = await Tammer.findOne({ username });
        if (!tammer1 || !tammer2) {
          await this.client.say(channel, `@${username}, não foi possível encontrar ambos os jogadores para o duelo.`);
          delete duelRequests[username.toLowerCase()];
          return;
        }
        if (tammer1.digimonStage === 'Digitama' || tammer2.digimonStage === 'Digitama') {
          await this.client.say(channel, `@${username}, ambos precisam ter pelo menos Baby I para duelar!`);
          delete duelRequests[username.toLowerCase()];
          return;
        }
        // Determina quem ataca primeiro (maior velocidade)
        const first = tammer1.digimonStats.velocidade >= tammer2.digimonStats.velocidade ? tammer1 : tammer2;
        const second = first === tammer1 ? tammer2 : tammer1;
        // Ataque 1
        let damage = first.digimonStats.forca - second.digimonStats.defesa;
        damage = Math.max(0, damage);
        let secondHp = second.digimonHp - damage;
        // Ataque 2
        let damage2 = second.digimonStats.forca - first.digimonStats.defesa;
        damage2 = Math.max(0, damage2);
        let firstHp = first.digimonHp - damage2;
        // Decide vencedor
        let winner, loser;
        if ((secondHp < firstHp) || (secondHp <= 0 && firstHp > 0)) {
          winner = first;
          loser = second;
        } else if ((firstHp < secondHp) || (firstHp <= 0 && secondHp > 0)) {
          winner = second;
          loser = first;
        } else {
          await this.client.say(channel, `O duelo terminou empatado! Ambos resistiram bravamente.`);
          delete duelRequests[username.toLowerCase()];
          return;
        }
        // Atualiza HP e bits
        winner.bits += 5;
        loser.bits = Math.max(0, loser.bits - 5);
        if (loser.digimonHp <= 0 || firstHp <= 0 || secondHp <= 0) {
          loser.digimonStage = 'Digitama';
        }
        winner.digimonHp = Math.max(1, firstHp > secondHp ? firstHp : secondHp);
        loser.digimonHp = Math.max(0, firstHp < secondHp ? firstHp : secondHp);
        await winner.save();
        await loser.save();
        await this.client.say(channel, `@${winner.username} venceu o duelo e ganhou 5 bits! @${loser.username} perdeu 5 bits${loser.digimonStage === 'Digitama' ? ' e voltou a ser Digitama!' : ''}`);
        delete duelRequests[username.toLowerCase()];
        return;
      }
      if (commandName === 'ficha') {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        if (tammer.digimonStage === 'Digitama') {
          await this.client.say(channel, `@${username} | Digimon: Digitama | Estágio: Digitama | XP: ${tammer.digimonXp} | Bits: ${tammer.bits}`);
          return;
        }
        await this.client.say(channel, `@${username} | Digimon: ${tammer.digimonName} | Estágio: ${tammer.digimonStage} | Nível: ${tammer.digimonLevel} | XP: ${tammer.digimonXp} | Bits: ${tammer.bits} | Status: Força ${tammer.digimonStats.forca}, Defesa ${tammer.digimonStats.defesa}, Velocidade ${tammer.digimonStats.velocidade}, Sabedoria ${tammer.digimonStats.sabedoria}`);
        return;
      }
      if (commandName === 'comprarbits' && args.length === 1) {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
          await this.client.say(channel, `@${username}, valor inválido para compra de bits.`);
          return;
        }
        const tammer = await Tammer.findOne({ twitchUserId });
        if (!tammer) {
          await this.client.say(channel, `@${username}, você ainda não entrou no DigiBot. Use !entrar para começar!`);
          return;
        }
        tammer.bits += amount;
        await tammer.save();
        await this.client.say(channel, `@${username}, você comprou ${amount} bits! (Simulação)`);
        return;
      }
      if (commandName === 'corrigirEstagios') {
        // Só mod/admin
        const isMod = userstate.mod || userstate['user-type'] === 'mod' || userstate.badges?.broadcaster === '1';
        if (!isMod) {
          await this.client.say(channel, `@${username}, você não tem permissão para usar este comando.`);
          return;
        }
        const { exec } = require('child_process');
        exec('node backend/scripts/fixDigimonStages.js', (err, stdout, stderr) => {
          if (err) {
            this.client.say(channel, `Erro ao corrigir estágios: ${err.message}`);
            return;
          }
          this.client.say(channel, `Estágios corrigidos!`);
        });
        return;
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