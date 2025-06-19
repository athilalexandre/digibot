const mongoose = require('mongoose');
const User = require('../models/user');
const config = require('../config');

async function createAdmin() {
  await mongoose.connect(config.mongoUri);

  const adminExists = await User.findOne({ username: 'admin' });
  if (adminExists) {
    if (!adminExists.isAdmin) {
      adminExists.isAdmin = true;
      await adminExists.save();
      // console.log('Usuário admin já existia, permissão de admin garantida.');
    }
    await mongoose.disconnect();
    return;
  }

  const admin = new User({
    username: 'admin',
    email: 'admin@digibot.com',
    password: 'admin123',
    isAdmin: true
  });
  await admin.save();
  await mongoose.disconnect();
  console.log('Usuário admin criado com sucesso! (login: admin / senha: admin123)');
}

createAdmin().catch(err => {
  console.error('Erro ao criar admin:', err);
  process.exit(1);
}); 