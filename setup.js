const { execSync } = require('child_process');
const path = require('path');

function run(cmd, cwd) {
  console.log(`\n> (${cwd}) ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

console.log('--- Setup integrado DigiBot ---');

// Backend
const backendDir = path.join(__dirname, 'backend');
console.log('\n[Backend] Instalando dependências...');
run('npm install', backendDir);
console.log('[Backend] Rodando seed de admin...');
run('npm run seed:admin', backendDir);

// Frontend
const frontendDir = path.join(__dirname, 'frontend');
console.log('\n[Frontend] Instalando dependências...');
run('npm install', frontendDir);

console.log('\nSetup concluído!');
console.log('Agora você pode rodar:');
console.log('  cd backend && npm run dev   # para backend em desenvolvimento');
console.log('  cd frontend && npm run serve # para frontend em desenvolvimento');
console.log('\nAcesse o painel em http://localhost:8080');
console.log('Login padrão: admin / admin123'); 