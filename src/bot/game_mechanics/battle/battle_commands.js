const Tammer = require('../../../models/Tammer');
const DigimonData = require('../../../models/DigimonData'); // Para buscar atributo do Digimon do Tammer
const { startBattle, getActiveBattle } = require('./battle_logic.js');
const { getAnnouncedEnemy, clearAnnouncedEnemy } = require('../../wild_digimon_spawner.js');

async function processBattleCommands(target, context, msg, client) {
  const message = msg.trim().toLowerCase();
  const commandParts = message.split(' '); // Divide a mensagem em partes
  const command = commandParts[0];
  // const args = commandParts.slice(1); // Se precisar de argumentos para !atacar, etc.

  const twitchUserId = context['user-id'];
  const username = context.username;

  if (command === '!batalhar') {
    if (getActiveBattle()) {
      client.say(target, `${username}, uma batalha já está em andamento! Aguarde o término ou o próximo Digimon selvagem.`);
      return true;
    }

    const enemyToBattle = getAnnouncedEnemy();
    if (!enemyToBattle) {
      client.say(target, `${username}, não há nenhum Digimon selvagem para batalhar no momento. Espere um aparecer!`);
      return true;
    }

    try {
      const tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        client.say(target, `${username}, você precisa entrar no jogo primeiro com !entrar para poder batalhar.`);
        return true;
      }
      if (tammer.digimonStage === "Digitama") {
        client.say(target, `${username}, seu Digitama ainda não pode batalhar! Cuide bem dele para que evolua.`);
        return true;
      }
      if (tammer.digimonHp <= 0) {
         client.say(target, `${username}, seu Digimon ${tammer.digimonName} está com 0 HP e não pode batalhar. Recupere-o! (Função de recuperar HP em desenvolvimento)`);
         return true;
      }
      // Outras verificações, como um cooldown pós-batalha para o Tammer, podem ser adicionadas aqui.

      let tammerAttribute = 'Neutro'; // Default
      if (tammer.currentDigimonId) {
        const tammerDigimonInfo = await DigimonData.findById(tammer.currentDigimonId);
        if (tammerDigimonInfo && tammerDigimonInfo.attribute) {
          tammerAttribute = tammerDigimonInfo.attribute;
        }
      }

      // enemyToBattle já é um objeto DigimonData completo vindo do getAnnouncedEnemy()
      const battleStarted = startBattle(tammer, enemyToBattle, tammerAttribute);

      if (battleStarted) {
        clearAnnouncedEnemy(); // Remove o Digimon da lista de anunciados e limpa seu timeout de desaparecimento
        const currentBattle = getActiveBattle(); // Pega os dados formatados pela battle_logic
        // Mensagem inicial da batalha
        client.say(target, `⚔️ ${username} com seu ${currentBattle.tammerDigimon.name} (HP: ${currentBattle.tammerDigimon.hp}) enfrenta ${currentBattle.enemyDigimon.name} (HP: ${currentBattle.enemyDigimon.hp})! Que comece a batalha!`);
        client.say(target, `É seu turno, ${username}! Use !atacar para um ataque básico.`);
      } else {
        // Esta mensagem pode ocorrer se startBattle retornar false (outra batalha começou entre getActiveBattle e startBattle)
        client.say(target, `${username}, não foi possível iniciar a batalha contra ${enemyToBattle.name} no momento. Tente novamente se ele ainda estiver por perto.`);
      }
    } catch (error) {
      console.error(`Erro no comando !batalhar para ${username} (ID: ${twitchUserId}):`, error);
      client.say(target, "Ocorreu um erro técnico ao tentar iniciar a batalha. O administrador foi notificado.");
    }
    return true; // Comando !batalhar tratado
  }
  else if (command === '!atacar') {
    const currentBattle = getActiveBattle();
    if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId === twitchUserId) {
      if (currentBattle.turn === 'player') {
        // Lógica de ataque será implementada aqui em uma próxima etapa.
        // Por agora, apenas acusa o recebimento e simula um turno.
        client.say(target, `${username}, seu ${currentBattle.tammerDigimon.name} ataca ${currentBattle.enemyDigimon.name}! (Lógica de dano e resultado em desenvolvimento)`);
        // Simulação de fim de turno do jogador:
        // currentBattle.turn = 'enemy';
        // console.log(`${username} atacou. Próximo turno: ${currentBattle.turn}`);
        // client.say(target, `Turno do ${currentBattle.enemyDigimon.name}! (Lógica do inimigo em desenvolvimento)`);
      } else {
        client.say(target, `${username}, não é seu turno para atacar! Aguarde.`);
      }
    } else if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId !== twitchUserId) {
      client.say(target, `${username}, esta não é sua batalha!`);
    } else if (!currentBattle) {
      client.say(target, `${username}, não há nenhuma batalha em andamento para atacar.`);
    }
    return true; // Comando !atacar (placeholder) tratado
  }
  // Adicionar !fugir aqui depois
  else if (command === '!fugir') {
    const currentBattle = getActiveBattle();
    if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId === twitchUserId) {
        // Lógica de fuga será implementada aqui
        client.say(target, `${username} tenta fugir da batalha com ${currentBattle.enemyDigimon.name}! (Lógica de fuga em desenvolvimento)`);
        // Exemplo: endBattle(); client.say(target, "Você conseguiu fugir!");
    } else {
        client.say(target, `${username}, não há batalha para fugir ou não é sua batalha.`);
    }
    return true; // Comando !fugir (placeholder) tratado
  }


  return false; // Não é um comando de batalha que este módulo processa
}

module.exports = {
  processBattleCommands,
};
