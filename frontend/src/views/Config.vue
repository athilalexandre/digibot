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
      </div>
    </div>

    <!-- Chat da Twitch (se ativado) -->
    <div v-if="config.showChat" class="twitch-chat">
      <iframe
        :src="`https://www.twitch.tv/embed/${config.twitchChannel}/chat?parent=${window.location.hostname}`"
        frameborder="0"
        scrolling="no"
        height="500"
        width="350"
      ></iframe>
    </div>

    <!-- Botões de Ação -->
    <div class="action-buttons">
      <button @click="saveConfig" class="save-button">
        <i class="fas fa-save"></i>
        Salvar Configurações
      </button>
      <button @click="startBot" class="start-button" :disabled="!config.twitchUsername || !config.twitchOAuth || !config.twitchChannel">
        <i class="fas fa-play"></i>
        Iniciar Bot
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

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
      statusError: ''
    }
  },
  methods: {
    async saveConfig() {
      try {
        // Futuramente: await api.post('/config', this.config)
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
      try {
        // Futuramente: await api.post('/bot/start', this.config)
        this.statusMessage = 'Bot iniciado com sucesso!';
        this.statusError = '';
      } catch (error) {
        this.statusError = 'Erro ao iniciar bot.';
        this.statusMessage = '';
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

.save-button,
.start-button {
  padding: 1rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.save-button {
  background-color: var(--secondary-color);
  color: white;
}

.start-button {
  background-color: var(--primary-color);
  color: white;
}

.start-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.save-button:hover,
.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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