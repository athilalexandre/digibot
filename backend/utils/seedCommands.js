const mongoose = require('mongoose');
const Command = require('../models/command');
const config = require('../config');

async function seedCommands() {
  await mongoose.connect(config.mongoUri);

  const adminId = '6852e1dfba03c05c1097c3b1';

  const commands = [
    {
      name: '!entrar',
      description: 'Inicia sua jornada no DigiBot e recebe um Digitama',
      usage: '!entrar',
      examples: ['!entrar'],
      cooldown: 0,
      bitCost: 0,
      isModOnly: false,
      isEnabled: true,
      category: 'digimon',
      aliases: [],
      createdBy: adminId
    },
    {
      name: '!meudigimon',
      description: 'Mostra o status atual do seu Digimon',
      usage: '!meudigimon',
      examples: ['!meudigimon'],
      cooldown: 0,
      bitCost: 0,
      isModOnly: false,
      isEnabled: true,
      category: 'digimon',
      aliases: [],
      createdBy: adminId
    },
    {
      name: '!treinar',
      description: 'Treina seu Digimon para aumentar seus atributos',
      usage: '!treinar <for|def|vel|sab> [multiplicador]',
      examples: ['!treinar for', '!treinar def 5', '!treinar vel 10'],
      cooldown: 0,
      bitCost: 0,
      isModOnly: false,
      isEnabled: true,
      category: 'digimon',
      aliases: [],
      createdBy: adminId
    }
  ];

  for (const cmd of commands) {
    const exists = await Command.findOne({ name: cmd.name });
    if (!exists) {
      await Command.create(cmd);
      console.log(`Comando ${cmd.name} criado.`);
    } else {
      console.log(`Comando ${cmd.name} já existe.`);
    }
  }

  await mongoose.disconnect();
  console.log('Seed de comandos finalizado!');
}

seedCommands().catch(err => {
  console.error('Erro ao seedar comandos:', err);
  process.exit(1);
}); 