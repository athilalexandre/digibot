// training_logic.js
const Tammer = require('../../../models/Tammer');

const TRAINING_COST = 100; // Custo do treino centralizado

async function handleTrainCommand(twitchUserId, trainType, username) {
  const cost = TRAINING_COST;
  let message = ""; // Mensagem de retorno para o usuário

  try {
    const tammer = await Tammer.findOne({ twitchUserId });

    if (!tammer) {
      return `${username}, seu Tammer não foi encontrado. Use !entrar primeiro para se registrar.`;
    }

    if (tammer.coins < cost) {
      return `${username}, você não tem coins suficientes para treinar. Custo: ${cost} coins. Você tem: ${tammer.coins}.`;
    }

    // Deduzir coins antes de aplicar o treino
    tammer.coins -= cost;

    let statGainedMessage = "";
    let secondaryGainMessage = "";

    switch (trainType.toLowerCase()) { // Normalizar trainType para minúsculas
      case "forca":
        tammer.digimonStats.forca += 1;
        tammer.digimonHp += 1; // Ganho secundário
        statGainedMessage = `Força: ${tammer.digimonStats.forca}`;
        secondaryGainMessage = `HP: ${tammer.digimonHp}`;
        break;
      case "def":
        tammer.digimonStats.defesa += 1;
        tammer.digimonHp += 1; // Ganho secundário
        statGainedMessage = `Defesa: ${tammer.digimonStats.defesa}`;
        secondaryGainMessage = `HP: ${tammer.digimonHp}`;
        break;
      case "vel":
        tammer.digimonStats.velocidade += 1;
        tammer.digimonMp += 1; // Ganho secundário
        statGainedMessage = `Velocidade: ${tammer.digimonStats.velocidade}`;
        secondaryGainMessage = `MP: ${tammer.digimonMp}`;
        break;
      case "sab":
        tammer.digimonStats.sabedoria += 1;
        tammer.digimonMp += 1; // Ganho secundário
        statGainedMessage = `Sabedoria: ${tammer.digimonStats.sabedoria}`;
        secondaryGainMessage = `MP: ${tammer.digimonMp}`;
        break;
      default:
        // Se chegar aqui, é um erro, pois a validação do tipo de treino deve ser feita
        // no arquivo de comandos. Reembolsar coins se foram deduzidas indevidamente.
        tammer.coins += cost; // Reembolso
        // Não precisa salvar aqui, pois a mensagem de erro impede o save mais abaixo.
        return `${username}, tipo de treino inválido: '${trainType}'. Use forca, def, vel, ou sab.`;
    }

    await tammer.save();
    message = `${username} treinou ${trainType}! Novos status -> ${statGainedMessage}, ${secondaryGainMessage}. ${cost} coins gastas. Coins restantes: ${tammer.coins}.`;
    return message;

  } catch (error) {
    console.error(`Erro em handleTrainCommand para ${username} (ID: ${twitchUserId}), tipo: ${trainType}:`, error);
    // Não reembolsar coins aqui, pois o erro pode ter ocorrido após o save ou em outra lógica.
    // Idealmente, transações seriam usadas, mas para este escopo é complexo.
    return `${username}, ocorreu um erro ao processar seu treino. O administrador foi notificado.`;
  }
}

module.exports = {
  handleTrainCommand,
  TRAINING_COST, // Exportar o custo para ser usado em outros módulos
};
