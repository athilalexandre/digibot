// Arquivo principal do bot da Twitch
const tmi = require('tmi.js');
const connectDB = require('../database/mongodb');
const Tammer = require('../../backend/models/tammer');
const BotConfig = require('../models/BotConfig');
const DigimonData = require('../../backend/models/digimonData');
const config = require('../config');
const { addXp } = require('./xpSystem');
const { processTrainingCommands } = require('./game_mechanics/training/training_commands.js');
const { processBattleCommands } = require('./game_mechanics/battle/battle_commands.js');
const { processShopCommands } = require('./game_mechanics/shop/shop_commands.js');
const { startSpawner } = require('./wild_digimon_spawner.js');
const { scheduleNextShopEvent } = require('./game_mechanics/shop/shop_system.js');
const seedDigimonDatabase = require('../database/seedDigimonData');

// Configurações do bot
const opts = {
  identity: {
    username: config.twitchUsername,
    password: config.twitchOAuth,
  },
  channels: [
    config.twitchChannel,
  ],
  connection: {
    secure: true,
    reconnect: true,
    maxReconnectAttempts: 5,
    maxReconnectInterval: 30000
  }
};

// Cria o cliente do bot
const client = new tmi.client(opts);

// Registra os handlers de eventos
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);
client.on('reconnect', onReconnectHandler);

// Função principal de inicialização
async function initializeBot() {
  try {
    console.log('Iniciando bot com as seguintes configurações:');
    console.log('Username:', config.twitchUsername);
    console.log('Canal:', config.twitchChannel);
    console.log('Token OAuth:', config.twitchOAuth ? 'Presente' : 'Ausente');

    // Conecta ao MongoDB primeiro
    await connectDB();
    console.log('Conectado ao MongoDB');

    // Inicia o seed do banco de dados
    await seedDigimonDatabase();
    console.log('Banco de dados populado com sucesso');

    // Inicia o sistema de eventos da loja
    scheduleNextShopEvent();
    console.log('Sistema de loja iniciado');

    // Conecta o bot ao chat da Twitch
    console.log('Tentando conectar ao chat da Twitch...');
    await client.connect();
    console.log('Bot iniciado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar o bot:', error);
    process.exit(1);
  }
}

// Handler para quando o bot conectar
function onConnectedHandler(addr, port) {
  console.log(`* Conectado a ${addr}:${port} como ${config.twitchUsername} no canal ${config.twitchChannel}`);
  client.say(config.twitchChannel, `Digibot está online e pronto para a aventura! Use !entrar para começar.`);
  startSpawner(client, config.twitchChannel);
}

// Handler para desconexão
function onDisconnectedHandler(reason) {
  console.log('Bot desconectado:', reason);
}

// Handler para reconexão
function onReconnectHandler() {
  console.log('Tentando reconectar...');
}

// Handler para mensagens
async function onMessageHandler(target, context, msg, self) {
  if (self) { return; }

  // Processa comandos de treino primeiro
  const trainingCommandProcessed = await processTrainingCommands(target, context, msg, client);
  if (trainingCommandProcessed) {
    return;
  }

  // Processa comandos de batalha
  const battleCommandProcessed = await processBattleCommands(target, context, msg, client);
  if (battleCommandProcessed) {
    return;
  }

  // Processa comandos da loja
  const shopCommandProcessed = await processShopCommands(target, context, msg, client);
  if (shopCommandProcessed) {
    return;
  }

  // Lógica de parsing de comando existente
  const rawMessage = msg.trim();
  const parts = rawMessage.split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  const twitchUserId = context['user-id'];
  const username = context.username;

  // Comando !entrar
  if (command === '!entrar') {
    try {
      let tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        tammer = new Tammer({
          twitchUserId: twitchUserId,
          username: username,
          digimonName: `Digitama de ${username}`,
        });
        await tammer.save();
        client.say(target, `Bem-vindo ao Digibot, ${username}! Você recebeu um Digitama.`);
      } else {
        client.say(target, `${username}, você já está no jogo!`);
      }
    } catch (error) {
      console.error("Erro no comando !entrar:", error);
      client.say(target, "Ocorreu um erro ao processar o comando !entrar.");
    }
    return;
  }

  // Comando !ficha e seu alias !digimon
  if (command === '!ficha' || command === '!digimon') {
    try {
      const tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        return client.say(target, `${username}, você ainda não entrou no jogo. Use !entrar para começar.`);
      }

      let statusMessage = `${username}, seu Digimon: ${tammer.digimonName} (${tammer.digimonStage} - Nível ${tammer.digimonLevel}). XP: ${tammer.digimonXp}.`;

      if (tammer.digimonHp && tammer.digimonStats) {
        statusMessage += ` HP: ${tammer.digimonHp}, MP: ${tammer.digimonMp}, Força: ${tammer.digimonStats.forca}, Defesa: ${tammer.digimonStats.defesa}, Velocidade: ${tammer.digimonStats.velocidade}, Sabedoria: ${tammer.digimonStats.sabedoria}.`;
      }

      statusMessage += ` Bits: ${tammer.bits}, PBs: ${tammer.battlePoints}.`;

      // Mostra arma equipada
      if (tammer.hasWeapon()) {
        statusMessage += ` Arma: ${tammer.equippedWeapon.nome} ${tammer.equippedWeapon.emoji} (${tammer.equippedWeapon.raridade}).`;
      } else {
        statusMessage += ` Arma: Nenhuma equipada.`;
      }

      client.say(target, statusMessage);
    } catch (error) {
      console.error("Erro no comando !ficha:", error);
      client.say(target, "Ocorreu um erro ao buscar as informações do seu Digimon.");
    }
    return;
  }

  // Comandos de Moderador/Broadcaster
  const isModOrBroadcaster = context.mod || username.toLowerCase() === config.twitchChannel.substring(1).toLowerCase();

  if (command === '!givebits' && isModOrBroadcaster) {
    const targetUsername = args[0];
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !givebits <username> <quantidade>");
    }

    try {
      const targetTammer = await Tammer.findOneAndUpdate(
        { username: targetUsername },
        { $inc: { bits: amount } },
        { new: true, runValidators: true }
      );
      if (targetTammer) {
        client.say(target, `${amount} bits foram dadas para ${targetUsername}. Saldo atual: ${targetTammer.bits} bits.`);
      } else {
        client.say(target, `Usuário ${targetUsername} não encontrado.`);
      }
    } catch (error) {
      console.error("Erro no comando !givebits:", error);
      client.say(target, "Ocorreu um erro ao dar bits.");
    }
    return;
  }

  if (command === '!removebits' && isModOrBroadcaster) {
    const targetUsername = args[0];
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !removebits <username> <quantidade>");
    }

    try {
      const targetTammer = await Tammer.findOne({ username: targetUsername });
      if (!targetTammer) {
        return client.say(target, `Usuário ${targetUsername} não encontrado.`);
      }

      targetTammer.bits -= amount;
      if (targetTammer.bits < 0) targetTammer.bits = 0;
      await targetTammer.save();

      client.say(target, `${amount} bits foram removidas de ${targetUsername}. Saldo atual: ${targetTammer.bits} bits.`);
    } catch (error) {
      console.error("Erro no comando !removebits:", error);
      client.say(target, "Ocorreu um erro ao remover bits.");
    }
    return;
  }

  // Novos comandos de XP
  if (command === '!givexp' && isModOrBroadcaster) {
    const targetUsername = args[0];
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !givexp <username> <quantidade>");
    }

    try {
      const targetTammer = await Tammer.findOne({ username: targetUsername });
      if (targetTammer) {
        await addXp(targetTammer.twitchUserId, amount, client, target);
        client.say(target, `${amount} XP foram dados para ${targetUsername}.`);
      } else {
        client.say(target, `Usuário ${targetUsername} não encontrado.`);
      }
    } catch (error) {
      console.error("Erro no comando !givexp:", error);
      client.say(target, "Ocorreu um erro ao dar XP.");
    }
    return;
  }

  if (command === '!removexp' && isModOrBroadcaster) {
    const targetUsername = args[0];
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !removexp <username> <quantidade>");
    }

    try {
      const targetTammer = await Tammer.findOneAndUpdate(
        { username: targetUsername },
        { $inc: { digimonXp: -amount } },
        { new: true, runValidators: true }
      );
      if (targetTammer) {
        if (targetTammer.digimonXp < 0) {
          targetTammer.digimonXp = 0;
          await targetTammer.save();
        }
        client.say(target, `${amount} XP foram removidos de ${targetUsername}. XP atual: ${targetTammer.digimonXp}.`);
      } else {
        client.say(target, `Usuário ${targetUsername} não encontrado.`);
      }
    } catch (error) {
      console.error("Erro no comando !removexp:", error);
      client.say(target, "Ocorreu um erro ao remover XP.");
    }
    return;
  }

  if (command === '!testxp' && isModOrBroadcaster) {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !testxp <quantidade> (quantidade deve ser um número positivo).");
    }
    try {
      await addXp(twitchUserId, amount, client, target);
    } catch (error) {
      console.error("Erro no comando !testxp:", error);
      client.say(target, "Ocorreu um erro ao adicionar XP.");
    }
    return;
  }

  if (command === '!setdigimon' && isModOrBroadcaster) {
    const targetUsername = args[0];
    const newDigimonName = args.slice(1).join(' ');
    if (!targetUsername || !newDigimonName) {
      return client.say(target, "Uso: !setdigimon <username> <nomeDoDigimon>");
    }
    try {
      const tammerToUpdate = await Tammer.findOne({ username: targetUsername });
      if (!tammerToUpdate) {
        return client.say(target, `Tammer ${targetUsername} não encontrado.`);
      }
      const newDigimonData = await DigimonData.findOne({ name: new RegExp(`^${newDigimonName}$`, 'i') });
      if (!newDigimonData) {
        return client.say(target, `Digimon "${newDigimonName}" não encontrado no catálogo.`);
      }
      tammerToUpdate.digimonName = newDigimonData.name;
      tammerToUpdate.digimonStage = newDigimonData.stage;
      tammerToUpdate.currentDigimonId = newDigimonData._id;
      tammerToUpdate.digimonType = newDigimonData.type;
      if (newDigimonData.baseStats) {
        tammerToUpdate.digimonHp = newDigimonData.baseStats.hp;
        tammerToUpdate.digimonMp = newDigimonData.baseStats.mp || tammerToUpdate.digimonMp || 10;
        tammerToUpdate.digimonStats = { ...newDigimonData.baseStats };
      }
      tammerToUpdate.digimonLevel = 1;
      tammerToUpdate.digimonXp = 0;
      await tammerToUpdate.save();
      client.say(target, `O Digimon de ${targetUsername} foi alterado para ${newDigimonData.name} (${newDigimonData.stage} Nível ${tammerToUpdate.digimonLevel}). Status e XP resetados para a base.`);
    } catch (error) {
      console.error("Erro no comando !setdigimon:", error);
      client.say(target, "Ocorreu um erro ao tentar alterar o Digimon.");
    }
    return;
  }

  if (command === '!resetdigibot' && isModOrBroadcaster) {
    try {
      client.say(target, `Atenção, ${username}! Iniciando o reset completo do Digibot... Os dados de todos os jogadores serão apagados e o catálogo de Digimons será recarregado. Isso pode levar um momento.`);
      console.log(`[RESET COMMAND by ${username}] Iniciando o reset do banco de dados.`);
      const deleteTammersResult = await Tammer.deleteMany({});
      console.log(`[RESET COMMAND] Tammers deletados: ${deleteTammersResult.deletedCount}`);
      await BotConfig.deleteMany({});
      console.log('[RESET COMMAND] Configurações do Bot (BotConfig) foram deletadas.');
      console.log('[RESET COMMAND] Repopulando a coleção DigimonData...');
      const seedSuccess = await seedDigimonDatabase(true);
      client.say(target, seedSuccess ? "Digibot resetado com sucesso! Tudo pronto para um novo começo." : "Ocorreu um problema ao recarregar o catálogo de Digimons durante o reset. Verifique os logs.");
    } catch (error) {
      console.error("Erro crítico no comando !resetdigibot:", error);
      client.say(target, "Ocorreu um erro crítico durante o reset do Digibot. Por favor, verifique os logs do servidor.");
    }
    return;
  }
}

// Inicia o bot
// Verifica se o arquivo está sendo executado diretamente
if (require.main === module) {
  initializeBot();
}

function getStatus() {
  return {
    isConnected: client && client.readyState() === 'OPEN',
    channel: config.twitchChannel,
    username: config.twitchUsername
  };
}

module.exports = { initializeBot, getStatus, client };
