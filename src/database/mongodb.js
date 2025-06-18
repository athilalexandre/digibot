const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const DEFAULT_MONGODB_PATH = 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe';
const CONFIG_FILE = path.join(__dirname, '../../config/mongodb-config.json');

// Função para criar interface de leitura do console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para verificar se o MongoDB está instalado no caminho padrão
const checkMongoDBInstallation = () => {
    return fs.existsSync(DEFAULT_MONGODB_PATH);
};

// Função para salvar o caminho do MongoDB
const saveMongoDBPath = (path) => {
    const config = { mongodbPath: path };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

// Função para carregar o caminho do MongoDB
const loadMongoDBPath = () => {
    if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        return config.mongodbPath;
    }
    return null;
};

// Função para solicitar o caminho do MongoDB ao usuário
const promptMongoDBPath = () => {
    return new Promise((resolve) => {
        console.log('\n⚠️  MongoDB não encontrado no caminho padrão.');
        console.log('Por favor, instale o MongoDB em: C:\\Program Files\\MongoDB\\Server\\7.0\\');
        console.log('Ou forneça o caminho completo para o executável mongod.exe:');
        
        rl.question('Caminho do MongoDB: ', (path) => {
            if (fs.existsSync(path)) {
                saveMongoDBPath(path);
                resolve(path);
            } else {
                console.log('❌ Caminho inválido. Por favor, tente novamente.');
                resolve(promptMongoDBPath());
            }
        });
    });
};

// Função para verificar se o MongoDB está rodando
const checkMongoDBRunning = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digibot', {
            serverSelectionTimeoutMS: 2000
        });
        return true;
    } catch (error) {
        return false;
    }
};

const connectDB = async () => {
    try {
        // Verifica se o MongoDB está rodando
        const isRunning = await checkMongoDBRunning();
        if (!isRunning) {
            console.error('\n❌ MongoDB não está rodando!');
            console.log('Por favor, inicie o MongoDB antes de executar o bot.');
            console.log('Você pode iniciar o MongoDB usando o comando: npm run start:mongodb');
            process.exit(1);
        }

        // Verifica a instalação do MongoDB
        let mongodbPath = loadMongoDBPath();
        if (!mongodbPath) {
            if (!checkMongoDBInstallation()) {
                mongodbPath = await promptMongoDBPath();
            } else {
                mongodbPath = DEFAULT_MONGODB_PATH;
                saveMongoDBPath(mongodbPath);
            }
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digibot');
        console.log(`\n✅ MongoDB Conectado: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`\n❌ Erro ao conectar ao MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 