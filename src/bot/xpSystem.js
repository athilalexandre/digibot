const Tammer = require('../models/Tammer');
const DigimonData = require('../models/DigimonData'); // Adicionado

const xpTable = {
  "Digitama": { levels: { 1: 0 }, nextStageXp: 100, evolvesTo: "Baby I" },
  "Baby I":   { levels: { 1: 500, 2: 600, 3: 700, 4: 800, 5: 900 }, nextStageXp: 1000, evolvesTo: "Baby II" },
  "Baby II":  { levels: { 1: 1000, 2: 1100, 3: 1200, 4: 1300, 5: 1400}, nextStageXp: 1500, evolvesTo: "Rookie" },
  "Rookie":   { levels: { 1: 1500, 2: 1600, 3: 1700, 4: 1800, 5: 1900}, nextStageXp: 2000, evolvesTo: "Champion" },
  "Champion": { levels: { 1: 2000, 2: 2100, 3: 2200, 4: 2300, 5: 2400}, nextStageXp: 2500, evolvesTo: "Ultimate" },
  "Ultimate": { levels: { 1: 2500, 2: 2600, 3: 2700, 4: 2800, 5: 2900}, nextStageXp: 3000, evolvesTo: "Mega" },
  "Mega":     { levels: { 1: 3000, 2: 3100, 3: 3200, 4: 3300, 5: 3400}, nextStageXp: Infinity, evolvesTo: null }
};

async function addXp(twitchUserId, amount, client, target) {
  console.log(`[DEBUG] addXp chamado para userId: ${twitchUserId}, amount: ${amount}`);
  try {
    const tammer = await Tammer.findOne({ twitchUserId });
    console.log(`[DEBUG] Tammer encontrado:`, tammer);
    if (!tammer) {
      client.say(target, "Tammer não encontrado para adicionar XP.");
      return;
    }

    const xpAntes = tammer.digimonXp;
    tammer.digimonXp += amount;
    console.log(`[DEBUG] XP antes: ${xpAntes}, XP depois: ${tammer.digimonXp}`);
    client.say(target, `${tammer.username} recebeu ${amount} XP! XP atual: ${tammer.digimonXp}.`);

    await checkLevelUp(tammer, client, target);
    await tammer.save();
    console.log(`[DEBUG] Tammer salvo com novo XP.`);

  } catch (error) {
    console.error("Erro em addXp:", error);
    client.say(target, "Ocorreu um erro ao adicionar XP.");
  }
}

async function checkLevelUp(tammer, client, target) {
  let changedInLoop = true;
  while (changedInLoop) {
    changedInLoop = false;
    const currentTammerStage = tammer.digimonStage; // Estágio atual do Tammer
    const stageDataFromXpTable = xpTable[currentTammerStage];

    if (!stageDataFromXpTable) {
      console.error(`Estágio ${currentTammerStage} do Tammer não encontrado na xpTable.`);
      return;
    }

    // Verifica evolução para o próximo estágio
    if (stageDataFromXpTable.evolvesTo && tammer.digimonXp >= stageDataFromXpTable.nextStageXp) {
      const previousDigimonName = tammer.digimonName;
      const previousStage = currentTammerStage;
      let newDigimonEntry = null;
      if (tammer.currentDigimonId) {
        const currentDigimonInfo = await DigimonData.findById(tammer.currentDigimonId);
        if (currentDigimonInfo && Array.isArray(currentDigimonInfo.evolvesTo) && currentDigimonInfo.evolvesTo.length > 0) {
          // Escolhe aleatoriamente um nome da lista evolvesTo
          const nextName = currentDigimonInfo.evolvesTo[Math.floor(Math.random() * currentDigimonInfo.evolvesTo.length)];
          newDigimonEntry = await DigimonData.findOne({ name: nextName });
        }
      }
      if (!newDigimonEntry) {
        // Fallback: busca aleatória entre todos os Digimons do próximo estágio que evoluem do atual
        const candidates = await DigimonData.find({ stage: stageDataFromXpTable.evolvesTo, evolvesFrom: previousDigimonName });
        if (candidates.length > 0) {
          newDigimonEntry = candidates[Math.floor(Math.random() * candidates.length)];
        }
      }
      if (newDigimonEntry) {
        tammer.digimonStage = newDigimonEntry.stage;
        tammer.digimonLevel = 1;
        tammer.currentDigimonId = newDigimonEntry._id;
        tammer.digimonName = newDigimonEntry.name;
        if (newDigimonEntry.baseStats) {
          tammer.digimonHp = newDigimonEntry.baseStats.hp || tammer.digimonHp;
          tammer.digimonStats = {
            forca: newDigimonEntry.baseStats.forca || tammer.digimonStats.forca,
            defesa: newDigimonEntry.baseStats.defesa || tammer.digimonStats.defesa,
            velocidade: newDigimonEntry.baseStats.velocidade || tammer.digimonStats.velocidade,
            sabedoria: newDigimonEntry.baseStats.sabedoria || tammer.digimonStats.sabedoria,
          };
        }
        tammer.digimonType = newDigimonEntry.type;
        client.say(target, `Parabéns, ${tammer.username}! Seu ${previousDigimonName} evoluiu para ${tammer.digimonName} (${tammer.digimonStage})!`);
      } else {
        // Última linha evolutiva: XP máximo 999999
        tammer.digimonXp = Math.min(tammer.digimonXp, 999999);
        tammer.digimonStage = previousStage;
        client.say(target, `${tammer.username}, seu ${previousDigimonName} atingiu o estágio máximo!`);
      }
      changedInLoop = true;
      continue;
    }

    // Verifica level up dentro do estágio atual (lógica inalterada)
    const stageLevels = stageDataFromXpTable.levels;
    let newLevel = tammer.digimonLevel;
    for (const level in stageLevels) {
      // Garante que o XP para este nível na tabela seja alcançado E que o nível seja maior que o atual
      if (tammer.digimonXp >= stageLevels[level] && parseInt(level) > tammer.digimonLevel) {
        newLevel = parseInt(level); // Atualiza para o maior nível alcançado
      }
    }

    if (newLevel > tammer.digimonLevel) {
      tammer.digimonLevel = newLevel;
      // TODO: Atualizar HP e Stats baseados no novo nível (ganhos por nível, não por evolução)
      client.say(target, `${tammer.username}, seu ${tammer.digimonName} (${tammer.digimonStage}) subiu para o nível ${tammer.digimonLevel}!`);
      changedInLoop = true;
    }
  }
}

module.exports = { addXp, xpTable };
