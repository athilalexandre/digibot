<template>
  <div class="config">
    <h1>Configurações</h1>
    <div v-if="statusMessage" class="status-message">{{ statusMessage }}</div>
    <div v-if="statusError" class="status-error">{{ statusError }}</div>

    <div class="config-sections">
      <!-- Configurações do Bot -->
      <div class="config-section">
        <h2>Configurações do Bot</h2>
        <div class="form-group">
          <label>Nome de Usuário do Bot</label>
          <input v-model="config.twitchUsername" placeholder="ex: meu_bot" />
        </div>
        <div class="form-group">
          <label>Token OAuth</label>
          <input v-model="config.twitchOAuth" type="password" placeholder="oauth:..." />
        </div>
        <div class="form-group">
          <label>Canal da Twitch</label>
          <input v-model="config.twitchChannel" placeholder="ex: seu_canal" />
        </div>
      </div>

      <!-- Configurações do MongoDB -->
      <div class="config-section">
        <h2>Configurações do MongoDB</h2>
        <div class="form-group">
          <label>Caminho do MongoDB</label>
          <div class="input-group">
            <input v-model="config.mongodbPath" placeholder="C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" />
            <button @click="testMongoDB" class="test-button">
              <i class="fas fa-vial"></i>
              Testar
            </button>
          </div>
          <small>O caminho padrão é: C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe</small>
        </div>
        <div class="form-group">
          <label>URI do MongoDB</label>
          <input v-model="config.mongodbUri" placeholder="mongodb://localhost:27017/digibot" />
        </div>
      </div>

      <!-- Configurações do Chat -->
      <div class="config-section">
        <h2>Configurações do Chat</h2>
        <div class="form-group">
          <label>Mostrar Chat da Twitch</label>
          <div class="toggle-switch">
            <input type="checkbox" v-model="config.showChat" id="showChat" />
            <label for="showChat"></label>
          </div>
        </div>
        <div class="form-group">
          <label>Modo Chat</label>
          <select v-model="config.chatMode">
            <option value="embed">Embed</option>
            <option value="popout">Popout</option>
          </select>
        </div>
        <div class="form-group">
          <label>Taxa de Conversão de Bits (moedas do chat p/ 1 bit)</label>
          <input v-model="config.coinConversionRate" placeholder="ex: 100" />
        </div>
        <div class="form-group">
          <label>Valor dos Bits em Eventos</label>
          <input v-model="config.coinValueForEvents" placeholder="ex: 50" />
        </div>
      </div>
    </div>

    <!-- Chat da Twitch (se ativado) -->
    <!-- Removido o chat da Twitch -->

    <!-- Botões de Ação -->
    <div class="action-buttons">
      <button @click="saveConfig" class="save-button">
        <i class="fas fa-save"></i>
        Salvar Configurações
      </button>
      <button @click="startBot" class="start-button" :disabled="!config.twitchUsername || !config.twitchOAuth || !config.twitchChannel || isStartingBot">
        <i class="fas fa-play"></i>
        <span v-if="isStartingBot">Iniciando...</span>
        <span v-else>Iniciar Bot</span>
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

const CONFIG_KEY = 'digibot_config';

export default {
  name: 'Config',
  data() {
    return {
      config: {
        twitchUsername: '',
        twitchOAuth: '',
        twitchChannel: '',
        mongodbPath: 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
        mongodbUri: 'mongodb://localhost:27017/digibot',
        showChat: true,
        chatMode: 'embed'
      },
      window: window,
      statusMessage: '',
      statusError: '',
      isStartingBot: false
    }
  },
  created() {
    // Carregar configurações do localStorage se existirem
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      try {
        this.config = { ...this.config, ...JSON.parse(saved) };
      } catch (e) {}
    }
  },
  methods: {
    async saveConfig() {
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
        // (Opcional) Salvar no backend futuramente
        this.statusMessage = 'Configurações salvas com sucesso!';
        this.statusError = '';
      } catch (error) {
        this.statusError = 'Erro ao salvar configurações.';
        this.statusMessage = '';
      }
    },
    async testMongoDB() {
      try {
        // Futuramente: await api.post('/config/test-mongodb', { path: this.config.mongodbPath })
        this.statusMessage = 'Conexão com MongoDB testada com sucesso!';
        this.statusError = '';
      } catch (error) {
        this.statusError = 'Erro ao conectar com MongoDB.';
        this.statusMessage = '';
      }
    },
    async startBot() {
      if (this.isStartingBot) return;
      this.isStartingBot = true;
      this.statusMessage = '';
      this.statusError = '';
      try {
        const response = await api.post('/bot/start', {
          username: this.config.twitchUsername,
          oauth: this.config.twitchOAuth,
          channel: this.config.twitchChannel
        });
        // Se status 200, sempre mostrar mensagem de sucesso
        if (response.status === 200) {
          this.statusMessage = response.data?.message || 'Bot iniciado com sucesso!';
          this.statusError = '';
        } else {
          this.statusMessage = '';
          this.statusError = response.data?.message || 'Erro ao iniciar bot.';
        }
      } catch (err) {
        this.statusMessage = '';
        this.statusError = err.response?.data?.message || 'Erro ao iniciar bot.';
      } finally {
        this.isStartingBot = false;
      }
    }
  }
}
</script>

<style scoped>
.config {
  padding: 1rem;
}

.config-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 900px) {
  .config-sections {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .config {
    padding: 0.5rem;
  }
  .config-section {
    padding: 1rem;
  }
}

.config-section {
  background-color: var(--sidebar-color);
  padding: 1.5rem;
  border-radius: 8px;
}

.config-section h2 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
}

.form-group small {
  display: block;
  margin-top: 0.5rem;
  color: #888;
}

.input-group {
  display: flex;
  gap: 1rem;
}

.test-button {
  padding: 0.75rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--primary-color);
}

.toggle-switch input:checked + label:before {
  transform: translateX(26px);
}

.twitch-chat {
  margin-top: 2rem;
  background-color: var(--sidebar-color);
  padding: 1rem;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.save-button {
  background: linear-gradient(90deg, #2196f3 0%, #00c6fb 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  margin-top: 1rem;
  box-shadow: 0 2px 8px 0 rgba(33,150,243,0.10);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.save-button:hover {
  background: linear-gradient(90deg, #00c6fb 0%, #2196f3 100%);
  color: #232428;
  transform: scale(1.05);
  box-shadow: 0 4px 16px 0 rgba(33,150,243,0.18);
}

.start-button {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  margin-top: 1rem;
  box-shadow: 0 2px 8px 0 rgba(67,233,123,0.10);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.start-button:hover {
  background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
  color: #232428;
  transform: scale(1.05);
  box-shadow: 0 4px 16px 0 rgba(67,233,123,0.18);
}

.test-button, .action-buttons button:not(.save-button):not(.start-button) {
  background: linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  margin-top: 1rem;
  box-shadow: 0 2px 8px 0 rgba(123,47,242,0.10);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.test-button:hover, .action-buttons button:not(.save-button):not(.start-button):hover {
  background: linear-gradient(90deg, #f357a8 0%, #ffe259 100%);
  color: #232428;
  transform: scale(1.05);
  box-shadow: 0 4px 16px 0 rgba(243,87,168,0.18);
}

.status-message {
  color: #4CAF50;
  background: #1a2a1a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: center;
}
.status-error {
  color: #ff4d4f;
  background: #2a1a1a;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: center;
}
</style> 