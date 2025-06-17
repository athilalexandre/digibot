const Tammer = require('../models/Tammer');
const DigimonData = require('../models/DigimonData'); // Adicionado

const xpTable = {
  // Níveis são globais (1-20). XP é o total acumulado para atingir aquele nível.
  // nextStageXp é o XP total necessário para iniciar o próximo estágio.
  "Digitama": { // Níveis 1-2
    levels: { 1: 0, 2: 100 },
    nextStageXp: 250, // XP para Nível 3 (início Baby I)
    evolvesTo: "Baby I"
  },
  "Baby I":   { // Níveis 3-4
    levels: { 3: 250, 4: 400 },
    nextStageXp: 600, // XP para Nível 5 (início Baby II)
    evolvesTo: "Baby II"
  },
  "Baby II":  { // Níveis 5-7
    levels: { 5: 600, 6: 800, 7: 1000 },
    nextStageXp: 1250, // XP para Nível 8 (início Rookie)
    evolvesTo: "Rookie"
  },
  "Rookie":   { // Níveis 8-10
    levels: { 8: 1250, 9: 1500, 10: 1750 },
    nextStageXp: 2050, // XP para Nível 11 (início Champion)
    evolvesTo: "Champion"
  },
  "Champion": { // Níveis 11-13
    levels: { 11: 2050, 12: 2350, 13: 2650 },
    nextStageXp: 3000, // XP para Nível 14 (início Ultimate)
    evolvesTo: "Ultimate"
  },
  "Ultimate": { // Níveis 14-17
    levels: { 14: 3000, 15: 3350, 16: 3700, 17: 4050 },
    nextStageXp: 4450, // XP para Nível 18 (início Mega)
    evolvesTo: "Mega"
  },
  "Mega":     { // Níveis 18-20
    levels: { 18: 4450, 19: 4850, 20: 5250 },
    nextStageXp: Infinity, // Não evolui mais
    evolvesTo: null
  }
};

async function addXp(twitchUserId, amount, client, target) {
  try {
    const tammer = await Tammer.findOne({ twitchUserId });
    if (!tammer) {
      client.say(target, "Tammer não encontrado para adicionar XP.");
      return;
    }

    const oldLevel = tammer.digimonLevel;
    tammer.digimonXp += amount;
    client.say(target, `${tammer.username} recebeu ${amount} XP! XP atual: ${tammer.digimonXp}.`);

    if (tammer.digimonLevel === 20 && tammer.digimonXp > xpTable["Mega"].levels[20]) {
        tammer.digimonXp = xpTable["Mega"].levels[20]; // Cap XP no máximo do nível 20
    }

    await checkLevelUp(tammer, client, target);
    await tammer.save();

  } catch (error) {
    console.error("Erro em addXp:", error);
    client.say(target, "Ocorreu um erro ao adicionar XP.");
  }
}

async function checkLevelUp(tammer, client, target) {
  let changedInLoop = true;
  const MAX_LEVEL = 20;
  while (changedInLoop) {
    changedInLoop = false;
    const currentTammerStage = tammer.digimonStage; // Estágio atual do Tammer
    const stageDataFromXpTable = xpTable[currentTammerStage];

    if (!stageDataFromXpTable) {
      console.error(`Estágio ${currentTammerStage} do Tammer não encontrado na xpTable.`);
      return; 
    }

    // 1. Tenta evoluir para o próximo estágio
    if (stageDataFromXpTable.evolvesTo && tammer.digimonXp >= stageDataFromXpTable.nextStageXp && tammer.digimonStage !== "Mega") {
      const previousDigimonName = tammer.digimonName; // Nome antes da tentativa de evolução
      const previousStage = currentTammerStage; // Estágio antes da tentativa de evolução
      const targetNewStage = stageDataFromXpTable.evolvesTo; // Estágio para o qual tentará evoluir (da xpTable)
      let newDigimonEntry = null;

      // Prioridade 1: Usar `evolvesTo` do `DigimonData` atual do Tammer (se currentDigimonId estiver definido)
      if (tammer.currentDigimonId) {
        try {
          const currentDigimonInfo = await DigimonData.findById(tammer.currentDigimonId);
          if (currentDigimonInfo && currentDigimonInfo.evolvesTo) {
            console.log(`[XP LOG] Prioridade 1: Buscando por nome "${currentDigimonInfo.evolvesTo}" e estágio "${targetNewStage}"`);
            // Tenta encontrar o próximo Digimon pelo nome exato em evolvesTo e que seja do estágio correto
            newDigimonEntry = await DigimonData.findOne({ name: currentDigimonInfo.evolvesTo, stage: targetNewStage });            
            if (newDigimonEntry) console.log(`[XP LOG] Prioridade 1: Encontrado ${newDigimonEntry.name} (ID: ${newDigimonEntry._id})`);
            else console.log(`[XP LOG] Prioridade 1: Não encontrado.`);
          }
        } catch (err) {
          console.error(`Erro ao buscar DigimonData atual (ID: ${tammer.currentDigimonId}):`, err);
        }
      }

      // Prioridade 2 (Fallback): Se não encontrado acima, buscar por um DigimonData que evolua do NOME do Digimon anterior
      // e que seja do estágio correto. Isso é útil se currentDigimonId não estava setado ou a linha evolutiva direta falhou.
      if (!newDigimonEntry) {
        console.log(`[XP LOG] Prioridade 2: Buscando por estágio "${targetNewStage}" e evolvesFrom "${previousDigimonName}"`);
        newDigimonEntry = await DigimonData.findOne({ stage: targetNewStage, evolvesFrom: previousDigimonName });        
        if (newDigimonEntry) console.log(`[XP LOG] Prioridade 2: Encontrado ${newDigimonEntry.name} (ID: ${newDigimonEntry._id})`);
        else console.log(`[XP LOG] Prioridade 2: Não encontrado.`);
      }
      
      // Prioridade Especial: Se evoluindo de Digitama e nenhum entry encontrado pelas prioridades 1 ou 2,
      // pegar um Baby I aleatório que não evolua de ninguém (evolvesFrom: null).
      if (!newDigimonEntry && previousStage === "Digitama" && targetNewStage === "Baby I") {
        try {
          const initialBabyIForms = await DigimonData.find({ stage: "Baby I", evolvesFrom: null });
          if (initialBabyIForms.length > 0) {
            newDigimonEntry = initialBabyIForms[Math.floor(Math.random() * initialBabyIForms.length)];
            console.log(`Evolução de Digitama: ${tammer.username} recebeu ${newDigimonEntry.name} (${newDigimonEntry.stage}) aleatoriamente.`);
          } else {
            console.warn(`Nenhum Digimon 'Baby I' com 'evolvesFrom: null' encontrado no catálogo para ${tammer.username} ao evoluir de Digitama.`);
          }
        } catch (err) {
          console.error(`Erro ao buscar Baby I inicial para ${tammer.username} ao evoluir de Digitama:`, err);
        }
      }

      if (newDigimonEntry) {
        // Atualizar o Tammer com os dados do newDigimonEntry
        const oldDigimonNameForMessage = tammer.digimonName; // Guardar nome antigo para a mensagem

        tammer.digimonStage = newDigimonEntry.stage; // Deve corresponder a targetNewStage
        // tammer.digimonLevel NÃO é resetado, é o nível global. Será recalculado abaixo.
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

        client.say(target, `Parabéns, ${tammer.username}! Seu ${oldDigimonNameForMessage} evoluiu para ${tammer.digimonName} (${tammer.digimonStage})!`);
      } else {
        // Fallback se não encontrar Digimon específico para evoluir
        tammer.digimonStage = targetNewStage; // Atualiza para o estágio da xpTable
        // Como não encontramos uma entrada específica, o Digimon evoluiu genericamente.
        // Resetar currentDigimonId para null e atualizar o nome para algo genérico do novo estágio.
        tammer.currentDigimonId = null; 
        tammer.digimonName = `${targetNewStage} de ${tammer.username}`; // Ex: "Ultimate de 0baratta"
        // Os stats base não são atualizados para um Digimon específico, mantendo os anteriores ou genéricos.

        console.warn(`Aviso: DigimonData específico não encontrado para evolução de ${previousDigimonName} (Estágio: ${previousStage}) para ${targetNewStage}. O Digimon progrediu para o estágio ${targetNewStage} com atributos base do estágio anterior ou genéricos.`);
        client.say(target, `Parabéns, ${tammer.username}! Seu ${previousDigimonName} progrediu para o estágio ${targetNewStage}! (Stats podem não ter sido atualizados para um novo Digimon específico).`);
      }
      
      changedInLoop = true;
      // Após a evolução de estágio, o loop continua para recalcular o nível global.
    }

    // 2. Sempre recalcular o nível global (tammer.digimonLevel) com base no XP total e no estágio ATUAL do Tammer.
    const stageDataForLevelCalc = xpTable[tammer.digimonStage];
    let determinedLevel = 0;

    if (stageDataForLevelCalc && stageDataForLevelCalc.levels) {
      const levelsForStage = stageDataForLevelCalc.levels;
      const sortedStageLevels = Object.keys(levelsForStage).map(Number).sort((a, b) => a - b);
      
      for (const lvl of sortedStageLevels) {
        if (tammer.digimonXp >= levelsForStage[lvl]) {
          determinedLevel = lvl;
        } else {
          break; // XP não é suficiente para este nível, então não será para os próximos.
        }
      }
      // Se determinedLevel ainda for 0 (XP menor que o XP do primeiro nível do estágio),
      // mas o estágio tem níveis definidos, define para o primeiro nível do estágio.
      // Isso cobre o caso de !setdigimon ou quando o XP é exatamente o do primeiro nível.
      if (determinedLevel === 0 && sortedStageLevels.length > 0 && tammer.digimonXp >= levelsForStage[sortedStageLevels[0]]) {
        determinedLevel = sortedStageLevels[0];
      }
    }
    
    if (determinedLevel === 0) determinedLevel = 1; // Fallback geral para nível 1 se nada for encontrado
    if (determinedLevel > MAX_LEVEL) determinedLevel = MAX_LEVEL; // Garante o teto de nível

    if (tammer.digimonLevel !== determinedLevel) {
      if (determinedLevel > tammer.digimonLevel) {
        client.say(target, `${tammer.username}, seu ${tammer.digimonName} (${tammer.digimonStage}) subiu para o nível ${determinedLevel}!`);
      }
      tammer.digimonLevel = determinedLevel;
      // TODO: Atualizar HP e Stats baseados no novo nível (ganhos por nível, não por evolução)
      changedInLoop = true;
    }
  }
}

module.exports = { addXp, xpTable }; // Exportando xpTable
