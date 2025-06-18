<template>
  <div class="chat">
    <h1>Chat</h1>

    <div class="chat-container">
      <!-- Chat da Twitch -->
      <div class="twitch-chat">
        <iframe
          :src="`https://www.twitch.tv/embed/${channel}/chat?parent=${window.location.hostname}`"
          frameborder="0"
          scrolling="no"
          height="600"
          width="350"
        ></iframe>
      </div>

      <!-- Terminal do Bot -->
      <div class="bot-terminal">
        <div class="terminal-header">
          <h3>Terminal do Bot</h3>
          <div class="terminal-controls">
            <button @click="clearTerminal">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="terminal" ref="terminal">
          <div v-for="(line, index) in terminalLines" :key="index" class="terminal-line">
            <span class="timestamp">{{ line.timestamp }}</span>
            <span :class="['message-type', line.type]">{{ line.type }}</span>
            <span class="message">{{ line.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Chat',
  data() {
    return {
      channel: 'seu_canal',
      terminalLines: [],
      window: window
    }
  },
  methods: {
    clearTerminal() {
      this.terminalLines = [];
    },
    addTerminalLine(type, message) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      this.terminalLines.push({
        timestamp,
        type,
        message
      });
      // Auto-scroll to bottom
      this.$nextTick(() => {
        const terminal = this.$refs.terminal;
        terminal.scrollTop = terminal.scrollHeight;
      });
    }
  },
  mounted() {
    // Simula mensagens do bot
    setInterval(() => {
      const types = ['INFO', 'WARN', 'ERROR', 'SUCCESS'];
      const messages = [
        'Bot iniciado com sucesso',
        'Novo usuário entrou no chat',
        'Digimon selvagem apareceu!',
        'Erro ao processar comando',
        'XP adicionado com sucesso'
      ];
      
      const type = types[Math.floor(Math.random() * types.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      this.addTerminalLine(type, message);
    }, 5000);
  }
}
</script>

<style scoped>
.chat {
  padding: 1rem;
}

.chat-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  height: calc(100vh - 150px);
}

.twitch-chat {
  background-color: var(--sidebar-color);
  border-radius: 8px;
  overflow: hidden;
}

.bot-terminal {
  background-color: var(--sidebar-color);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--border-color);
}

.terminal-header h3 {
  margin: 0;
}

.terminal-controls button {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
}

.terminal {
  flex: 1;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  overflow-y: auto;
}

.terminal-line {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timestamp {
  color: #888;
  font-size: 0.8rem;
}

.message-type {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.INFO {
  background-color: #2196F3;
  color: white;
}

.WARN {
  background-color: #FFC107;
  color: black;
}

.ERROR {
  background-color: #F44336;
  color: white;
}

.SUCCESS {
  background-color: #4CAF50;
  color: white;
}

.message {
  flex: 1;
}
</style> 