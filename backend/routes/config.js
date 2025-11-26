const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger').createModuleLogger('ConfigRoutes');

const CONFIG_FILE = path.join(__dirname, '../config/bot-settings.json');

// Garante que o diretório existe
const configDir = path.dirname(CONFIG_FILE);
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// GET /api/config - Retorna configurações atuais (sem dados sensíveis)
router.get('/', (req, res) => {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            return res.json({
                twitchUsername: '',
                twitchChannel: '',
                mongoPath: 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
                mongoUri: 'mongodb://localhost:27017/digibot'
            });
        }

        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

        // Remove dados sensíveis
        const safeConfig = {
            twitchUsername: config.twitchUsername || '',
            twitchChannel: config.twitchChannel || '',
            mongoPath: config.mongoPath || 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
            mongoUri: config.mongoUri || 'mongodb://localhost:27017/digibot',
            hasOAuthToken: !!config.twitchOAuth
        };

        res.json(safeConfig);
    } catch (error) {
        logger.error('Erro ao ler configurações:', error);
        res.status(500).json({ error: 'Erro ao ler configurações' });
    }
});

// POST /api/config/save - Salva configurações e reinicia o bot
router.post('/save', async (req, res) => {
    try {
        const { twitchUsername, twitchOAuth, twitchChannel, mongoPath, mongoUri } = req.body;

        // Validação básica
        if (!twitchUsername || !twitchOAuth || !twitchChannel) {
            return res.status(400).json({
                error: 'Campos obrigatórios: twitchUsername, twitchOAuth, twitchChannel'
            });
        }

        // Prepara o objeto de configuração
        const config = {
            twitchUsername,
            twitchOAuth,
            twitchChannel,
            mongoPath: mongoPath || 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
            mongoUri: mongoUri || 'mongodb://localhost:27017/digibot'
        };

        // Salva no arquivo
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        logger.info('Configurações salvas com sucesso');

        // Recarrega a configuração e reinicia o bot
        try {
            const configModule = require('../../src/config');
            configModule.reloadConfig();

            const { restartBot } = require('../../src/bot/bot');
            await restartBot();

            logger.info('Bot reiniciado com sucesso');
            res.json({
                success: true,
                message: 'Configurações salvas e bot reiniciado com sucesso!'
            });
        } catch (botError) {
            logger.error('Erro ao reiniciar bot:', botError);
            res.json({
                success: true,
                message: 'Configurações salvas, mas houve erro ao reiniciar o bot. Reinicie o servidor manualmente.',
                warning: botError.message
            });
        }
    } catch (error) {
        logger.error('Erro ao salvar configurações:', error);
        res.status(500).json({ error: 'Erro ao salvar configurações: ' + error.message });
    }
});

module.exports = router;
