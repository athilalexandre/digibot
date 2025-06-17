// Arquivo principal do bot da Twitch
const tmi = require('tmi.js');
const connectDB = require('../database/connection');
const Tammer = require('../models/Tammer');
const BotConfig = require('../models/BotConfig'); // Adicionado BotConfig
const config = require('../config');
const { addXp } = require('./xpSystem'); // Adicionado para !testxp
const { processTrainingCommands } = require('./game_mechanics/training/training_commands.js');
const { startSpawner } = require('./wild_digimon_spawner.js');
const { processBattleCommands } = require('./game_mechanics/battle/battle_commands.js');

// Conecta ao MongoDB
connectDB();

// Configurações do bot
const opts = {
  identity: {
    username: config.twitchUsername,
    password: config.twitchOAuth, // Alterado para twitchOAuth conforme especificado
  },
  channels: [
    config.twitchChannel,
  ],
};

// Cria o cliente do bot
const client = new tmi.client(opts);

// Registra os handlers de eventos
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Conecta o bot ao chat da Twitch
client.connect().catch(console.error);

// Handler para quando o bot conectar
function onConnectedHandler(addr, port) {
  console.log(`* Conectado a ${addr}:${port} como ${config.twitchUsername} no canal ${config.twitchChannel}`);
  startSpawner(client, config.twitchChannel); // Inicia o spawner de Digimon selvagem
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

  // Comandos de Moderador/Broadcaster
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

  // Adicionar outros comandos aqui usando a mesma estrutura de `if (command === '...' && isModOrBroadcaster)`
  // ou `if (command === '...')` para comandos públicos.
}
