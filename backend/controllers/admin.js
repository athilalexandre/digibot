const Tammer = require('../models/tammer');
const gameConfig = require('../../src/config/gameConfig');
const { getStageByXp } = require('../../src/bot/xpSystem'); // Assumindo que a função está exportada
const logger = require('../utils/logger');


const corrigirEstagios = async (req, res) => {
  try {
    logger.info('Iniciando a rotina de correção de estágios...');
    if (!gameConfig || !Array.isArray(gameConfig.xpPerStage)) {
        logger.error('Configuração Incorreta: gameConfig.xpPerStage não está definido ou não é um array.');
        return res.status(500).send({ message: 'Erro de configuração no servidor (xpPerStage).' });
    }
    logger.info('Configuração de estágios (xpPerStage) carregada corretamente.');

    const tammers = await Tammer.find({});
    logger.info(`Encontrados ${tammers.length} domadores para verificar.`);
    let count = 0;

    for (const tammer of tammers) {
      if (typeof tammer.digimonXp !== 'number') {
        logger.warn(`Domador ${tammer.username} (ID: ${tammer._id}) com XP inválido: ${tammer.digimonXp}. Pulando.`);
        continue;
      }

      const correctStage = getStageByXp(tammer.digimonXp);
      
      if (tammer.digimonStage !== correctStage) {
        logger.info(`Corrigindo estágio do domador ${tammer.username}: ${tammer.digimonStage} -> ${correctStage} (XP: ${tammer.digimonXp})`);
        tammer.digimonStage = correctStage;
        await tammer.save();
        count++;
      }
    }

    logger.info(`Processo concluído. Estágios de ${count} domadores foram corrigidos.`);
    res.status(200).send({ message: `Operação concluída. ${count} domadores tiveram seus estágios corrigidos.` });

  } catch (error) {
    logger.error('Erro fatal durante a execução de corrigirEstagios:', error);
    res.status(500).send({ message: 'Erro interno ao executar a correção dos estágios.' });
  }
};


const resetGame = async (req, res) => {
  try {
    logger.warn('INICIANDO PROCESSO DE RESET TOTAL DO JOGO. ESTA AÇÃO É IRREVERSÍVEL.');
    
    const initialState = {
      digimonName: 'Digitama',
      digimonStage: 'Digitama',
      digimonXp: 0,
      bits: gameConfig.initialBits || 500,
      battlePoints: gameConfig.maxBattlePoints || 10,
      inventory: [],
      equippedWeapon: null,
      lastBpRecovery: new Date(),
      lastTraining: new Date(0),
      lastBattle: new Date(0),
    };

    logger.info('Estado inicial que será aplicado a todos os domadores:', initialState);

    const updateResult = await Tammer.updateMany({}, { $set: initialState });

    logger.info(`Operação de reset concluída no banco de dados. Documentos correspondentes: ${updateResult.matchedCount}, Documentos modificados: ${updateResult.modifiedCount}.`);
    
    res.status(200).send({ message: 'O jogo foi resetado para todos os domadores com sucesso.' });
  } catch (error) {
    logger.error('Erro fatal durante a execução de resetGame:', error);
    res.status(500).send({ message: 'Erro interno ao resetar o jogo.' });
  }
};

module.exports = {
  corrigirEstagios,
  resetGame
}; 