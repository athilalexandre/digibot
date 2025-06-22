const Tammer = require('../../backend/models/tammer');
const DigimonData = require('../../backend/models/digimonData');
const gameConfig = require('../config/gameConfig');

// Adicionando a função que estava faltando
function getStageByXp(xp) {
  let stage = 'Digitama';
  for (const stageInfo of gameConfig.xpPerStage) {
    if (xp >= stageInfo.minXp) {
      stage = stageInfo.stage;
    } else {
      break;
    }
  }
  return stage;
}

// Função para calcular XP necessário para o próximo estágio
function getXpRequiredForNextStage(currentStage, currentXp) {
  const stageIndex = gameConfig.xpPerStage.findIndex(s => s.stage === currentStage);
  if (stageIndex === -1 || stageIndex === gameConfig.xpPerStage.length - 1) {
    return 0; // Já está no estágio máximo ou estágio não encontrado
  }
  const nextStage = gameConfig.xpPerStage[stageIndex + 1];
  return nextStage.minXp - currentXp;
}

// Função para calcular XP ganho baseado no percentual do XP faltante
function calculateXpGain(currentStage, currentXp, percentMin, percentMax) {
  const xpRequired = getXpRequiredForNextStage(currentStage, currentXp);
  
  if (xpRequired <= 0) {
    // Se já está no estágio máximo ou erro, ganha XP fixo
    return Math.floor(Math.random() * (gameConfig.xpGainInMaxStage.max - gameConfig.xpGainInMaxStage.min + 1)) + gameConfig.xpGainInMaxStage.min;
  }
  
  const percent = Math.random() * (percentMax - percentMin) + percentMin;
  const xpGain = Math.ceil((xpRequired * percent) / 100);
  
  return Math.max(1, xpGain); // Mínimo 1 XP
}

// Função para verificar se pode evoluir
function canEvolve(currentStage, currentXp) {
    const stageIndex = gameConfig.xpPerStage.findIndex(s => s.stage === currentStage);
    if (stageIndex === -1 || stageIndex === gameConfig.xpPerStage.length - 1) {
        return false;
    }
    const nextStage = gameConfig.xpPerStage[stageIndex + 1];
    return currentXp >= nextStage.minXp;
}

async function addXp(twitchUserId, amount, client, target) {
  try {
    const tammer = await Tammer.findOne({ twitchUserId });
    if (!tammer) {
      // client.say(target, "Tammer não encontrado para adicionar XP."); // Mensagem opcional
      return;
    }

    const xpAntes = tammer.digimonXp;
    tammer.digimonXp += amount;
    
    const xpGanhoMsg = `${tammer.username} recebeu ${amount} XP!`;
    const xpAtualMsg = `XP Total: ${tammer.digimonXp}/${getXpRequiredForNextStage(tammer.digimonStage, xpAntes) + xpAntes || 'MAX'}`;
    
    // Não envia mensagem de XP ganho para cada ação para não poluir o chat
    // client.say(target, `${xpGanhoMsg} ${xpAtualMsg}`);

    await checkLevelUp(tammer, client, target);
    await tammer.save();

  } catch (error) {
    console.error("Erro em addXp:", error);
    // client.say(target, "Ocorreu um erro ao adicionar XP.");
  }
}

async function checkLevelUp(tammer, client, target) {
  let changedInLoop = true;
  while (changedInLoop) {
    changedInLoop = false;
    const currentStage = tammer.digimonStage;
    
    if (canEvolve(currentStage, tammer.digimonXp)) {
      const stageIndex = gameConfig.xpPerStage.findIndex(s => s.stage === currentStage);
      const newStageInfo = gameConfig.xpPerStage[stageIndex + 1];

      // Evolução
      const previousDigimonName = tammer.digimonName;
      let newDigimonEntry = null;

      // Lógica para encontrar a próxima evolução
      if (tammer.currentDigimonId) {
        const currentDigimonInfo = await DigimonData.findById(tammer.currentDigimonId);
        if (currentDigimonInfo && Array.isArray(currentDigimonInfo.evolvesTo) && currentDigimonInfo.evolvesTo.length > 0) {
          const nextName = currentDigimonInfo.evolvesTo[Math.floor(Math.random() * currentDigimonInfo.evolvesTo.length)];
          newDigimonEntry = await DigimonData.findOne({ name: nextName });
        }
      }

      if (newDigimonEntry) {
        tammer.digimonStage = newDigimonEntry.stage;
        tammer.currentDigimonId = newDigimonEntry._id;
        tammer.digimonName = newDigimonEntry.name;
        tammer.digimonType = newDigimonEntry.type;
        
        client.say(target, `🎉 Parabéns, ${tammer.username}! Seu ${previousDigimonName} digivolveu para ${tammer.digimonName} [${newDigimonEntry.stage}]! 🔥`);
        changedInLoop = true;
      } else {
        // Se não encontrar evolução específica, mas alcançou XP, evolui para o próximo estágio genérico
        tammer.digimonStage = newStageInfo.stage;
        tammer.digimonName = newStageInfo.stage; // Nome genérico do estágio
        client.say(target, `🎉 Parabéns, ${tammer.username}! Seu Digimon alcançou o estágio ${newStageInfo.stage}! 🔥`);
        changedInLoop = true;
      }
    }
  }
}

// Função para calcular XP de PvP
function calculatePvpXp(tammer, isWinner) {
  const config = isWinner ? 
    gameConfig.pvp.winner :
    gameConfig.pvp.loser;
  
  return calculateXpGain(
    tammer.digimonStage, 
    tammer.digimonXp, 
    config.xpPercentMin, 
    config.xpPercentMax
  );
}

function getStageDetails(stage) {
  return gameConfig.xpPerStage.find(s => s.stage === stage) || null;
}

module.exports = {
  addXp,
  getStageByXp,
  calculateXpGain,
  getStageDetails,
  canEvolve,
  calculatePvpXp,
  getXpRequiredForNextStage,
};
