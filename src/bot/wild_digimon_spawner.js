const DigimonData = require('../../models/DigimonData'); // Ajustado para o caminho correto
const { getActiveBattle } = require('./game_mechanics/battle/battle_logic.js');

let announcedEnemy = null; // Armazena o DigimonData do inimigo anunciado
let spawnIntervalId = null; // ID do intervalo para o spawner
const SPAWN_INTERVAL_MS = 3 * 60 * 1000; // 3 minutos
const SPAWN_CHANCE = 0.5; // 50% de chance a cada intervalo
const ENEMY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutos para o inimigo anunciado desaparecer
let enemyTimeoutId = null;

async function selectRandomWildDigimon() {
  try {
    const allowedStages = ['Rookie', 'Champion']; // Estágios permitidos para spawn selvagem
    // Contar documentos para evitar buscar todos se a coleção for muito grande
    const count = await DigimonData.countDocuments({ stage: { $in: allowedStages } });
    if (count === 0) {
      console.log("Nenhum Digimon nos estágios permitidos encontrado para spawn.");
      return null;
    }
    // Pular um número aleatório de documentos
    const randomSkip = Math.floor(Math.random() * count);
    const candidates = await DigimonData.find({ stage: { $in: allowedStages } }).skip(randomSkip).limit(1);

    if (candidates.length === 0) {
        // Fallback caso o skip/limit não retorne nada (raro, mas possível com contagens mudando)
        const fallbackCandidates = await DigimonData.find({ stage: { $in: allowedStages } });
        if (fallbackCandidates.length === 0) return null;
        return fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)];
    }
    return candidates[0];

  } catch (error) {
    console.error("Erro ao selecionar Digimon selvagem:", error);
    return null;
  }
}

async function attemptToSpawnDigimon(client, channel) {
  if (getActiveBattle() || announcedEnemy) {
    // console.log("Spawner: Batalha ativa ou inimigo já anunciado. Pulando spawn.");
    return;
  }

  if (Math.random() < SPAWN_CHANCE) {
    const wildDigimon = await selectRandomWildDigimon();

    if (wildDigimon) {
      announcedEnemy = wildDigimon;
      const message = `Um ${wildDigimon.name} selvagem (Estágio: ${wildDigimon.stage}, Atributo: ${wildDigimon.attribute || 'N/A'}, Tipo: ${wildDigimon.type || 'N/A'}) apareceu! Digite !batalhar para enfrentá-lo!`;
      client.say(channel, message);
      console.log(`Digimon spawnado: ${wildDigimon.name} no canal ${channel}`);

      if (enemyTimeoutId) clearTimeout(enemyTimeoutId);

      enemyTimeoutId = setTimeout(() => {
        // Verifica se o Digimon anunciado ainda é o mesmo e se não houve uma batalha iniciada contra ele
        if (announcedEnemy && announcedEnemy._id.equals(wildDigimon._id)) {
          client.say(channel, `${wildDigimon.name} selvagem foi embora...`);
          announcedEnemy = null;
          console.log(`${wildDigimon.name} selvagem desapareceu por timeout.`);
        }
      }, ENEMY_TIMEOUT_MS);
    }
  }
}

function startSpawner(client, channel) {
  if (spawnIntervalId) {
    console.log("Spawner já estava rodando. Limpando intervalo antigo.");
    clearInterval(spawnIntervalId);
  }
  // Chama attemptToSpawnDigimon imediatamente uma vez para teste inicial (opcional)
  // attemptToSpawnDigimon(client, channel);

  spawnIntervalId = setInterval(() => attemptToSpawnDigimon(client, channel), SPAWN_INTERVAL_MS);
  console.log(`Wild Digimon Spawner iniciado para o canal ${channel}. Intervalo: ${SPAWN_INTERVAL_MS / 1000}s, Chance: ${SPAWN_CHANCE * 100}%. Timeout do inimigo: ${ENEMY_TIMEOUT_MS / 1000}s.`);
}

function stopSpawner() {
  if (spawnIntervalId) {
    clearInterval(spawnIntervalId);
    spawnIntervalId = null;
    console.log("Wild Digimon Spawner parado.");
  }
  if (enemyTimeoutId) {
    clearTimeout(enemyTimeoutId);
    enemyTimeoutId = null;
  }
  announcedEnemy = null; // Limpa qualquer inimigo anunciado
}

function getAnnouncedEnemy() {
  return announcedEnemy;
}

function clearAnnouncedEnemy() {
  if (enemyTimeoutId) { // Limpa também o timeout para o inimigo não desaparecer depois que a batalha começou
    clearTimeout(enemyTimeoutId);
    enemyTimeoutId = null;
  }
  announcedEnemy = null;
}

module.exports = {
  startSpawner,
  stopSpawner,
  getAnnouncedEnemy,
  clearAnnouncedEnemy,
  // attemptToSpawnDigimon // Exportado opcionalmente para testes manuais
};
