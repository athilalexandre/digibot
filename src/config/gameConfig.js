// Configuração central do jogo Digimon
// Todos os valores são ajustáveis via painel de controle ou config.json

const gameConfig = {
  // Sistema de Estágios e Progressão
  stages: {
    "Digitama": { 
      minXp: 0, 
      maxXp: 99, 
      trainingCost: 0, 
      battlePoints: 0,
      evolvesTo: "Baby"
    },
    "Baby": { 
      minXp: 100, 
      maxXp: 499, 
      trainingCost: 0, 
      battlePoints: 6,
      evolvesTo: "Training"
    },
    "Training": { 
      minXp: 500, 
      maxXp: 2499, 
      trainingCost: 100, 
      battlePoints: 5,
      evolvesTo: "Rookie"
    },
    "Rookie": { 
      minXp: 2500, 
      maxXp: 14999, 
      trainingCost: 250, 
      battlePoints: 4,
      evolvesTo: "Champion"
    },
    "Champion": { 
      minXp: 15000, 
      maxXp: 74999, 
      trainingCost: 500, 
      battlePoints: 3,
      evolvesTo: "Ultimate"
    },
    "Ultimate": { 
      minXp: 75000, 
      maxXp: 299999, 
      trainingCost: 1000, 
      battlePoints: 2,
      evolvesTo: "Mega"
    },
    "Mega": { 
      minXp: 300000, 
      maxXp: 999999, 
      trainingCost: 1500, 
      battlePoints: 1,
      evolvesTo: null
    }
  },

  // Sistema de Treino
  training: {
    cooldownSeconds: 15,
    xpPercentMin: 1, // 1% do XP faltante
    xpPercentMax: 5, // 5% do XP faltante
  },

  // Sistema de Batalha
  battle: {
    pveCost: 1000, // Custo para batalha PvE
    pvpCost: 1000, // Custo para batalha PvP
    pveXpPercentMin: 1, // 1% do XP necessário
    pveXpPercentMax: 3, // 3% do XP necessário
    pveBitsMin: 50,
    pveBitsMax: 500,
    pvpXpWinnerMin: 3, // 3% do XP necessário
    pvpXpWinnerMax: 5, // 5% do XP necessário
    pvpXpLoserMin: 1, // 1% do XP necessário
    pvpXpLoserMax: 2, // 2% do XP necessário
    pvpBitsMin: 10,
    pvpBitsMax: 250,
    challengeTimeoutSeconds: 10,
  },

  // Sistema de Pontos de Batalha (PB)
  battlePoints: {
    regenerationTimeMinutes: 60, // 1 hora para regenerar todos os PBs
  },

  // Sistema de Loja
  shop: {
    eventFrequencyMin: 1, // Eventos por 2 horas (mínimo)
    eventFrequencyMax: 3, // Eventos por 2 horas (máximo)
    eventDurationSeconds: 20,
    weaponsPerEvent: 3,
  },

  // Sistema de Raridade de Armas
  weaponRarity: {
    "comum": {
      chance: 60, // 60%
      priceMin: 2000,
      priceMax: 4000
    },
    "incomum": {
      chance: 25, // 25%
      priceMin: 5000,
      priceMax: 8000
    },
    "rara": {
      chance: 10, // 10%
      priceMin: 9000,
      priceMax: 12000
    },
    "lendaria": {
      chance: 5, // 5%
      priceMin: 13000,
      priceMax: 20000
    }
  },

  // Sistema de Itens
  items: {
    "restaurador_energia": {
      name: "Restaurador de Energia",
      description: "Recupera todos os Pontos de Batalha",
      price: 5000
    },
    "xp_booster": {
      name: "XP Booster (1h)",
      description: "Multiplica XP de batalhas por 2x por 1 hora",
      price: 10000,
      durationMinutes: 60
    }
  },

  // Configurações de Progressão
  progression: {
    targetDaysToMega: 30, // Tempo médio para alcançar Mega
    baseXpPerDay: 1000, // XP base por dia para cálculo de balanceamento
  }
};

module.exports = gameConfig; 