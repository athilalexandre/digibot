const Tammer = require('../models/Tammer');

const xpTable = {
  "Digitama": { levels: { 1: 0, 2: 100, 3: 200, 4: 300, 5: 400 }, nextStageXp: 500, evolvesTo: "Baby I" },
  "Baby I":   { levels: { 1: 500, 2: 600, 3: 700, 4: 800, 5: 900 }, nextStageXp: 1000, evolvesTo: "Baby II" },
  "Baby II":  { levels: { 1: 1000, 2: 1100, 3: 1200, 4: 1300, 5: 1400}, nextStageXp: 1500, evolvesTo: "Rookie" },
  "Rookie":   { levels: { 1: 1500, 2: 1600, 3: 1700, 4: 1800, 5: 1900}, nextStageXp: 2000, evolvesTo: "Champion" }
  // Adicionar Champion e outros estágios gradualmente
};

async function addXp(twitchUserId, amount, client, target) {
  try {
    const tammer = await Tammer.findOne({ twitchUserId });
    if (!tammer) {
      client.say(target, "Tammer não encontrado para adicionar XP.");
      return;
    }

    tammer.digimonXp += amount;
    client.say(target, `${tammer.username} recebeu ${amount} XP! XP atual: ${tammer.digimonXp}.`);

    await checkLevelUp(tammer, client, target);
    await tammer.save();

  } catch (error) {
    console.error("Erro em addXp:", error);
    client.say(target, "Ocorreu um erro ao adicionar XP.");
  }
}

async function checkLevelUp(tammer, client, target) {
  let changedInLoop = true;
  while (changedInLoop) {
    changedInLoop = false;
    const currentStageData = xpTable[tammer.digimonStage];
    if (!currentStageData) {
      console.error(`Estágio ${tammer.digimonStage} não encontrado na xpTable.`);
      return; // Sai se o estágio atual não existe na tabela
    }

    // Verifica evolução para o próximo estágio
    if (currentStageData.evolvesTo && tammer.digimonXp >= currentStageData.nextStageXp) {
      const previousStage = tammer.digimonStage;
      tammer.digimonStage = currentStageData.evolvesTo;
      tammer.digimonLevel = 1; // Reseta o nível para 1 no novo estágio

      // Se evoluiu de Digitama, atualiza o nome
      if (previousStage === "Digitama") {
        tammer.digimonName = `${tammer.digimonStage} de ${tammer.username}`;
      }
      // TODO: Atualizar HP e Stats baseados no novo Digimon (requer DigimonData)

      client.say(target, `Parabéns, ${tammer.username}! Seu ${tammer.digimonName} evoluiu para ${tammer.digimonStage}!`);
      changedInLoop = true;
      continue; // Continua o loop para verificar level up no novo estágio
    }

    // Verifica level up dentro do estágio atual
    const stageLevels = currentStageData.levels;
    let newLevel = tammer.digimonLevel;
    for (const level in stageLevels) {
      if (tammer.digimonXp >= stageLevels[level] && parseInt(level) > newLevel) {
        newLevel = parseInt(level);
      }
    }

    if (newLevel > tammer.digimonLevel) {
      tammer.digimonLevel = newLevel;
      // TODO: Atualizar HP e Stats baseados no novo nível
      client.say(target, `${tammer.username}, seu ${tammer.digimonName} (${tammer.digimonStage}) subiu para o nível ${tammer.digimonLevel}!`);
      changedInLoop = true;
    }
  }
}

module.exports = { addXp, xpTable };
