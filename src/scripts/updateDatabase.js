const connectDB = require('../database/mongodb');
const Tammer = require('../../backend/models/tammer');
const gameConfig = require('../config/gameConfig');

async function updateDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    await connectDB();
    
    // Aguarda um pouco para garantir que a conexão está estável
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Atualizando Tammers existentes...');
    
    // Busca todos os Tammers com timeout aumentado
    const tammers = await Tammer.find({}).maxTimeMS(30000);
    console.log(`Encontrados ${tammers.length} Tammers para atualizar.`);
    
    let updatedCount = 0;
    
    for (const tammer of tammers) {
      let needsUpdate = false;
      
      // Inicializa campos de arma se não existirem
      if (!tammer.equippedWeapon) {
        tammer.equippedWeapon = {
          id: null,
          nome: null,
          tipo: null,
          dano: 0,
          defesa: 0,
          raridade: null,
          emoji: null
        };
        needsUpdate = true;
      }
      
      // Inicializa pontos de batalha se não existirem
      if (tammer.battlePoints === undefined) {
        const stageConfig = gameConfig.stages[tammer.digimonStage];
        tammer.battlePoints = stageConfig ? stageConfig.battlePoints : 0;
        needsUpdate = true;
      }
      
      // Inicializa lastBattlePointsRegeneration se não existir
      if (!tammer.lastBattlePointsRegeneration) {
        tammer.lastBattlePointsRegeneration = new Date();
        needsUpdate = true;
      }
      
      // Inicializa lastTrainingTime se não existir
      if (!tammer.lastTrainingTime) {
        tammer.lastTrainingTime = null;
        needsUpdate = true;
      }
      
      // Inicializa inventário se não existir
      if (!tammer.inventory) {
        tammer.inventory = {
          restaurador_energia: 0,
          xp_booster: 0
        };
        needsUpdate = true;
      }
      
      // Inicializa boosters ativos se não existirem
      if (!tammer.activeBoosts) {
        tammer.activeBoosts = {
          xpBooster: {
            active: false,
            expiresAt: null
          }
        };
        needsUpdate = true;
      }
      
      // Inicializa desafios PvP se não existirem
      if (!tammer.pvpChallenges) {
        tammer.pvpChallenges = {
          challengedBy: null,
          challengedAt: null,
          isChallenging: null,
          challengingSince: null
        };
        needsUpdate = true;
      }
      
      // Salva se houve mudanças
      if (needsUpdate) {
        await tammer.save();
        updatedCount++;
        console.log(`Tammer ${tammer.username} atualizado.`);
      }
    }
    
    console.log(`Atualização concluída! ${updatedCount} Tammers foram atualizados.`);
    
  } catch (error) {
    console.error('Erro ao atualizar banco de dados:', error);
    console.log('Tentando método alternativo...');
    
    try {
      // Método alternativo: atualizar diretamente via MongoDB
      const mongoose = require('mongoose');
      const db = mongoose.connection;
      
      if (db.readyState === 1) {
        console.log('Usando método alternativo de atualização...');
        
        const result = await db.collection('tammers').updateMany(
          {},
          {
            $set: {
              equippedWeapon: {
                id: null,
                nome: null,
                tipo: null,
                dano: 0,
                defesa: 0,
                raridade: null,
                emoji: null
              },
              battlePoints: 0,
              lastBattlePointsRegeneration: new Date(),
              lastTrainingTime: null,
              inventory: {
                restaurador_energia: 0,
                xp_booster: 0
              },
              activeBoosts: {
                xpBooster: {
                  active: false,
                  expiresAt: null
                }
              },
              pvpChallenges: {
                challengedBy: null,
                challengedAt: null,
                isChallenging: null,
                challengingSince: null
              }
            }
          },
          { upsert: false }
        );
        
        console.log(`Método alternativo concluído! ${result.modifiedCount} documentos atualizados.`);
      }
    } catch (altError) {
      console.error('Erro no método alternativo:', altError);
    }
  } finally {
    process.exit(0);
  }
}

// Executa a atualização
updateDatabase(); 