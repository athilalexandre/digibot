const Tammer = require('../../../models/Tammer'); // Caminho ajustado
const fs = require('fs');
const path = require('path');
const coinConfigPath = path.join(__dirname, '../../../../backend/config/coinConfig.json');

function getCoinValue() {
  try {
    const data = fs.readFileSync(coinConfigPath, 'utf-8');
    return JSON.parse(data).coinValue || 100;
  } catch {
    return 100;
  }
}

const TRAINING_COST = getCoinValue(); // Custo base do treino centralizado

async function handleTrainCommand(twitchUserId, trainType, multiplier, username) {
  const totalCost = TRAINING_COST * multiplier;
  let message = ""; // Mensagem de retorno para o usuário
  try {
    const tammer = await Tammer.findOne({ twitchUserId });

    if (!tammer) {
      return `${username}, seu Tammer não foi encontrado. Use !entrar primeiro para se registrar.`;
    }

    if (tammer.bits < totalCost) {
      return `${username}, você não tem bits suficientes para treinar com multiplicador ${multiplier}. Custo total: ${totalCost} bits. Você tem: ${tammer.bits}.`;
    }

    // Deduzir bits antes de aplicar o treino
    tammer.bits -= totalCost;

    let statGainedMessage = "";
    let secondaryGainMessage = "";

    switch (trainType.toLowerCase()) { // Normalizar trainType para minúsculas
      case "for": // Alterado de "forca" para "for"
        tammer.digimonStats.forca += 1 * multiplier;
        tammer.digimonHp += 1 * multiplier; // Ganho secundário
        statGainedMessage = `Força: ${tammer.digimonStats.forca}`;
        secondaryGainMessage = `HP: ${tammer.digimonHp}`;
        break;
      case "def":
        tammer.digimonStats.defesa += 1 * multiplier;
        tammer.digimonHp += 1 * multiplier; // Ganho secundário
        statGainedMessage = `Defesa: ${tammer.digimonStats.defesa}`;
        secondaryGainMessage = `HP: ${tammer.digimonHp}`;
        break;
      case "vel":
        tammer.digimonStats.velocidade += 1 * multiplier;
        tammer.digimonMp += 1 * multiplier; // Ganho secundário
        statGainedMessage = `Velocidade: ${tammer.digimonStats.velocidade}`;
        secondaryGainMessage = `MP: ${tammer.digimonMp}`;
        break;
      case "sab":
        tammer.digimonStats.sabedoria += 1 * multiplier;
        tammer.digimonMp += 1 * multiplier; // Ganho secundário
        statGainedMessage = `Sabedoria: ${tammer.digimonStats.sabedoria}`;
        secondaryGainMessage = `MP: ${tammer.digimonMp}`;
        break;
      default:
        // Se chegar aqui, é um erro, pois a validação do tipo de treino deve ser feita
        // no arquivo de comandos. Reembolsar bits se foram deduzidas indevidamente.
        tammer.bits += totalCost; // Reembolso
        // Não precisa salvar aqui, pois a mensagem de erro impede o save mais abaixo.
        return `${username}, tipo de treino inválido: '${trainType}'. Use forca, def, vel, ou sab.`;
    }

    await tammer.save();
    message = `${username} treinou ${trainType} (x${multiplier})! Novos status -> ${statGainedMessage}, ${secondaryGainMessage}. ${totalCost} bits gastas. Bits restantes: ${tammer.bits}.`;
    return message;

  } catch (error) {
    console.error(`Erro em handleTrainCommand para ${username} (ID: ${twitchUserId}), tipo: ${trainType}:`, error);
    // Não reembolsar bits aqui, pois o erro pode ter ocorrido após o save ou em outra lógica.
    // Idealmente, transações seriam usadas, mas para este escopo é complexo.
    return `${username}, ocorreu um erro ao processar seu treino. O administrador foi notificado.`;
  }
}

module.exports = {
  handleTrainCommand,
  TRAINING_COST, // Exportar o custo para ser usado em outros módulos
};
