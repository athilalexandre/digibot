const { execSync } = require('child_process');
const path = require('path');

function run(cmd, cwd = process.cwd()) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

console.log('--- Setup automático DigiBot ---');

// Instalar dependências
run('npm install');

// Rodar seed de admin
run('npm run seed:admin');

console.log('\nSetup concluído!');
console.log('Agora você pode rodar:');
console.log('  npm run dev   # para desenvolvimento');
console.log('  npm start     # para produção');
console.log('\nAcesse o painel em http://localhost:8080');
console.log('Login padrão: admin / 123'); 