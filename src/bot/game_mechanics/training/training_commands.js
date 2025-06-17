const { handleTrainCommand, TRAINING_COST } = require('./training_logic.js');

async function processTrainingCommands(target, context, msg, client) {
  const message = msg.trim().toLowerCase();
  const commandParts = message.split(' '); // Divide a mensagem em partes

  if (commandParts[0] === '!treinar') {
    const trainType = commandParts[1]; // O tipo de treino (for, def, etc.)
    const multiplierArg = commandParts[2]; // O multiplicador (opcional)
    const validTrainTypes = ['for', 'def', 'vel', 'sab']; // Alterado 'forca' para 'for'
    const validMultipliers = [1, 5, 10, 15];

    let multiplier = 1; // Multiplicador padrão
    if (multiplierArg) {
        const parsedMultiplier = parseInt(multiplierArg);
        if (!isNaN(parsedMultiplier) && validMultipliers.includes(parsedMultiplier)) {
            multiplier = parsedMultiplier;
        } else {
            // Informa sobre multiplicador inválido, mas ainda processa com multiplicador 1 se o tipo for válido
            // e o tipo de treino for fornecido.
            if (trainType && validTrainTypes.includes(trainType)) {
                 client.say(target, `${context.username}, multiplicador inválido: '${multiplierArg}'. Multiplicadores válidos: 1, 5, 10, 15. Usando multiplicador 1.`);
            }
        }
    }

    if (trainType && validTrainTypes.includes(trainType)) {
      const twitchUserId = context['user-id'];
      const username = context.username;
      const resultMessage = await handleTrainCommand(twitchUserId, trainType, multiplier, username);
      if (resultMessage) {
        client.say(target, resultMessage);
      }
    } else {
      // Se o tipo de treino for inválido ou não fornecido
      client.say(target, `${context.username}, uso correto: !treinar <for|def|vel|sab> [multiplicador]. Multiplicadores válidos: 1, 5, 10, 15. Custo base: ${TRAINING_COST} coins.`);
    }
    return true; // Indica que o comando foi processado (ou tentado)
  }
  return false; // Indica que não é um comando de treino
}

module.exports = {
  processTrainingCommands,
};
