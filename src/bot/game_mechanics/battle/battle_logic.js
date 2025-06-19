const fs = require('fs');
const path = require('path');
const coinConfigPath = path.join(__dirname, '../../../../backend/config/coinConfig.json');

// Multiplicadores de Dano
const TYPE_ADVANTAGE_MULTIPLIER = 1.5;
const TYPE_DISADVANTAGE_MULTIPLIER = 0.75;
const ATTRIBUTE_ADVANTAGE_MULTIPLIER = 1.5;
const ATTRIBUTE_DISADVANTAGE_MULTIPLIER = 0.75;
const LIGHT_DARK_MULTIPLIER = 1.5; // Luz vs Escuridão e vice-versa

let currentBattle = null;

// --- Funções de Cálculo de Recompensa (já existentes) ---
function calculateXpReward(enemyStage) {
  const rewards = { "Digitama": 5, "Baby I": 10, "Baby II": 15, "Rookie": 25, "Champion": 50, "Ultimate": 100, "Mega": 200 };
  return rewards[enemyStage] || 10;
}

function getCoinValue() {
  try {
    const data = fs.readFileSync(coinConfigPath, 'utf-8');
    return JSON.parse(data).coinValue || 5;
  } catch {
    return 5;
  }
}

function calculateCoinReward(enemyStage) {
  const base = getCoinValue();
  const rewards = { "Digitama": base, "Baby I": base+3, "Baby II": base+6, "Rookie": base+8, "Champion": base+15, "Ultimate": base+35, "Mega": base+60 };
  return rewards[enemyStage] || base;
}

// --- Lógica de Vantagem de Tipo (Vacina > Virus > Data > Vacina) ---
function getTypeMultiplier(attackerType, defenderType) {
  if (!attackerType || !defenderType || attackerType === defenderType) return 1.0;
  if (attackerType === 'Vacina' && defenderType === 'Virus') return TYPE_ADVANTAGE_MULTIPLIER;
  if (attackerType === 'Virus' && defenderType === 'Data') return TYPE_ADVANTAGE_MULTIPLIER;
  if (attackerType === 'Data' && defenderType === 'Vacina') return TYPE_ADVANTAGE_MULTIPLIER;
  if (attackerType === 'Virus' && defenderType === 'Vacina') return TYPE_DISADVANTAGE_MULTIPLIER;
  if (attackerType === 'Data' && defenderType === 'Virus') return TYPE_DISADVANTAGE_MULTIPLIER;
  if (attackerType === 'Vacina' && defenderType === 'Data') return TYPE_DISADVANTAGE_MULTIPLIER;
  return 1.0;
}

// --- Lógica de Vantagem de Atributo Elemental ---
function getAttributeMultiplier(attackerAttribute, defenderAttribute) {
  if (!attackerAttribute || !defenderAttribute || attackerAttribute === defenderAttribute || attackerAttribute === 'Neutro' || defenderAttribute === 'Neutro') return 1.0;

  const advantages = {
    'Fogo': 'Planta', 'Planta': 'Água', 'Água': 'Fogo',
    'Elétrico': 'Vento', 'Vento': 'Terra', 'Terra': 'Elétrico',
  };

  // Luz vs Escuridão
  if ((attackerAttribute === 'Luz' && defenderAttribute === 'Escuridão') || (attackerAttribute === 'Escuridão' && defenderAttribute === 'Luz')) {
    return LIGHT_DARK_MULTIPLIER;
  }

  if (advantages[attackerAttribute] === defenderAttribute) return ATTRIBUTE_ADVANTAGE_MULTIPLIER;
  if (advantages[defenderAttribute] === attackerAttribute) return ATTRIBUTE_DISADVANTAGE_MULTIPLIER; // Inverso da vantagem

  return 1.0;
}

// --- Função Interna: Cálculo de Dano ---
function calculateDamage(attacker, defender) {
  // Fórmula de dano base (simplificada)
  let damage = attacker.forca * 2 - defender.defesa;

  // Aplicar multiplicadores de tipo e atributo
  const typeMultiplier = getTypeMultiplier(attacker.type, defender.type);
  const attributeMultiplier = getAttributeMultiplier(attacker.attribute, defender.attribute);

  damage *= typeMultiplier;
  damage *= attributeMultiplier;

  // Adicionar uma pequena variação aleatória ao dano (ex: +/- 10%)
  const randomFactor = (Math.random() * 0.2) + 0.9; // entre 0.9 e 1.1
  damage *= randomFactor;

  // Garantir que o dano seja pelo menos 1 e arredondar
  damage = Math.max(1, Math.round(damage));

  let logMessage = `${attacker.name} ataca ${defender.name}.`;
  if (typeMultiplier > 1) logMessage += ` (Vantagem de Tipo! x${typeMultiplier.toFixed(2)})`;
  if (typeMultiplier < 1) logMessage += ` (Desvantagem de Tipo! x${typeMultiplier.toFixed(2)})`;
  if (attributeMultiplier > 1) logMessage += ` (Vantagem de Atributo! x${attributeMultiplier.toFixed(2)})`;
  if (attributeMultiplier < 1) logMessage += ` (Desvantagem de Atributo! x${attributeMultiplier.toFixed(2)})`;
  logMessage += ` Dano causado: ${damage}.`;

  return { damage, logMessage };
}


// --- Funções de Gerenciamento de Batalha (Modificadas/Novas) ---
function startBattle(tammer, enemyDigimonData, tammerAttributeFromData) {
  if (currentBattle && currentBattle.isActive) {
    console.log(`Batalha tentou iniciar para ${tammer.username} mas uma batalha já está ativa com ${currentBattle.tammerUsername}.`);
    return false;
  }

  const tammerDigimonBattleStats = {
    name: tammer.digimonName, hp: tammer.digimonHp, maxHp: tammer.digimonHp, mp: tammer.digimonMp, maxMp: tammer.digimonMp,
    forca: tammer.digimonStats.forca, defesa: tammer.digimonStats.defesa, velocidade: tammer.digimonStats.velocidade, sabedoria: tammer.digimonStats.sabedoria,
    type: tammer.digimonType, attribute: tammerAttributeFromData || 'Neutro', stage: tammer.digimonStage,
  };

  const enemyBattleStats = {
    name: enemyDigimonData.name, hp: enemyDigimonData.baseStats.hp, maxHp: enemyDigimonData.baseStats.hp,
    forca: enemyDigimonData.baseStats.forca, defesa: enemyDigimonData.baseStats.defesa, velocidade: enemyDigimonData.baseStats.velocidade, sabedoria: enemyDigimonData.baseStats.sabedoria,
    type: enemyDigimonData.type, attribute: enemyDigimonData.attribute, stage: enemyDigimonData.stage,
    xpReward: calculateXpReward(enemyDigimonData.stage), coinReward: calculateCoinReward(enemyDigimonData.stage),
  };

  currentBattle = {
    isActive: true, tammerUserId: tammer.twitchUserId, tammerUsername: tammer.username,
    tammerDigimon: tammerDigimonBattleStats, enemyDigimon: enemyBattleStats,
    turn: 'player', round: 1, log: [], lastActionTime: Date.now(),
  };

  const initialLog = `Batalha iniciada! ${currentBattle.tammerDigimon.name} (HP: ${currentBattle.tammerDigimon.hp}) vs ${currentBattle.enemyDigimon.name} (HP: ${currentBattle.enemyDigimon.hp}). É o turno de ${currentBattle.tammerUsername}.`;
  currentBattle.log.push(initialLog);
  console.log(initialLog);
  return true;
}

function endBattle() {
  if (currentBattle) {
    console.log(`Batalha finalizada para ${currentBattle.tammerUsername} vs ${currentBattle.enemyDigimon.name}.`);
    currentBattle = null; // Limpa o estado da batalha
    return true;
  }
  return false;
}

function getActiveBattle() {
  return currentBattle;
}

// --- Novas Funções de Ação em Batalha ---
function handlePlayerAttack(attackerUserId) {
  if (!currentBattle || !currentBattle.isActive) return { outcome: 'no_battle', message: "Nenhuma batalha em andamento." };
  if (currentBattle.tammerUserId !== attackerUserId) return { outcome: 'not_your_battle', message: "Esta não é sua batalha." };
  if (currentBattle.turn !== 'player') return { outcome: 'not_your_turn', message: "Não é seu turno para atacar." };

  const { damage, logMessage } = calculateDamage(currentBattle.tammerDigimon, currentBattle.enemyDigimon);
  currentBattle.enemyDigimon.hp -= damage;
  currentBattle.log.push(logMessage);
  currentBattle.lastActionTime = Date.now();

  if (currentBattle.enemyDigimon.hp <= 0) {
    currentBattle.enemyDigimon.hp = 0; // Garante que não seja negativo
    const victoryResult = {
      outcome: 'victory',
      message: `${currentBattle.tammerDigimon.name} derrotou ${currentBattle.enemyDigimon.name}!`,
      xpGained: currentBattle.enemyDigimon.xpReward,
      coinsGained: currentBattle.enemyDigimon.coinReward,
      log: currentBattle.log
    };
    endBattle();
    return victoryResult;
  }

  // Se o inimigo não foi derrotado, passa o turno para o inimigo
  currentBattle.turn = 'enemy';
  currentBattle.log.push(`Turno do ${currentBattle.enemyDigimon.name}.`);
  return handleEnemyAttack(); // Inimigo ataca imediatamente
}

// Função interna, chamada após o ataque do jogador se a batalha continuar
function handleEnemyAttack() {
  // Simples IA: inimigo sempre ataca
  const { damage, logMessage } = calculateDamage(currentBattle.enemyDigimon, currentBattle.tammerDigimon);
  currentBattle.tammerDigimon.hp -= damage;
  currentBattle.log.push(logMessage);
  currentBattle.lastActionTime = Date.now();

  if (currentBattle.tammerDigimon.hp <= 0) {
    currentBattle.tammerDigimon.hp = 0; // Garante que não seja negativo
    const defeatResult = {
      outcome: 'defeat',
      message: `${currentBattle.enemyDigimon.name} derrotou ${currentBattle.tammerDigimon.name}...`,
      tammerFinalHp: currentBattle.tammerDigimon.hp, // HP final do Digimon do jogador
      log: currentBattle.log
    };
    endBattle();
    return defeatResult;
  }

  // Se o jogador não foi derrotado, passa o turno de volta para o jogador
  currentBattle.turn = 'player';
  currentBattle.round += 1;
  currentBattle.log.push(`Turno de ${currentBattle.tammerUsername} (Round ${currentBattle.round}).`);
  return {
    outcome: 'continue',
    message: `A batalha continua! ${currentBattle.tammerDigimon.name} HP: ${currentBattle.tammerDigimon.hp}, ${currentBattle.enemyDigimon.name} HP: ${currentBattle.enemyDigimon.hp}.`,
    nextTurn: 'player',
    log: currentBattle.log,
    currentHpPlayer: currentBattle.tammerDigimon.hp,
    currentHpEnemy: currentBattle.enemyDigimon.hp,
  };
}

module.exports = {
  startBattle,
  endBattle,
  getActiveBattle,
  handlePlayerAttack, // Nova função exportada
  calculateXpReward,
  calculateCoinReward,
};
