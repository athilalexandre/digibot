const fs = require('fs');
const path = require('path');
const gameConfig = require('../../../config/gameConfig');

// Carrega o catálogo de armas
const weaponsCatalogPath = path.join(__dirname, '../../../data/weapons_catalog.json');
let weaponsCatalog = [];

try {
  const weaponsData = fs.readFileSync(weaponsCatalogPath, 'utf-8');
  weaponsCatalog = JSON.parse(weaponsData);
} catch (error) {
  console.error('Erro ao carregar catálogo de armas:', error);
}

// Estado da loja
let shopState = {
  isActive: false,
  activeUntil: null,
  availableWeapons: [],
  winner: null,
  eventId: null
};

// Função para gerar evento de loja
function generateShopEvent() {
  if (shopState.isActive) return false;
  
  const weapons = [];
  const rarityConfig = gameConfig.weaponRarity;
  
  // Gera 3 armas baseadas na raridade
  for (let i = 0; i < gameConfig.shop.weaponsPerEvent; i++) {
    const rarity = selectRarity(rarityConfig);
    const weaponsOfRarity = weaponsCatalog.filter(w => w.raridade === rarity);
    
    if (weaponsOfRarity.length > 0) {
      const randomWeapon = weaponsOfRarity[Math.floor(Math.random() * weaponsOfRarity.length)];
      const price = generatePrice(rarityConfig[rarity]);
      
      weapons.push({
        ...randomWeapon,
        price: price
      });
    }
  }
  
  shopState = {
    isActive: true,
    activeUntil: new Date(Date.now() + (gameConfig.shop.eventDurationSeconds * 1000)),
    availableWeapons: weapons,
    winner: null,
    eventId: Date.now()
  };
  
  return true;
}

// Função para selecionar raridade baseada nas chances
function selectRarity(rarityConfig) {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [rarity, config] of Object.entries(rarityConfig)) {
    cumulative += config.chance;
    if (random <= cumulative) {
      return rarity;
    }
  }
  
  return 'comum'; // Fallback
}

// Função para gerar preço baseado na raridade
function generatePrice(rarityConfig) {
  const min = rarityConfig.priceMin;
  const max = rarityConfig.priceMax;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para processar comando de loja
function processShopCommand(username, twitchUserId) {
  if (!shopState.isActive) {
    return { success: false, message: `${username}, a loja não está aberta no momento!` };
  }
  
  if (shopState.winner) {
    return { success: false, message: `${username}, ${shopState.winner} já foi o primeiro a chegar na loja!` };
  }
  
  if (Date.now() > shopState.activeUntil.getTime()) {
    shopState.isActive = false;
    return { success: false, message: `${username}, a loja já fechou!` };
  }
  
  // Define o vencedor
  shopState.winner = username;
  
  return {
    success: true,
    weapons: shopState.availableWeapons,
    message: `🎉 ${username} foi o primeiro a chegar na loja!`
  };
}

// Função para processar compra de arma
async function processWeaponPurchase(tammer, weaponId) {
  if (!shopState.isActive || !shopState.winner) {
    return { success: false, message: `${tammer.username}, a loja não está disponível para compras.` };
  }
  
  if (shopState.winner !== tammer.username) {
    return { success: false, message: `${tammer.username}, apenas ${shopState.winner} pode comprar nesta loja.` };
  }
  
  const weapon = shopState.availableWeapons.find(w => w.id === weaponId);
  if (!weapon) {
    return { success: false, message: `${tammer.username}, arma não encontrada na loja.` };
  }
  
  if (!tammer.hasBits(weapon.price)) {
    return { success: false, message: `${tammer.username}, você não tem bits suficientes. Custo: ${weapon.price} bits, você tem: ${tammer.bits} bits.` };
  }
  
  // Processa a compra
  tammer.consumeBits(weapon.price);
  tammer.equipWeapon(weapon);
  
  // Remove a arma da loja
  shopState.availableWeapons = shopState.availableWeapons.filter(w => w.id !== weaponId);
  
  // Se não há mais armas, fecha a loja
  if (shopState.availableWeapons.length === 0) {
    shopState.isActive = false;
  }
  
  return {
    success: true,
    weapon: weapon,
    message: `${tammer.username} comprou ${weapon.nome} ${weapon.emoji} por ${weapon.price} bits!`
  };
}

// Função para processar compra de item
async function processItemPurchase(tammer, itemId) {
  const itemConfig = gameConfig.items[itemId];
  if (!itemConfig) {
    return { success: false, message: `${tammer.username}, item não encontrado.` };
  }
  
  if (!tammer.hasBits(itemConfig.price)) {
    return { success: false, message: `${tammer.username}, você não tem bits suficientes. Custo: ${itemConfig.price} bits, você tem: ${tammer.bits} bits.` };
  }
  
  // Processa a compra
  tammer.consumeBits(itemConfig.price);
  tammer.addItem(itemId, 1);
  
  return {
    success: true,
    item: itemConfig,
    message: `${tammer.username} comprou ${itemConfig.name} por ${itemConfig.price} bits!`
  };
}

// Função para usar item
async function useItem(tammer, itemId) {
  if (!tammer.useItem(itemId)) {
    return { success: false, message: `${tammer.username}, você não tem este item no inventário.` };
  }
  
  switch (itemId) {
    case 'restaurador_energia':
      const stageConfig = gameConfig.stages[tammer.digimonStage];
      if (stageConfig) {
        tammer.battlePoints = stageConfig.battlePoints;
        tammer.lastBattlePointsRegeneration = new Date();
      }
      return { success: true, message: `${tammer.username} usou Restaurador de Energia! Pontos de Batalha restaurados.` };
      
    case 'xp_booster':
      tammer.activateXpBooster();
      return { success: true, message: `${tammer.username} ativou XP Booster por 1 hora! XP de batalhas será duplicado.` };
      
    default:
      return { success: false, message: `${tammer.username}, item não reconhecido.` };
  }
}

// Função para obter status da loja
function getShopStatus() {
  return {
    isActive: shopState.isActive,
    activeUntil: shopState.activeUntil,
    availableWeapons: shopState.availableWeapons,
    winner: shopState.winner,
    timeRemaining: shopState.isActive ? Math.max(0, shopState.activeUntil.getTime() - Date.now()) : 0
  };
}

// Função para limpar estado da loja
function clearShopState() {
  shopState = {
    isActive: false,
    activeUntil: null,
    availableWeapons: [],
    winner: null,
    eventId: null
  };
}

// Função para agendar próximo evento de loja
function scheduleNextShopEvent() {
  const minEvents = gameConfig.shop.eventFrequencyMin;
  const maxEvents = gameConfig.shop.eventFrequencyMax;
  const eventsPer2Hours = Math.floor(Math.random() * (maxEvents - minEvents + 1)) + minEvents;
  
  // Calcula intervalo entre eventos (2 horas = 7200000 ms)
  const intervalMs = (7200000 / eventsPer2Hours);
  
  setTimeout(() => {
    if (generateShopEvent()) {
      console.log('Evento de loja gerado!');
    }
    scheduleNextShopEvent(); // Agenda próximo evento
  }, intervalMs);
}

module.exports = {
  generateShopEvent,
  processShopCommand,
  processWeaponPurchase,
  processItemPurchase,
  useItem,
  getShopStatus,
  clearShopState,
  scheduleNextShopEvent
}; 