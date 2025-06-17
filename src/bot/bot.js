// Arquivo principal do bot da Twitch
const tmi = require('tmi.js');
const connectDB = require('../database/connection');
const Tammer = require('../models/Tammer');
const BotConfig = require('../models/BotConfig'); // Adicionado BotConfig
const DigimonData = require('../models/DigimonData'); // Adicionado para !setdigimon
const config = require('../config');
const { addXp, xpTable } = require('./xpSystem'); // Adicionado para !testxp e xpTable para !setdigimon
const seedDigimonDatabase = require('../database/seedDigimonData'); // Para o comando de reset

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
          digimonLevel: 1, // Nível inicial global
          digimonXp: 0,    // XP inicial
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

  // Comando !resetdigibot
  if (command === '!resetdigibot') {
    if (!context.mod && username.toLowerCase() !== config.twitchChannel.substring(1).toLowerCase()) {
      return client.say(target, "Você não tem permissão para usar este comando.");
    }

    try {
      client.say(target, `Atenção, ${username}! Iniciando o reset completo do Digibot... Os dados de todos os jogadores serão apagados e o catálogo de Digimons será recarregado. Isso pode levar um momento.`);

      console.log(`[RESET COMMAND by ${username}] Iniciando o reset do banco de dados.`);

      // 1. Deletar todos os Tammers
      await Tammer.deleteMany({});
      console.log('[RESET COMMAND] Todos os Tammers foram deletados.');

      // 2. Deletar configurações do bot (ex: BotConfig)
      await BotConfig.deleteMany({}); // Ou BotConfig.deleteOne({ configKey: 'mainConfig' }) se for só um
      console.log('[RESET COMMAND] Configurações do Bot (BotConfig) foram deletadas.');

      // 3. Repopular o catálogo de Digimons
      console.log('[RESET COMMAND] Repopulando a coleção DigimonData...');
      const seedSuccess = await seedDigimonDatabase(true); // Passar true para manter a conexão

      client.say(target, seedSuccess ? "Digibot resetado com sucesso! Tudo pronto para um novo começo." : "Ocorreu um problema ao recarregar o catálogo de Digimons durante o reset. Verifique os logs.");
    } catch (error) {
      console.error("Erro crítico no comando !resetdigibot:", error);
      client.say(target, "Ocorreu um erro crítico durante o reset do Digibot. Por favor, verifique os logs do servidor.");
    }
  }

  // Comando !meudigimon
  if (command === '!meudigimon' || command === '!status') {
    try {
      const tammer = await Tammer.findOne({ twitchUserId: userId });
      if (!tammer) {
        return client.say(target, `${username}, você ainda não entrou no jogo. Use !entrar para começar.`);
      }

      let statusMessage = `${username}, seu Digimon: ${tammer.digimonName} (${tammer.digimonStage} - Nível ${tammer.digimonLevel}). XP: ${tammer.digimonXp}.`;
      if (tammer.digimonHp && tammer.digimonStats) {
        statusMessage += ` HP: ${tammer.digimonHp}, Força: ${tammer.digimonStats.forca}, Defesa: ${tammer.digimonStats.defesa}, Velocidade: ${tammer.digimonStats.velocidade}, Sabedoria: ${tammer.digimonStats.sabedoria}.`;
      }
      statusMessage += ` Coins: ${tammer.coins}.`;

      client.say(target, statusMessage);

    } catch (error) {
      console.error("Erro no comando !meudigimon:", error);
      client.say(target, "Ocorreu um erro ao buscar as informações do seu Digimon.");
    }
  }

  // Comando !setdigimon <username> <digimonName>
  if (command === '!setdigimon') {
    if (!context.mod && username.toLowerCase() !== config.twitchChannel.substring(1).toLowerCase()) {
      return client.say(target, "Você não tem permissão para usar este comando.");
    }

    const targetUsername = args[0];
    const newDigimonName = args.slice(1).join(' '); // Permite nomes de Digimon com espaços

    if (!targetUsername || !newDigimonName) {
      return client.say(target, "Uso: !setdigimon <username> <nomeDoDigimon>");
    }

    try {
      const tammerToUpdate = await Tammer.findOne({ username: targetUsername });
      if (!tammerToUpdate) {
        return client.say(target, `Tammer ${targetUsername} não encontrado.`);
      }

      const newDigimonData = await DigimonData.findOne({ name: new RegExp(`^${newDigimonName}$`, 'i') }); // Case-insensitive
      if (!newDigimonData) {
        return client.say(target, `Digimon "${newDigimonName}" não encontrado no catálogo.`);
      }

      // Atualizar dados do Tammer
      tammerToUpdate.digimonName = newDigimonData.name;
      tammerToUpdate.digimonStage = newDigimonData.stage;
      tammerToUpdate.currentDigimonId = newDigimonData._id;
      tammerToUpdate.digimonType = newDigimonData.type;

      if (newDigimonData.baseStats) {
        tammerToUpdate.digimonHp = newDigimonData.baseStats.hp;
        tammerToUpdate.digimonStats = { ...newDigimonData.baseStats }; // Copia os baseStats
      }

      // Definir nível e XP para o início do novo estágio, conforme a xpTable global
      const newStageDataFromTable = xpTable[newDigimonData.stage];
      if (newStageDataFromTable && newStageDataFromTable.levels) {
        const stageLevelsSorted = Object.keys(newStageDataFromTable.levels).map(Number).sort((a,b) => a-b);
        if (stageLevelsSorted.length > 0) {
            const firstLevelOfNewStage = stageLevelsSorted[0];
            tammerToUpdate.digimonLevel = firstLevelOfNewStage;
            tammerToUpdate.digimonXp = newStageDataFromTable.levels[firstLevelOfNewStage];
        } else {
            tammerToUpdate.digimonLevel = 1; // Fallback
            tammerToUpdate.digimonXp = 0;
            console.warn(`Estágio ${newDigimonData.stage} não possui níveis definidos na xpTable para !setdigimon.`);
        }
      } else {
        tammerToUpdate.digimonLevel = 1; // Fallback
        tammerToUpdate.digimonXp = 0;
        console.warn(`Estágio ${newDigimonData.stage} não encontrado na xpTable para definir XP/nível inicial para !setdigimon.`);
      }

      await tammerToUpdate.save();
      client.say(target, `O Digimon de ${targetUsername} foi alterado para ${newDigimonData.name} (${newDigimonData.stage} Nível 1). Status e XP resetados para a base.`);
    } catch (error) {
      console.error("Erro no comando !setdigimon:", error);
      client.say(target, "Ocorreu um erro ao tentar alterar o Digimon.");
    }
  }

}
