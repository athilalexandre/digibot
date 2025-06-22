<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div v-if="statusError" class="status-error">{{ statusError }}</div>
    
    <div class="status-cards">
      <div class="card">
        <i class="fas fa-robot"></i>
        <h3>Status do Bot</h3>
        <p :class="{ 'online': botStatus, 'offline': !botStatus }">
          {{ botStatus ? 'Online' : 'Offline' }}
        </p>
      </div>
      
      <div class="card">
        <i class="fas fa-database"></i>
        <h3>MongoDB</h3>
        <p :class="{ 'online': mongodbStatus, 'offline': !mongodbStatus }">
          {{ mongodbStatus ? 'Conectado' : 'Desconectado' }}
        </p>
      </div>
      
      <div class="card">
        <i class="fas fa-users"></i>
        <h3>Usuários Ativos</h3>
        <p>{{ activeUsers }}</p>
      </div>
    </div>

    <!-- Ações de Admin -->
    <div class="admin-actions-container">
      <h2>Ações de Administrador</h2>
      <div class="actions-grid">
        <div class="action-card">
          <h3>Corrigir Estágios</h3>
          <p>Varre o banco de dados e corrige o estágio de qualquer Digimon que esteja inconsistente com seu XP atual.</p>
          <button 
            @click="confirmAndRun('corrigirEstagios')" 
            :disabled="isLoading.corrigirEstagios"
          >
            <span v-if="isLoading.corrigirEstagios">Executando...</span>
            <span v-else>Executar Correção</span>
          </button>
        </div>
        <div class="action-card">
          <h3>Resetar Jogo</h3>
          <p>Reseta TODO o progresso de TODOS os jogadores para o estado inicial (Digitama, 0 XP, etc). Use com extremo cuidado.</p>
          <button 
            @click="confirmAndRun('resetGame')" 
            class="danger"
            :disabled="isLoading.resetGame"
          >
            <span v-if="isLoading.resetGame">Resetando...</span>
            <span v-else>Executar Reset</span>
          </button>
        </div>
      </div>
    </div>
     <div v-if="actionMessage" :class="['action-toast', actionStatus]">{{ actionMessage }}</div>

    <!-- Lista de Comandos -->
    <div class="commands-list-container">
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          placeholder="Buscar comando..."
          class="search-input"
        />
      </div>
      <div class="commands-grid">
        <div 
          v-for="command in filteredCommands" 
          :key="command.name"
          class="command-card"
          :class="{ 'mod-only': command.modOnly }"
        >
          <div class="command-header">
            <h3>{{ command.name }}</h3>
            <span class="permission-badge" v-if="command.modOnly">Mod</span>
          </div>
          <p class="description">{{ command.description }}</p>
          <div class="usage">
            <strong>Uso:</strong> {{ command.usage }}
          </div>
          <div class="examples" v-if="command.examples">
            <strong>Exemplos:</strong>
            <ul>
              <li v-for="(example, index) in command.examples" :key="index">
                {{ example }}
              </li>
            </ul>
          </div>
          <button 
            class="copy-button"
            @click="copyToClipboard(command.usage)"
          >
            <i class="fas fa-copy"></i>
            Copiar comando
          </button>
        </div>
      </div>
    </div>

    <!-- Toast visual -->
    <div v-if="showCopyAlert" class="copy-toast">
      Comando copiado!
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'Dashboard',
  data() {
    return {
      botStatus: false,
      mongodbStatus: false,
      activeUsers: 0,
      statusError: null,
      channel: 'seu_canal',
      window: window,
      searchQuery: '',
      actionMessage: null,
      actionStatus: 'success',
      isLoading: {
        corrigirEstagios: false,
        resetGame: false
      },
      commands: [
        {
          name: '!entrar',
          description: 'Inicia sua jornada no DigiBot e recebe um Digitama inicial.',
          usage: '!entrar',
          examples: ['!entrar'],
          modOnly: false
        },
        {
          name: '!digimon',
          description: 'Mostra o status atual do seu Digimon.',
          usage: '!digimon',
          examples: ['!digimon'],
          modOnly: false
        },
        {
          name: '!treinar',
          description: 'Treina o status do Digimon (força, defesa, velocidade ou sabedoria).',
          usage: '!treinar <for|def|vel|sab> [quantidade]',
          examples: ['!treinar for', '!treinar def 5'],
          modOnly: false
        },
        {
          name: '!batalhar',
          description: 'Inicia uma batalha contra um Digimon selvagem.',
          usage: '!batalhar',
          examples: ['!batalhar'],
          modOnly: false
        },
        {
          name: '!chocar',
          description: 'Choca seu Digitama quando estiver pronto para evoluir.',
          usage: '!chocar',
          examples: ['!chocar'],
          modOnly: false
        },
        {
          name: '!rank',
          description: 'Mostra seu rank de Tammer.',
          usage: '!rank',
          examples: ['!rank'],
          modOnly: false
        },
        {
          name: '!rankup',
          description: 'Tenta subir seu rank de Tammer, se cumprir os requisitos.',
          usage: '!rankup',
          examples: ['!rankup'],
          modOnly: false
        },
        {
          name: '!summonboss',
          description: 'Invoca um Boss para todos enfrentarem (apenas mods/admins).',
          usage: '!summonboss',
          examples: ['!summonboss'],
          modOnly: true
        },
        {
          name: '!boss',
          description: 'Enfrenta o Boss ativo, se houver.',
          usage: '!boss',
          examples: ['!boss'],
          modOnly: false
        },
        {
          name: '!raid',
          description: 'Entra na fila para uma Raid coletiva (mínimo 3 jogadores).',
          usage: '!raid',
          examples: ['!raid'],
          modOnly: false
        },
        {
          name: '!duelo',
          description: 'Desafia outro jogador para um duelo. Ex: !duelo nick',
          usage: '!duelo <nick>',
          examples: ['!duelo 0baratta'],
          modOnly: false
        },
        {
          name: '!aceitar',
          description: 'Aceita um desafio de duelo recebido.',
          usage: '!aceitar',
          examples: ['!aceitar'],
          modOnly: false
        },
        {
          name: '!ficha',
          description: 'Mostra sua ficha completa de Tammer e Digimon.',
          usage: '!ficha',
          examples: ['!ficha'],
          modOnly: false
        },
        {
          name: '!givebits',
          description: 'Dá bits para um jogador (apenas mods/admins).',
          usage: '!givebits <username> <quantidade>',
          examples: ['!givebits jogador 100'],
          modOnly: true
        },
        {
          name: '!removebits',
          description: 'Remove bits de um jogador (apenas mods/admins).',
          usage: '!removebits <username> <quantidade>',
          examples: ['!removebits jogador 50'],
          modOnly: true
        },
        {
          name: '!givexp',
          description: 'Dá XP para um jogador (apenas mods/admins).',
          usage: '!givexp <username> <quantidade>',
          examples: ['!givexp jogador 1000'],
          modOnly: true
        },
        {
          name: '!removexp',
          description: 'Remove XP de um jogador (apenas mods/admins).',
          usage: '!removexp <username> <quantidade>',
          examples: ['!removexp jogador 500'],
          modOnly: true
        }
      ],
      showCopyAlert: false,
      copyAlertTimeout: null
    }
  },
  computed: {
    filteredCommands() {
      if (!this.searchQuery) return this.commands;
      const query = this.searchQuery.toLowerCase();
      return this.commands.filter(cmd => 
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
      );
    }
  },
  methods: {
    async fetchStatus() {
      try {
        const res = await api.get('/health')
        this.botStatus = res.data.botOnline ?? false
        this.mongodbStatus = res.data.mongodbConnected ?? false
        this.activeUsers = res.data.activeUsers ?? 0
        this.statusError = null
      } catch (err) {
        this.statusError = 'Erro ao buscar o status. O backend está online?'
        console.error(err)
      }
    },
    async confirmAndRun(action) {
      const messages = {
        corrigirEstagios: {
          confirm: 'Você tem certeza que deseja corrigir os estágios de TODOS os Digimons? Esta ação irá verificar cada jogador e ajustar o estágio baseado no XP atual.',
          success: 'Estágios corrigidos com sucesso!',
          error: 'Erro ao corrigir os estágios.'
        },
        resetGame: {
          confirm: 'ATENÇÃO! Você tem certeza que deseja RESETAR O JOGO? Todo o progresso de todos os jogadores será perdido permanentemente. Esta ação não pode ser desfeita.',
          success: 'Jogo resetado com sucesso!',
          error: 'Erro ao resetar o jogo.'
        }
      };

      const actionConfig = messages[action];

      if (window.confirm(actionConfig.confirm)) {
        this.isLoading[action] = true;
        try {
          if (action === 'corrigirEstagios') {
            await api.post('/admin/corrigir-estagios');
          } else if (action === 'resetGame') {
            await api.post('/admin/reset-game');
          }
          this.showActionToast(actionConfig.success, 'success');
        } catch (error) {
          console.error(`Erro ao executar ${action}:`, error);
          this.showActionToast(actionConfig.error, 'error');
        } finally {
          this.isLoading[action] = false;
        }
      }
    },
    showActionToast(message, status) {
      this.actionMessage = message;
      this.actionStatus = status;
      setTimeout(() => {
        this.actionMessage = null;
      }, 5000);
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showCopyAlert = true;
        if (this.copyAlertTimeout) clearTimeout(this.copyAlertTimeout);
        this.copyAlertTimeout = setTimeout(() => {
          this.showCopyAlert = false;
        }, 2000);
      });
    }
  },
  mounted() {
    this.fetchStatus()
    this._statusInterval = setInterval(this.fetchStatus, 10000)
  },
  beforeDestroy() {
    clearInterval(this._statusInterval)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  color: #e0e0e0;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 900px) {
  .status-cards {
    grid-template-columns: 1fr;
  }
}

.card {
  background-color: var(--sidebar-color);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card i {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.card h3 {
  margin-bottom: 0.5rem;
}

.online {
  color: var(--secondary-color);
}

.offline {
  color: #ff4444;
}

.terminal-container {
  background-color: var(--sidebar-color);
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 900px) {
  .terminal-container {
    margin-top: 1rem;
  }
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--border-color);
}

.terminal-controls button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
}

.terminal {
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  height: 300px;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .dashboard {
    padding: 0.5rem;
  }
  .terminal {
    padding: 0.5rem;
    height: 200px;
  }
  .status-cards {
    gap: 0.5rem;
  }
}

.terminal-line {
  margin-bottom: 0.5rem;
}

.prompt {
  color: var(--primary-color);
  margin-right: 0.5rem;
}

.terminal-input {
  display: flex;
  align-items: center;
}

.terminal-input input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-color);
  font-family: 'Fira Code', monospace;
  padding: 0.5rem;
  outline: none;
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

/* Adicionar estilos para o chat e comandos responsivos */
.commands-list-container {
  margin-bottom: 2rem;
}

.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.command-card {
  background: linear-gradient(135deg, #232428 60%, #7b2ff2 100%);
  box-shadow: 0 4px 24px 0 rgba(123,47,242,0.10), 0 1.5px 4px 0 rgba(0,0,0,0.10);
  padding: 2rem 1.5rem;
  border-radius: 16px;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid #7b2ff2;
}
.command-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 32px 0 rgba(123,47,242,0.18), 0 2px 8px 0 rgba(0,0,0,0.12);
  border-color: #f357a8;
}
.command-header h3 {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #ffe259;
  text-shadow: 0 2px 8px #7b2ff2aa;
}
.permission-badge {
  background: linear-gradient(90deg, #f357a8 0%, #7b2ff2 100%);
  color: #fff;
  font-weight: bold;
}
.copy-button, .save-button, .start-button, .test-button, .action-buttons button {
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
.copy-button:hover, .save-button:hover, .start-button:hover, .test-button:hover, .action-buttons button:hover {
  background: linear-gradient(90deg, #f357a8 0%, #ffe259 100%);
  color: #232428;
  transform: scale(1.05);
  box-shadow: 0 4px 16px 0 rgba(243,87,168,0.18);
}

.search-bar {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #232428;
  border: 1.5px solid #7b2ff2;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
  outline: none;
  box-shadow: 0 2px 8px 0 rgba(123,47,242,0.04);
}
.search-input:focus {
  border-color: #f357a8;
  box-shadow: 0 0 0 2px #f357a880;
}

.copy-toast {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  background: linear-gradient(90deg, #ffe259 0%, #ffa751 40%, #ff6a00 100%);
  color: #222;
  font-weight: bold;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 9999;
  font-size: 1.1rem;
  animation: fadeInOut 2s;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}

/* Estilos para as ações de admin */
.admin-actions-container {
  background-color: #2c2c3e;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #444;
}

.admin-actions-container h2 {
  margin-top: 0;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  background-color: #3a3a50;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.action-card h3 {
  margin-top: 0;
  color: #9f78ff;
}

.action-card p {
  flex-grow: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.action-card button {
  background-color: #7f5af0;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
  margin-top: 1rem;
}

.action-card button.danger {
  background-color: #c70039;
}

.action-card button:hover {
  background-color: #6a48d1;
}

.action-card button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.7;
}

.action-card button.danger:hover {
  background-color: #a3002f;
}

.action-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 1rem 2rem;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  font-size: 1rem;
}

.action-toast.success {
  background-color: #28a745;
}

.action-toast.error {
  background-color: #dc3545;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}
</style> 