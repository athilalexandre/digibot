const Tammer = require('../../../../backend/models/tammer');
const gameConfig = require('../../../config/gameConfig');
const { calculateTrainingXp } = require('../../xpSystem');

async function handleTrainCommand(twitchUserId, trainType, multiplier, username) {
  try {
    const tammer = await Tammer.findOne({ twitchUserId });

    if (!tammer) {
      return `${username}, seu Tammer não foi encontrado. Use !entrar primeiro para se registrar.`;
    }

    // Verifica se o Digimon está no estágio Digitama
    if (tammer.digimonStage === "Digitama") {
      return `${username}, seu Digitama ainda não pode treinar! Cuide bem dele para que evolua.`;
    }

    // Verifica se tem arma equipada
    if (!tammer.hasWeapon()) {
      return `${username}, você precisa equipar uma arma antes de treinar! Use !loja para conseguir uma.`;
    }

    // Verifica cooldown do treino
    if (!tammer.canTrain()) {
      const cooldownMs = gameConfig.training.cooldownSeconds * 1000;
      const timeSinceLastTraining = Date.now() - tammer.lastTrainingTime.getTime();
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastTraining) / 1000);
      return `${username}, aguarde ${remainingSeconds} segundos antes de treinar novamente.`;
    }

    // Verifica se tem pontos de batalha suficientes
    if (!tammer.hasBattlePoints(1)) {
      return `${username}, você não tem Pontos de Batalha suficientes para treinar. Aguarde a regeneração ou use um Restaurador de Energia.`;
    }

    // Obtém custo do treino baseado no estágio
    const stageConfig = gameConfig.stages[tammer.digimonStage];
    if (!stageConfig) {
      return `${username}, estágio inválido para treino.`;
    }

    const baseCost = stageConfig.trainingCost;
    const totalCost = baseCost * multiplier;

    // Verifica se tem bits suficientes
    if (!tammer.hasBits(totalCost)) {
      return `${username}, você não tem bits suficientes para treinar com multiplicador ${multiplier}. Custo total: ${totalCost} bits. Você tem: ${tammer.bits}.`;
    }

    // Consome recursos
    tammer.consumeBits(totalCost);
    tammer.consumeBattlePoints(1);
    tammer.lastTrainingTime = new Date();

    // Calcula XP ganho baseado no XP faltante
    const xpGained = calculateTrainingXp(tammer);
    tammer.digimonXp += xpGained;

    // Atualiza stats baseado no tipo de treino
    let statGainedMessage = "";
    let secondaryGainMessage = "";

    switch (trainType.toLowerCase()) {
      case "for":
        tammer.digimonStats.forca += 1 * multiplier;
        tammer.digimonHp += 1 * multiplier;
        statGainedMessage = `Força: ${tammer.digimonStats.forca}`;
        secondaryGainMessage = `HP: ${tammer.digimonHp}`;
        break;
      case "def":
        tammer.digimonStats.defesa += 1 * multiplier;
        tammer.digimonHp += 1 * multiplier;
        statGainedMessage = `Defesa: ${tammer.digimonStats.defesa}`;
        secondaryGainMessage = `HP: ${tammer.digimonHp}`;
        break;
      case "vel":
        tammer.digimonStats.velocidade += 1 * multiplier;
        tammer.digimonMp += 1 * multiplier;
        statGainedMessage = `Velocidade: ${tammer.digimonStats.velocidade}`;
        secondaryGainMessage = `MP: ${tammer.digimonMp}`;
        break;
      case "sab":
        tammer.digimonStats.sabedoria += 1 * multiplier;
        tammer.digimonMp += 1 * multiplier;
        statGainedMessage = `Sabedoria: ${tammer.digimonStats.sabedoria}`;
        secondaryGainMessage = `MP: ${tammer.digimonMp}`;
        break;
      default:
        // Reembolsa recursos se tipo inválido
        tammer.addBits(totalCost);
        tammer.battlePoints += 1;
        tammer.lastTrainingTime = null;
        return `${username}, tipo de treino inválido: '${trainType}'. Use for, def, vel, ou sab.`;
    }

    await tammer.save();
    
    const message = `${username} treinou ${trainType} (x${multiplier})! +${xpGained} XP, ${statGainedMessage}, ${secondaryGainMessage}. ${totalCost} bits e 1 PB gastos. Bits restantes: ${tammer.bits}, PBs: ${tammer.battlePoints}.`;
    return message;

  } catch (error) {
    console.error(`Erro em handleTrainCommand para ${username} (ID: ${twitchUserId}), tipo: ${trainType}:`, error);
    return `${username}, ocorreu um erro ao processar seu treino. O administrador foi notificado.`;
  }
}

module.exports = {
  handleTrainCommand,
};
