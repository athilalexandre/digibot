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

    <div class="terminal-container">
      <div class="terminal-header">
        <h3>Terminal</h3>
        <div class="terminal-controls">
          <button @click="clearTerminal">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="terminal" ref="terminal">
        <div v-for="(line, index) in terminalLines" :key="index" class="terminal-line">
          <span class="prompt">$</span>
          <span class="command">{{ line }}</span>
        </div>
        <div class="terminal-input">
          <span class="prompt">$</span>
          <input 
            v-model="currentCommand" 
            @keyup.enter="executeCommand"
            placeholder="Digite um comando..."
            ref="commandInput"
          />
        </div>
      </div>
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
      terminalLines: [],
      currentCommand: '',
      statusError: null
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
        this.statusError = 'Não foi possível obter o status do sistema.'
        this.botStatus = false
        this.mongodbStatus = false
        this.activeUsers = 0
      }
    },
    async executeCommand() {
      if (!this.currentCommand) return;
      
      this.terminalLines.push(this.currentCommand);
      
      // Aqui você implementaria a lógica para executar o comando
      // Por enquanto, apenas simula uma resposta
      setTimeout(() => {
        this.terminalLines.push('Comando executado: ' + this.currentCommand);
        this.currentCommand = '';
        this.$nextTick(() => {
          this.$refs.commandInput.focus();
        });
      }, 500);
    },
    clearTerminal() {
      this.terminalLines = [];
    }
  },
  mounted() {
    this.fetchStatus()
    // Atualiza status a cada 10 segundos
    this._statusInterval = setInterval(this.fetchStatus, 10000)
  },
  beforeDestroy() {
    clearInterval(this._statusInterval)
  }
}
</script>

<style scoped>
.dashboard {
  padding: 1rem;
}

.status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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
</style> 