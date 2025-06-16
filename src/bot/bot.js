// Arquivo principal do bot da Twitch
const tmi = require('tmi.js');
const connectDB = require('../database/connection');
const Tammer = require('../models/Tammer');
const BotConfig = require('../models/BotConfig'); // Adicionado BotConfig
const config = require('../config');
const { addXp } = require('./xpSystem'); // Adicionado para !testxp

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
}

// Handler para mensagens
async function onMessageHandler(target, context, msg, self) {
  if (self) { return; } // Ignora mensagens do próprio bot

  const message = msg.trim().toLowerCase();
  const args = msg.trim().split(' ');
  const command = args.shift().toLowerCase();
  const userId = context['user-id'];
  const username = context.username;

  // Comando !entrar
  if (command === '!entrar') {
    try {
      let tammer = await Tammer.findOne({ twitchUserId: userId });
      if (!tammer) {
        tammer = new Tammer({
          twitchUserId: userId,
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
  }

  // Comando !givecoins <targetUsername> <amount>
  if (command === '!givecoins') {
    if (!context.mod && username.toLowerCase() !== config.twitchChannel.substring(1).toLowerCase()) {
      return client.say(target, "Você não tem permissão para usar este comando.");
    }
    const targetUsername = args[0];
    const amount = parseInt(args[1]);

    if (!targetUsername || isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !givecoins <username> <quantidade>");
    }

    try {
      const targetTammer = await Tammer.findOneAndUpdate(
        { username: targetUsername },
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
  }

  // Comando !setcoinvalue <value>
  if (command === '!setcoinvalue') {
    if (!context.mod && username.toLowerCase() !== config.twitchChannel.substring(1).toLowerCase()) {
      return client.say(target, "Você não tem permissão para usar este comando.");
    }
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
  }

  // Comando !testxp <amount>
  if (command === '!testxp') {
    if (!context.mod && username.toLowerCase() !== config.twitchChannel.substring(1).toLowerCase()) {
      return client.say(target, "Você não tem permissão para usar este comando.");
    }
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
      return client.say(target, "Uso: !testxp <quantidade> (quantidade deve ser um número positivo).");
    }
    try {
      await addXp(userId, amount, client, target);
    } catch (error) {
      console.error("Erro no comando !testxp:", error);
      client.say(target, "Ocorreu um erro ao adicionar XP.");
    }
  }
}
