// training_commands.js
const { handleTrainCommand, TRAINING_COST } = require('./training_logic.js');

async function processTrainingCommands(target, context, msg, client) {
  const message = msg.trim().toLowerCase();
  const commandParts = message.split(' '); // Divide a mensagem em partes

  if (commandParts[0] === '!treinar') {
    const trainType = commandParts[1]; // O tipo de treino (forca, def, etc.)
    const validTrainTypes = ['forca', 'def', 'vel', 'sab'];

    if (trainType && validTrainTypes.includes(trainType)) {
      const twitchUserId = context['user-id'];
      const username = context.username;
      
      const resultMessage = await handleTrainCommand(twitchUserId, trainType, username);
      if (resultMessage) {
        client.say(target, resultMessage);
      }
    } else {
      // Se o tipo de treino for inválido ou não fornecido
      client.say(target, `${context.username}, uso correto: !treinar <forca|def|vel|sab>. Custo: ${TRAINING_COST} coins.`);
    }
    return true; // Indica que o comando foi processado (ou tentado)
  }
  return false; // Indica que não é um comando de treino
}

module.exports = {
  processTrainingCommands,
};
