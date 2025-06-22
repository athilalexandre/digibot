const Tammer = require('../models/tammer');
const gameConfig = require('../../src/config/gameConfig');
const { getStageByXp } = require('../../src/bot/xpSystem'); // Assumindo que a função está exportada
const logger = require('../utils/logger');


const corrigirEstagios = async (req, res) => {
  try {
    const tammers = await Tammer.find({});
    let count = 0;
    for (const tammer of tammers) {
      const correctStage = getStageByXp(tammer.digimonXp);
      if (tammer.digimonStage !== correctStage) {
        tammer.digimonStage = correctStage;
        await tammer.save();
        count++;
      }
    }
    logger.info(`Estágios de ${count} domadores corrigidos.`);
    res.status(200).send({ message: `Operação concluída. ${count} domadores tiveram seus estágios corrigidos.` });
  } catch (error) {
    logger.error('Erro ao corrigir estágios:', error);
    res.status(500).send({ message: 'Erro interno ao corrigir os estágios.' });
  }
};


const resetGame = async (req, res) => {
  try {
    await Tammer.updateMany({}, {
      $set: {
        digimonName: 'Digitama',
        digimonStage: 'Digitama',
        digimonXp: 0,
        bits: gameConfig.initialBits,
        battlePoints: gameConfig.maxBattlePoints,
        inventory: [],
        equippedWeapon: null,
        lastBpRecovery: new Date(),
        lastTraining: new Date(0),
        lastBattle: new Date(0),
      }
    });
    logger.info('O JOGO FOI RESETADO PARA TODOS OS USUÁRIOS.');
    res.status(200).send({ message: 'O jogo foi resetado para todos os domadores com sucesso.' });
  } catch (error) {
    logger.error('Erro ao resetar o jogo:', error);
    res.status(500).send({ message: 'Erro interno ao resetar o jogo.' });
  }
};

module.exports = {
  corrigirEstagios,
  resetGame
}; 