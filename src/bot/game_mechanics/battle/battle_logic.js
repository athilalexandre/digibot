const fs = require('fs');
const path = require('path');
const coinConfigPath = path.join(__dirname, '../../../../backend/config/coinConfig.json');
const gameConfig = require('../../../config/gameConfig');
const { calculateBattleXp, calculatePvpXp } = require('../../xpSystem');

// Multiplicadores de Dano
const TYPE_ADVANTAGE_MULTIPLIER = 1.5;
const TYPE_DISADVANTAGE_MULTIPLIER = 0.75;
const ATTRIBUTE_ADVANTAGE_MULTIPLIER = 1.5;
const ATTRIBUTE_DISADVANTAGE_MULTIPLIER = 0.75;
const LIGHT_DARK_MULTIPLIER = 1.5; // Luz vs Escuridão e vice-versa

let currentBattle = null;
let pvpChallenges = new Map();

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
function startBattle(tammer, enemyDigimon, tammerAttribute) {
  if (currentBattle && currentBattle.isActive) {
    return false; // Já há uma batalha em andamento
  }

  // Verifica se o Tammer tem arma equipada
  if (!tammer.hasWeapon()) {
    return false;
  }

  // Verifica se tem pontos de batalha
  if (!tammer.hasBattlePoints(1)) {
    return false;
  }

  // Verifica se tem bits suficientes
  if (!tammer.hasBits(gameConfig.battle.pveCost)) {
    return false;
  }

  // Calcula stats do Tammer (base + arma)
  const tammerStats = {
    hp: tammer.digimonHp,
    maxHp: tammer.digimonHp,
    dano: tammer.equippedWeapon.dano,
    defesa: tammer.equippedWeapon.defesa
  };

  // Calcula stats do inimigo (base + arma simulada)
  const enemyStats = {
    hp: enemyDigimon.baseStats ? enemyDigimon.baseStats.hp : 50,
    maxHp: enemyDigimon.baseStats ? enemyDigimon.baseStats.hp : 50,
    dano: Math.floor(Math.random() * 10) + 5, // 5-15 de dano
    defesa: Math.floor(Math.random() * 5) + 2  // 2-7 de defesa
  };

  currentBattle = {
    isActive: true,
    tammerUserId: tammer.twitchUserId,
    tammerDigimon: {
      name: tammer.digimonName,
      hp: tammerStats.hp,
      maxHp: tammerStats.maxHp,
      dano: tammerStats.dano,
      defesa: tammerStats.defesa
    },
    enemyDigimon: {
      name: enemyDigimon.name,
      hp: enemyStats.hp,
      maxHp: enemyStats.maxHp,
      dano: enemyStats.dano,
      defesa: enemyStats.defesa
    },
    turn: 'player',
    round: 1
  };

  return true;
}

function endBattle(outcome) {
  if (!currentBattle) return null;

  let result = { xpGained: 0, bitsGained: 0 };

  if (outcome === 'victory') {
    // Calcula recompensas baseadas na configuração
    result.xpGained = Math.floor(Math.random() * (gameConfig.battle.pveXpPercentMax - gameConfig.battle.pveXpPercentMin + 1)) + gameConfig.battle.pveXpPercentMin;
    result.bitsGained = Math.floor(Math.random() * (gameConfig.battle.pveBitsMax - gameConfig.battle.pveBitsMin + 1)) + gameConfig.battle.pveBitsMin;
  }

  currentBattle = null;
  return result;
}

function getActiveBattle() {
  return currentBattle;
}

// --- Novas Funções de Ação em Batalha ---
function handlePlayerAttack(twitchUserId) {
  if (!currentBattle || !currentBattle.isActive) {
    return { outcome: 'no_battle', message: 'Não há batalha em andamento.' };
  }

  if (currentBattle.tammerUserId !== twitchUserId) {
    return { outcome: 'not_your_battle', message: 'Esta não é sua batalha.' };
  }

  if (currentBattle.turn !== 'player') {
    return { outcome: 'not_your_turn', message: 'Não é seu turno.' };
  }

  // Processa ataque do jogador
  const damage = Math.max(1, currentBattle.tammerDigimon.dano - currentBattle.enemyDigimon.defesa);
  currentBattle.enemyDigimon.hp -= damage;
  
  let message = `⚔️ ${currentBattle.tammerDigimon.name} atacou ${currentBattle.enemyDigimon.name} causando ${damage} de dano!`;
  message += ` ${currentBattle.enemyDigimon.name} HP: ${Math.max(0, currentBattle.enemyDigimon.hp)}/${currentBattle.enemyDigimon.maxHp}`;

  // Verifica se o inimigo foi derrotado
  if (currentBattle.enemyDigimon.hp <= 0) {
    const result = endBattle('victory');
    return {
      outcome: 'victory',
      message: message + ` ${currentBattle.enemyDigimon.name} foi derrotado!`,
      xpGained: result.xpGained,
      bitsGained: result.bitsGained
    };
  }

  // Turno do inimigo
  currentBattle.turn = 'enemy';
  const enemyDamage = Math.max(1, currentBattle.enemyDigimon.dano - currentBattle.tammerDigimon.defesa);
  currentBattle.tammerDigimon.hp -= enemyDamage;
  
  message += ` | ${currentBattle.enemyDigimon.name} contra-atacou causando ${enemyDamage} de dano!`;
  message += ` ${currentBattle.tammerDigimon.name} HP: ${Math.max(0, currentBattle.tammerDigimon.hp)}/${currentBattle.tammerDigimon.maxHp}`;

  // Verifica se o jogador foi derrotado
  if (currentBattle.tammerDigimon.hp <= 0) {
    const result = endBattle('defeat');
    return {
      outcome: 'defeat',
      message: message + ` ${currentBattle.tammerDigimon.name} foi derrotado!`,
      tammerFinalHp: 0
    };
  }

  // Próximo turno do jogador
  currentBattle.turn = 'player';
  currentBattle.round++;
  
  return {
    outcome: 'continue',
    message: message + ` | Seu turno novamente! Use !atacar.`
  };
}

// Função para iniciar desafio PvP
function startPvpChallenge(challenger, target) {
  const challengeId = `${challenger.twitchUserId}_${target.twitchUserId}`;
  
  if (pvpChallenges.has(challengeId)) {
    return { success: false, message: 'Já há um desafio pendente entre estes jogadores.' };
  }

  // Verifica se ambos têm armas equipadas
  if (!challenger.hasWeapon()) {
    return { success: false, message: `${challenger.username} precisa equipar uma arma antes de desafiar.` };
  }

  if (!target.hasWeapon()) {
    return { success: false, message: `${target.username} precisa equipar uma arma antes de ser desafiado.` };
  }

  // Verifica se ambos têm bits suficientes
  if (!challenger.hasBits(gameConfig.battle.pvpCost)) {
    return { success: false, message: `${challenger.username} não tem bits suficientes para o desafio.` };
  }

  if (!target.hasBits(gameConfig.battle.pvpCost)) {
    return { success: false, message: `${target.username} não tem bits suficientes para o desafio.` };
  }

  // Verifica se ambos têm pontos de batalha
  if (!challenger.hasBattlePoints(1)) {
    return { success: false, message: `${challenger.username} não tem Pontos de Batalha suficientes.` };
  }

  if (!target.hasBattlePoints(1)) {
    return { success: false, message: `${target.username} não tem Pontos de Batalha suficientes.` };
  }

  const challenge = {
    challenger: challenger,
    target: target,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + (gameConfig.battle.challengeTimeoutSeconds * 1000))
  };

  pvpChallenges.set(challengeId, challenge);

  // Remove desafio expirado após timeout
  setTimeout(() => {
    if (pvpChallenges.has(challengeId)) {
      pvpChallenges.delete(challengeId);
    }
  }, gameConfig.battle.challengeTimeoutSeconds * 1000);

  return { 
    success: true, 
    message: `${challenger.username} desafiou ${target.username} para uma batalha PvP! ${target.username}, digite !aceitar ${challenger.username} em ${gameConfig.battle.challengeTimeoutSeconds} segundos.`,
    challengeId: challengeId
  };
}

// Função para aceitar desafio PvP
function acceptPvpChallenge(accepter, challengerUsername) {
  const challengeId = `${challengerUsername}_${accepter.twitchUserId}`;
  const challenge = pvpChallenges.get(challengeId);

  if (!challenge) {
    return { success: false, message: 'Não há desafio pendente para aceitar.' };
  }

  if (challenge.target.twitchUserId !== accepter.twitchUserId) {
    return { success: false, message: 'Este desafio não é para você.' };
  }

  if (Date.now() > challenge.expiresAt.getTime()) {
    pvpChallenges.delete(challengeId);
    return { success: false, message: 'O desafio expirou.' };
  }

  // Remove o desafio
  pvpChallenges.delete(challengeId);

  // Inicia a batalha PvP
  return startPvpBattle(challenge.challenger, challenge.target);
}

// Função para iniciar batalha PvP
function startPvpBattle(challenger, target) {
  // Calcula stats baseados em arma + stats base
  const challengerStats = {
    hp: challenger.digimonHp,
    maxHp: challenger.digimonHp,
    dano: challenger.equippedWeapon.dano,
    defesa: challenger.equippedWeapon.defesa
  };

  const targetStats = {
    hp: target.digimonHp,
    maxHp: target.digimonHp,
    dano: target.equippedWeapon.dano,
    defesa: target.equippedWeapon.defesa
  };

  // Simula batalha por turnos até alguém vencer
  let round = 1;
  let challengerHp = challengerStats.hp;
  let targetHp = targetStats.hp;

  while (challengerHp > 0 && targetHp > 0 && round <= 10) {
    // Turno do desafiante
    const challengerDamage = Math.max(1, challengerStats.dano - targetStats.defesa);
    targetHp -= challengerDamage;

    if (targetHp <= 0) break;

    // Turno do alvo
    const targetDamage = Math.max(1, targetStats.dano - challengerStats.defesa);
    challengerHp -= targetDamage;

    round++;
  }

  // Determina vencedor
  const challengerWon = targetHp <= 0;
  const winner = challengerWon ? challenger : target;
  const loser = challengerWon ? target : challenger;

  // Calcula recompensas
  const winnerXp = calculatePvpXp(winner, true);
  const loserXp = calculatePvpXp(loser, false);
  const bitsTransfer = Math.floor(Math.random() * (gameConfig.battle.pvpBitsMax - gameConfig.battle.pvpBitsMin + 1)) + gameConfig.battle.pvpBitsMin;

  return {
    success: true,
    winner: winner,
    loser: loser,
    winnerXp: winnerXp,
    loserXp: loserXp,
    bitsTransfer: bitsTransfer,
    rounds: round,
    message: `⚔️ ${challenger.username} vs ${target.username}! ${winner.username} venceu em ${round} rodadas!`
  };
}

// Função para limpar desafios expirados
function cleanupExpiredChallenges() {
  const now = Date.now();
  for (const [challengeId, challenge] of pvpChallenges.entries()) {
    if (now > challenge.expiresAt.getTime()) {
      pvpChallenges.delete(challengeId);
    }
  }
}

// Limpa desafios expirados a cada minuto
setInterval(cleanupExpiredChallenges, 60000);

module.exports = {
  startBattle,
  handlePlayerAttack,
  endBattle,
  getActiveBattle,
  startPvpChallenge,
  acceptPvpChallenge,
  startPvpBattle
};
