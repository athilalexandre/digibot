const Tammer = require('../../../../backend/models/tammer');
const DigimonData = require('../../../../backend/models/digimonData');
const { startBattle, getActiveBattle, handlePlayerAttack, endBattle, startPvpChallenge, acceptPvpChallenge, startPvpBattle } = require('./battle_logic.js');
const { getAnnouncedEnemy, clearAnnouncedEnemy } = require('../../wild_digimon_spawner.js');
const gameConfig = require('../../../config/gameConfig');
const { calculateBattleXp } = require('../../xpSystem');

async function processBattleCommands(target, context, msg, client) {
  const message = msg.trim().toLowerCase();
  const commandParts = message.split(' ');
  const command = commandParts[0];
  const args = commandParts.slice(1);

  const twitchUserId = context['user-id'];
  const username = context.username;

  // Comando !batalha (PvE)
  if (command === '!batalha') {
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
         client.say(target, `${username}, seu Digimon ${tammer.digimonName} está com 0 HP e não pode batalhar. Use um Restaurador de Energia!`);
         return true;
      }

      // Verifica se tem arma equipada
      if (!tammer.hasWeapon()) {
        client.say(target, `${username}, você precisa equipar uma arma antes de batalhar! Use !loja para conseguir uma.`);
        return true;
      }

      // Verifica se tem pontos de batalha
      if (!tammer.hasBattlePoints(1)) {
        client.say(target, `${username}, você não tem Pontos de Batalha suficientes. Aguarde a regeneração ou use um Restaurador de Energia.`);
        return true;
      }

      // Verifica se tem bits suficientes
      if (!tammer.hasBits(gameConfig.battle.pveCost)) {
        client.say(target, `${username}, você não tem bits suficientes para batalhar. Custo: ${gameConfig.battle.pveCost} bits.`);
        return true;
      }

      // Consome recursos
      tammer.consumeBits(gameConfig.battle.pveCost);
      tammer.consumeBattlePoints(1);
      await tammer.save();

      let tammerAttribute = 'Neutro';
      if (tammer.currentDigimonId) {
        const tammerDigimonInfo = await DigimonData.findById(tammer.currentDigimonId);
        if (tammerDigimonInfo && tammerDigimonInfo.attribute) {
          tammerAttribute = tammerDigimonInfo.attribute;
        }
      }

      const battleStarted = startBattle(tammer, enemyToBattle, tammerAttribute);

      if (battleStarted) {
        clearAnnouncedEnemy();
        const currentBattle = getActiveBattle();
        client.say(target, `⚔️ ${username} com seu ${currentBattle.tammerDigimon.name} (HP: ${currentBattle.tammerDigimon.hp}) enfrenta ${currentBattle.enemyDigimon.name} (HP: ${currentBattle.enemyDigimon.hp})! Que comece a batalha!`);
        client.say(target, `É seu turno, ${username}! Use !atacar para um ataque básico.`);
      } else {
        client.say(target, `${username}, não foi possível iniciar a batalha contra ${enemyToBattle.name} no momento. Tente novamente se ele ainda estiver por perto.`);
      }
    } catch (error) {
      console.error(`Erro no comando !batalha para ${username} (ID: ${twitchUserId}):`, error);
      client.say(target, "Ocorreu um erro técnico ao tentar iniciar a batalha. O administrador foi notificado.");
    }
    return true;
  }

  // Comando !batalha @usuário (PvP)
  else if (command === '!batalha' && args.length > 0) {
    const targetUsername = args[0].replace('@', '');
    
    if (targetUsername.toLowerCase() === username.toLowerCase()) {
      client.say(target, `${username}, você não pode batalhar contra si mesmo!`);
      return true;
    }

    try {
      const challenger = await Tammer.findOne({ twitchUserId });
      if (!challenger) {
        client.say(target, `${username}, você precisa entrar no jogo primeiro com !entrar.`);
        return true;
      }

      const targetTammer = await Tammer.findOne({ username: targetUsername });
      if (!targetTammer) {
        client.say(target, `${username}, usuário ${targetUsername} não encontrado ou não está no jogo.`);
        return true;
      }

      // Verifica se ambos estão no mesmo estágio ou próximos
      if (challenger.digimonStage === "Digitama" || targetTammer.digimonStage === "Digitama") {
        client.say(target, `${username}, Digimons no estágio Digitama não podem participar de batalhas PvP.`);
        return true;
      }

      const result = startPvpChallenge(challenger, targetTammer);
      
      if (result.success) {
        client.say(target, result.message);
      } else {
        client.say(target, result.message);
      }
    } catch (error) {
      console.error(`Erro no comando !batalha PvP para ${username}:`, error);
      client.say(target, `${username}, ocorreu um erro ao processar o desafio.`);
    }
    return true;
  }

  // Comando !aceitar (PvP)
  else if (command === '!aceitar' && args.length > 0) {
    const challengerUsername = args[0];
    
    try {
      const accepter = await Tammer.findOne({ twitchUserId });
      if (!accepter) {
        client.say(target, `${username}, você precisa entrar no jogo primeiro com !entrar.`);
        return true;
      }

      const result = acceptPvpChallenge(accepter, challengerUsername);
      
      if (result.success) {
        // Processa a batalha PvP
        const battleResult = startPvpBattle(result.challenger, result.target);
        
        if (battleResult.success) {
          // Atualiza os dados dos jogadores
          const winner = battleResult.winner;
          const loser = battleResult.loser;
          
          winner.digimonXp += battleResult.winnerXp;
          winner.addBits(battleResult.bitsTransfer);
          winner.consumeBattlePoints(1);
          winner.consumeBits(gameConfig.battle.pvpCost);
          
          loser.digimonXp += battleResult.loserXp;
          loser.consumeBits(battleResult.bitsTransfer);
          loser.consumeBattlePoints(1);
          loser.consumeBits(gameConfig.battle.pvpCost);
          
          await winner.save();
          await loser.save();
          
          client.say(target, battleResult.message);
          client.say(target, `🏆 ${winner.username} ganhou ${battleResult.winnerXp} XP e ${battleResult.bitsTransfer} bits! 🥈 ${loser.username} ganhou ${battleResult.loserXp} XP.`);
        } else {
          client.say(target, `${username}, ocorreu um erro ao processar a batalha PvP.`);
        }
      } else {
        client.say(target, result.message);
      }
    } catch (error) {
      console.error(`Erro no comando !aceitar para ${username}:`, error);
      client.say(target, `${username}, ocorreu um erro ao aceitar o desafio.`);
    }
    return true;
  }

  // Comando !atacar
  else if (command === '!atacar') {
    const attackResult = handlePlayerAttack(twitchUserId);

    if (attackResult.message) {
      client.say(target, `${username}, ${attackResult.message}`);
    }

    if (attackResult.outcome === 'victory') {
      // Calcula XP baseado na nova lógica
      const tammer = await Tammer.findOne({ twitchUserId });
      if (tammer) {
        const xpGained = calculateBattleXp(tammer);
        const bitsGained = Math.floor(Math.random() * (gameConfig.battle.pveBitsMax - gameConfig.battle.pveBitsMin + 1)) + gameConfig.battle.pveBitsMin;
        
        tammer.digimonXp += xpGained;
        tammer.addBits(bitsGained);
        await tammer.save();
        
        client.say(target, `🎉 ${username} venceu! Ganhou ${xpGained} XP e ${bitsGained} bits!`);
      }
    } else if (attackResult.outcome === 'defeat') {
      try {
        const tammer = await Tammer.findOne({ twitchUserId });
        if (tammer) {
          tammer.digimonHp = 0;
          await tammer.save();
        }
      } catch (error) {
        console.error(`Erro ao atualizar Tammer ${username} após derrota:`, error);
      }
    }
    return true;
  }

  // Comando !fugir
  else if (command === '!fugir') {
    const currentBattle = getActiveBattle();
    if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId === twitchUserId) {
      if (endBattle('flee')) {
        client.say(target, `${username}, você conseguiu fugir da batalha!`);
      } else {
        client.say(target, `${username}, não foi possível processar a fuga no momento.`);
      }
    } else if (currentBattle && currentBattle.isActive && currentBattle.tammerUserId !== twitchUserId) {
      client.say(target, `${username}, esta não é sua batalha!`);
    } else {
      client.say(target, `${username}, não há batalha para fugir.`);
    }
    return true;
  }

  return false;
}

module.exports = {
  processBattleCommands,
};
