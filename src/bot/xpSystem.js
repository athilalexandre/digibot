const Tammer = require('../models/Tammer');
const DigimonData = require('../models/DigimonData'); // Adicionado

const xpTable = {
  "Digitama": { levels: { 1: 0, 2: 100, 3: 200, 4: 300, 5: 400 }, nextStageXp: 500, evolvesTo: "Baby I" },
  "Baby I":   { levels: { 1: 500, 2: 600, 3: 700, 4: 800, 5: 900 }, nextStageXp: 1000, evolvesTo: "Baby II" },
  "Baby II":  { levels: { 1: 1000, 2: 1100, 3: 1200, 4: 1300, 5: 1400}, nextStageXp: 1500, evolvesTo: "Rookie" },
  "Rookie":   { levels: { 1: 1500, 2: 1600, 3: 1700, 4: 1800, 5: 1900}, nextStageXp: 2000, evolvesTo: "Champion" },
  "Champion": { levels: { 1: 2000, 2: 2100, 3: 2200, 4: 2300, 5: 2400}, nextStageXp: 2500, evolvesTo: "Ultimate" },
  "Ultimate": { levels: { 1: 2500, 2: 2600, 3: 2700, 4: 2800, 5: 2900}, nextStageXp: 3000, evolvesTo: "Mega" },
  "Mega":     { levels: { 1: 3000, 2: 3100, 3: 3200, 4: 3300, 5: 3400}, nextStageXp: Infinity, evolvesTo: null }
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
    const currentTammerStage = tammer.digimonStage; // Estágio atual do Tammer
    const stageDataFromXpTable = xpTable[currentTammerStage];

    if (!stageDataFromXpTable) {
      console.error(`Estágio ${currentTammerStage} do Tammer não encontrado na xpTable.`);
      return; 
    }

    // Verifica evolução para o próximo estágio
    if (stageDataFromXpTable.evolvesTo && tammer.digimonXp >= stageDataFromXpTable.nextStageXp) {
      const previousDigimonName = tammer.digimonName; // Nome antes da tentativa de evolução
      const previousStage = currentTammerStage; // Estágio antes da tentativa de evolução
      const targetNewStage = stageDataFromXpTable.evolvesTo; // Estágio para o qual tentará evoluir (da xpTable)
      let newDigimonEntry = null;

      // Prioridade 1: Usar `evolvesTo` do `DigimonData` atual do Tammer (se currentDigimonId estiver definido)
      if (tammer.currentDigimonId) {
        try {
          const currentDigimonInfo = await DigimonData.findById(tammer.currentDigimonId);
          if (currentDigimonInfo && currentDigimonInfo.evolvesTo) {
            // Tenta encontrar o próximo Digimon pelo nome exato em evolvesTo e que seja do estágio correto
            newDigimonEntry = await DigimonData.findOne({ name: currentDigimonInfo.evolvesTo, stage: targetNewStage });
          }
        } catch (err) {
          console.error(`Erro ao buscar DigimonData atual (ID: ${tammer.currentDigimonId}):`, err);
        }
      }

      // Prioridade 2 (Fallback): Se não encontrado acima, buscar por um DigimonData que evolua do NOME do Digimon anterior
      // e que seja do estágio correto. Isso é útil se currentDigimonId não estava setado ou a linha evolutiva direta falhou.
      if (!newDigimonEntry) {
        newDigimonEntry = await DigimonData.findOne({ stage: targetNewStage, evolvesFrom: previousDigimonName });
      }
      
      // Prioridade 3 (Fallback mais genérico): Se ainda não encontrado, buscar pelo estágio anterior.
      // Esta lógica foi removida por ser muito genérica e propensa a erros.
      // Se as duas primeiras prioridades falharem, o fallback abaixo será usado.

      if (newDigimonEntry) {
        // Atualizar o Tammer com os dados do newDigimonEntry
        tammer.digimonStage = newDigimonEntry.stage; // Deve corresponder a targetNewStage
        tammer.digimonLevel = 1; // Reseta o nível para 1 no novo estágio
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
        // Fallback: newDigimonEntry NÃO foi encontrado, comportamento antigo/genérico
        tammer.digimonStage = targetNewStage; // Atualiza para o estágio da xpTable
        tammer.digimonLevel = 1;
        // Não reseta currentDigimonId aqui, pois não temos um novo entry.
        // Pode ser que o usuário precise de um item ou condição especial para evoluir para um Digimon específico.

        if (previousStage === "Digitama") {
          tammer.digimonName = `${targetNewStage} de ${tammer.username}`;
        }
        // Se não era Digitama, o nome do Digimon não muda genericamente, a menos que um newDigimonEntry seja encontrado.
        // O nome antigo (previousDigimonName) ainda seria o nome do Digimon, mas agora em um novo estágio (targetNewStage).
        // Isso pode ser confuso, então é melhor que o nome mude apenas se newDigimonEntry for encontrado.
        // A mensagem abaixo reflete isso.

        console.warn(`Aviso: DigimonData específico não encontrado para evolução de ${previousDigimonName} (Estágio: ${previousStage}) para ${targetNewStage}. O Digimon progrediu para o estágio ${targetNewStage} com atributos base do estágio anterior ou genéricos.`);
        client.say(target, `Parabéns, ${tammer.username}! Seu ${previousDigimonName} progrediu para o estágio ${targetNewStage}! (Stats podem não ter sido atualizados para um novo Digimon específico).`);
      }
      
      changedInLoop = true;
      continue; // Continua o loop para verificar level up no novo estágio ou outras evoluções
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
