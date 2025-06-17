// Arquivo principal do bot da Twitch
const tmi = require('tmi.js');
const connectDB = require('../database/connection');
const Tammer = require('../models/Tammer');
const BotConfig = require('../models/BotConfig'); // Adicionado BotConfig
const DigimonData = require('../models/DigimonData'); // Para !setdigimon
const config = require('../config');
const { addXp, xpTable } = require('./xpSystem'); // Adicionado para !testxp e xpTable para !setdigimon
const { processTrainingCommands } = require('./game_mechanics/training/training_commands.js');
const { startSpawner } = require('./wild_digimon_spawner.js');
const { processBattleCommands } = require('./game_mechanics/battle/battle_commands.js');
const seedDigimonDatabase = require('../database/seedDigimonData'); // Para !resetdigibot

// Configurações do bot
const opts = {
  identity: {
    username: config.twitchUsername,
    password: config.twitchOAuth, // Alterado para twitchOAuth conforme especificado
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
  startSpawner(client, config.twitchChannel); // Inicia o spawner de Digimon selvagem
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
  if (self) { return; } // Ignora mensagens do próprio bot

  // Processa comandos de treino primeiro
  // msg original é passado para processTrainingCommands, pois ele faz seu próprio trim e toLowerCase.
  const trainingCommandProcessed = await processTrainingCommands(target, context, msg, client);
  if (trainingCommandProcessed) {
    return; // Comando de treino foi tratado, não precisa continuar
  }

  // Processa comandos de batalha
  // msg original é passado para processBattleCommands.
  const battleCommandProcessed = await processBattleCommands(target, context, msg, client);
  if (battleCommandProcessed) {
    return; // Comando de batalha foi tratado, não precisa continuar
  }

  // Lógica de parsing de comando existente (adaptada)
  const rawMessage = msg.trim(); // Usado para casos onde o case importa ou para substrings
  const parts = rawMessage.split(' ');
  const command = parts[0].toLowerCase(); // Comando principal em minúsculas
  const args = parts.slice(1); // Argumentos como array de strings

  const twitchUserId = context['user-id']; // Renomeado para clareza
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
    return; // Comando tratado
  }

  // Comando !meudigimon ou !status
  if (command === '!meudigimon' || command === '!status') {
    try {
      const tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        return client.say(target, `${username}, você ainda não entrou no jogo. Use !entrar para começar.`);
      }
      let statusMessage = `${username}, seu Digimon: ${tammer.digimonName} (${tammer.digimonStage} - Nível ${tammer.digimonLevel}). XP: ${tammer.digimonXp}.`;
      if (tammer.digimonHp && tammer.digimonStats) {
        statusMessage += ` HP: ${tammer.digimonHp}, MP: ${tammer.digimonMp}, Força: ${tammer.digimonStats.forca}, Defesa: ${tammer.digimonStats.defesa}, Velocidade: ${tammer.digimonStats.velocidade}, Sabedoria: ${tammer.digimonStats.sabedoria}.`;
      }
      statusMessage += ` Coins: ${tammer.coins}.`;
      client.say(target, statusMessage);
    } catch (error) {
      console.error("Erro no comando !meudigimon:", error);
      client.say(target, "Ocorreu um erro ao buscar as informações do seu Digimon.");
    }
    return; // Comando tratado
  }

  // Comandos de Moderador/Broadcaster (isModOrBroadcaster definido abaixo)
  const isModOrBroadcaster = context.mod || username.toLowerCase() === config.twitchChannel.substring(1).toLowerCase();


  if (command === '!givecoins' && isModOrBroadcaster) {
    const targetUsername = args[0]; // Pode ser case-sensitive dependendo da sua lógica de busca
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !givecoins <username> <quantidade>");
    }

    try {
      // É importante decidir se a busca por targetUsername deve ser case-insensitive.
      // Se sim, pode ser necessário usar uma regex ou ajustar o schema/query.
      // Por enquanto, assumindo case-sensitive como estava.
      const targetTammer = await Tammer.findOneAndUpdate(
        { username: targetUsername }, // Busca pelo username exato
        { $inc: { coins: amount } },
        { new: true, runValidators: true }
      );
      if (targetTammer) {
        client.say(target, `${amount} coins foram dadas para ${targetUsername}. Saldo atual: ${targetTammer.coins} coins.`);
      } else {
        client.say(target, `Usuário ${targetUsername} não encontrado.`);
      }
    } catch (error) {
      console.error("Erro no comando !givecoins:", error);
      client.say(target, "Ocorreu um erro ao dar coins.");
    }
    return; // Comando tratado
  }

  if (command === '!removecoins' && isModOrBroadcaster) {
    const targetUsername = args[0];
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !removecoins <username> <quantidade>");
    }

    try {
      const targetTammer = await Tammer.findOne({ username: targetUsername });
      if (!targetTammer) {
        return client.say(target, `Usuário ${targetUsername} não encontrado.`);
      }

      targetTammer.coins -= amount;
      if (targetTammer.coins < 0) targetTammer.coins = 0; // Evita coins negativas, opcional
      await targetTammer.save();

      client.say(target, `${amount} coins foram removidas de ${targetUsername}. Saldo atual: ${targetTammer.coins} coins.`);
    } catch (error) {
      console.error("Erro no comando !removecoins:", error);
      client.say(target, "Ocorreu um erro ao remover coins.");
    }
    return; // Comando tratado
  }

  if (command === '!setcoinvalue' && isModOrBroadcaster) {
    const value = parseInt(args[0]);

    if (isNaN(value) || value <= 0) {
      return client.say(target, "Uso: !setcoinvalue <valor> (valor deve ser um número positivo)");
    }

    try {
      const updatedConfig = await BotConfig.findOneAndUpdate(
        { configKey: 'mainConfig' },
        { coinValueForEvents: value },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
      );
      client.say(target, `O valor da coin para eventos foi definido para ${updatedConfig.coinValueForEvents}.`);
    } catch (error) {
      console.error("Erro no comando !setcoinvalue:", error);
      client.say(target, "Ocorreu um erro ao definir o valor da coin.");
    }
    return; // Comando tratado
  }

  if (command === '!testxp' && isModOrBroadcaster) {
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !testxp <quantidade> (quantidade deve ser um número positivo).");
    }
    try {
      // addXp espera twitchUserId, amount, client, target
      await addXp(twitchUserId, amount, client, target);
    } catch (error) {
      console.error("Erro no comando !testxp:", error);
      client.say(target, "Ocorreu um erro ao adicionar XP.");
    }
    return; // Comando tratado
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
        // Mantém o MP atual ou reseta para o base do DigimonData se existir um campo mp nos baseStats
        tammerToUpdate.digimonMp = newDigimonData.baseStats.mp || tammerToUpdate.digimonMp || 10; 
        tammerToUpdate.digimonStats = { ...newDigimonData.baseStats };
      }
      const newStageDataFromTable = xpTable[newDigimonData.stage];
      if (newStageDataFromTable && newStageDataFromTable.levels) {
        const stageLevelsSorted = Object.keys(newStageDataFromTable.levels).map(Number).sort((a,b) => a-b);
        if (stageLevelsSorted.length > 0) {
            const firstLevelOfNewStage = stageLevelsSorted[0];
            tammerToUpdate.digimonLevel = firstLevelOfNewStage;
            tammerToUpdate.digimonXp = newStageDataFromTable.levels[firstLevelOfNewStage];
        } else {
            tammerToUpdate.digimonLevel = 1;
            tammerToUpdate.digimonXp = 0;
        }
      } else {
        tammerToUpdate.digimonLevel = 1;
        tammerToUpdate.digimonXp = 0;
      }
      await tammerToUpdate.save();
      client.say(target, `O Digimon de ${targetUsername} foi alterado para ${newDigimonData.name} (${newDigimonData.stage} Nível ${tammerToUpdate.digimonLevel}). Status e XP resetados para a base.`);
    } catch (error) {
      console.error("Erro no comando !setdigimon:", error);
      client.say(target, "Ocorreu um erro ao tentar alterar o Digimon.");
    }
    return; // Comando tratado
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
    return; // Comando tratado
  }
}

// Inicia o bot
initializeBot();
