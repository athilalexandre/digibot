const Tammer = require('../../../models/Tammer');
const DigimonData = require('../../../models/DigimonData'); // Para buscar atributo do Digimon do Tammer
const { startBattle, getActiveBattle, handlePlayerAttack, endBattle } = require('./battle_logic.js'); // Adicionado handlePlayerAttack e endBattle
const { getAnnouncedEnemy, clearAnnouncedEnemy } = require('../../wild_digimon_spawner.js');

async function processBattleCommands(target, context, msg, client) { // A função começa aqui
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
    const attackResult = handlePlayerAttack(twitchUserId);

    // Envia a mensagem principal do resultado do ataque/turno
    if (attackResult.message) {
      client.say(target, `${username}, ${attackResult.message}`);
    }

    // Lógica de pós-batalha (salvar dados, etc.)
    if (attackResult.outcome === 'victory') {
      client.say(target, `Você ganhou ${attackResult.xpGained} XP e ${attackResult.bitsGained} bits!`);
      try {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (tammer) {
          tammer.digimonXp = (tammer.digimonXp || 0) + attackResult.xpGained;
          tammer.bits = (tammer.bits || 0) + attackResult.bitsGained;
          // NOTA: O HP do Digimon do Tammer após a vitória precisa ser atualizado.
          // battle_logic.js pode precisar retornar o HP final do jogador
          // ou endBattle() ser chamado aqui após o Tammer ser salvo.
          // Exemplo: tammer.digimonHp = attackResult.tammerFinalHpOnVictory; (se retornado)
          await tammer.save();
        }
      } catch (error) {
        console.error(`Erro ao atualizar Tammer ${username} após vitória:`, error);
        client.say(target, "Ocorreu um erro ao salvar seu progresso após a batalha.");
      }
    } else if (attackResult.outcome === 'defeat') {
      // A mensagem de derrota já foi enviada por attackResult.message
      try {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (tammer) {
          tammer.digimonHp = attackResult.tammerFinalHp; // Geralmente 0
          await tammer.save();
        }
      } catch (error) {
        console.error(`Erro ao atualizar Tammer ${username} após derrota:`, error);
      }
    }
    // Para 'continue', 'no_battle', 'not_your_battle', 'not_your_turn', a mensagem já foi enviada.
    return true;
  }
  else if (command === '!fugir') {
    const currentBattle = getActiveBattle();
    if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId === twitchUserId) {
      // TODO: Implementar handleFleeAttempt(userId) em battle_logic.js para uma lógica de fuga mais robusta (chance de sucesso/falha).
      // Por agora, uma fuga simples que sempre funciona:
      const enemyName = currentBattle.enemyDigimon.name; // Salva o nome antes de endBattle
      if (endBattle()) { // endBattle() limpa currentBattle
        client.say(target, `${username}, você conseguiu fugir da batalha contra ${enemyName}!`);
      } else {
        // Este caso não deveria ocorrer se currentBattle era válido
        client.say(target, `${username}, não foi possível processar a fuga no momento.`);
      }
    } else if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId !== twitchUserId) {
      client.say(target, `${username}, esta não é sua batalha!`);
    } else {
      client.say(target, `${username}, não há batalha para fugir.`);
    }
    return true;
  }


  return false; // Não é um comando de batalha que este módulo processa
}

module.exports = {
  processBattleCommands,
};
