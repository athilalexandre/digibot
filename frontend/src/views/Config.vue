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
          <div class="input-with-button">
            <input v-model="config.twitchUsername" placeholder="Nome de usuário do bot" />
            <a href="https://www.twitch.tv/signup" target="_blank" class="helper-button" title="Criar conta">
              <i class="fas fa-user-plus"></i> Criar
            </a>
          </div>
          <small><strong>Importante:</strong> Crie uma conta separada na Twitch para o bot (recomendado) ou use sua própria conta. O nome de usuário é o login da conta.</small>
        </div>
        <div class="form-group">
          <label>Token OAuth</label>
          <div class="input-with-button">
            <input type="password" v-model="config.twitchOAuth" placeholder="oauth:..." />
            <a href="https://twitchtokengenerator.com/" target="_blank" class="helper-button" title="Gerar Token">
              <i class="fas fa-key"></i> Gerar Token
            </a>
          </div>
          <small>Necessário para o bot conectar ao chat.</small>
        </div>
        <div class="form-group">
          <label>Canal da Twitch</label>
          <div class="input-with-button">
            <input v-model="config.twitchChannel" placeholder="Nome do seu canal" />
            <a :href="`https://www.twitch.tv/${config.twitchChannel || ''}`" target="_blank" class="helper-button" title="Ir para o canal">
              <i class="fas fa-external-link-alt"></i> Canal
            </a>
          </div>
          <small>O canal onde o bot vai operar (geralmente seu canal).</small>
        </div>
      </div>

      <!-- Configurações do MongoDB -->
      <div class="config-section">
        <h2>Configurações do MongoDB</h2>
        <div class="form-group">
          <label>Caminho do MongoDB</label>
          <div class="input-with-button">
            <input v-model="config.mongoPath" placeholder="Caminho para o executável mongod" />
            <button @click="testMongoConnection" class="test-button">Testar</button>
          </div>
          <small>O caminho padrão é: C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe</small>
        </div>
        <div class="form-group">
          <label>URI do MongoDB</label>
          <input v-model="config.mongoUri" placeholder="mongodb://localhost:27017/digibot" />
        </div>
      </div>
    </div>

    <!-- Guia de Configuração -->
    <div class="guide-section">
      <h2><i class="fas fa-book"></i> Guia de Configuração Rápida</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <h3>Criar Conta do Bot</h3>
          <p><strong>Recomendado:</strong> Crie uma conta separada na Twitch para o bot clicando em "Criar" acima. Use um nome como "SeuNomeBot".</p>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <h3>Gerar Token</h3>
          <p>Clique em <strong>"Gerar Token"</strong> acima. Faça login com a conta do bot e selecione "Bot Chat Token".</p>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <h3>Copiar Access Token</h3>
          <p>Na página de resultados, copie o <strong>ACCESS TOKEN</strong> (primeiro campo verde). Se não começar com "oauth:", adicione antes.</p>
        </div>
        <div class="step-card">
          <div class="step-number">4</div>
          <h3>Salvar e Conectar</h3>
          <p>Preencha todos os campos e clique em "Salvar". O bot será reiniciado automaticamente e aparecerá no chat!</p>
        </div>
      </div>
    </div>

    <!-- Botões de Ação -->
    <div class="action-buttons">
      <button @click="saveConfig" class="save-button" :disabled="isSaving">
        <i class="fas fa-save"></i>
        {{ isSaving ? 'Salvando...' : 'Salvar Configurações' }}
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
        mongoPath: 'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
        mongoUri: 'mongodb://localhost:27017/digibot'
      },
      statusMessage: '',
      statusError: '',
      isSaving: false
    }
  },
  async created() {
    // Carregar configurações do backend
    try {
      const response = await api.get('/config');
      if (response.data) {
        this.config = { ...this.config, ...response.data };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Fallback para localStorage
      const saved = localStorage.getItem(CONFIG_KEY);
      if (saved) {
        try {
          this.config = { ...this.config, ...JSON.parse(saved) };
        } catch (e) {}
      }
    }
  },
  methods: {
    async saveConfig() {
      this.isSaving = true;
      this.statusMessage = '';
      this.statusError = '';
      
      try {
        // Salva no backend
        const response = await api.post('/config/save', this.config);
        
        if (response.data.success) {
          this.statusMessage = response.data.message;
          if (response.data.warning) {
            this.statusMessage += ' Aviso: ' + response.data.warning;
          }
          // Também salva no localStorage como backup
          localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
        } else {
          this.statusError = response.data.error || 'Erro desconhecido';
        }
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        this.statusError = error.response?.data?.error || 'Erro ao salvar configurações. Verifique se o backend está rodando.';
      } finally {
        this.isSaving = false;
      }
    },
    async testMongoConnection() {
      try {
        this.statusMessage = 'Testando conexão com MongoDB...';
        this.statusError = '';
        // TODO: Implementar teste real
        setTimeout(() => {
          this.statusMessage = 'Função de teste será implementada em breve.';
        }, 1000);
      } catch (error) {
        this.statusError = 'Erro ao conectar com MongoDB.';
        this.statusMessage = '';
      }
    }
  }
}
</script>

<style scoped>
.config-page {
  padding: 1rem;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 900px) {
  .config-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 600px) {
  .config-page {
    padding: 0.5rem;
  }
  .config-card {
    padding: 1rem;
  }
}

.config-card {
  background-color: var(--sidebar-color);
  padding: 1.5rem;
  border-radius: 8px;
}

.card-title {
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

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.helper-button {
  padding: 0.75rem 1rem;
  background-color: #4a4e58;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.helper-button:hover {
  background-color: #5a5e68;
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

.guide-section {
  margin-top: 3rem;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.guide-section h2 {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.step-card {
  background-color: var(--sidebar-color);
  padding: 1.5rem;
  border-radius: 8px;
  position: relative;
  border: 1px solid var(--border-color);
}

.step-number {
  position: absolute;
  top: -10px;
  left: -10px;
  width: 30px;
  height: 30px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.step-card h3 {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.step-card p {
  font-size: 0.9rem;
  color: #aaa;
  line-height: 1.4;
}

.step-card code {
  background-color: rgba(0,0,0,0.3);
  padding: 2px 4px;
  border-radius: 4px;
  color: #ff79c6;
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

.save-button:hover:not(:disabled) {
  background: linear-gradient(90deg, #00c6fb 0%, #2196f3 100%);
  color: #232428;
  transform: scale(1.05);
  box-shadow: 0 4px 16px 0 rgba(33,150,243,0.18);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-button {
  background: linear-gradient(90deg, #7b2ff2 0%, #f357a8 100%);
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.2rem;
  box-shadow: 0 2px 8px 0 rgba(123,47,242,0.10);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.test-button:hover {
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