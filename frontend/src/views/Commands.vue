<template>
  <div class="commands">
    <div class="commands-inner">
      <h1>Comandos</h1>

      <div class="commands-container">
        <!-- Lista de Comandos -->
        <div class="commands-list">
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              placeholder="Buscar comando..."
              @input="filterCommands"
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
                class="test-button"
                @click="testCommand(command)"
                :disabled="command.modOnly && !isMod"
              >
                <i class="fas fa-play"></i>
                Testar
              </button>
            </div>
          </div>
        </div>

        <!-- Terminal de Teste -->
        <div class="test-terminal">
          <div class="terminal-header">
            <h3>Terminal de Teste</h3>
            <div class="terminal-controls">
              <button @click="clearTerminal">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="terminal" ref="terminal">
            <div v-for="(line, index) in terminalLines" :key="index" class="terminal-line">
              <span class="timestamp">{{ line.timestamp }}</span>
              <span class="command">{{ line.command }}</span>
              <span class="response">{{ line.response }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Commands',
  data() {
    return {
      searchQuery: '',
      isMod: true, // Simula se o usuário é moderador
      terminalLines: [],
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
    filterCommands() {
      // A filtragem é feita automaticamente pelo computed property
    },
    testCommand(command) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString();
      // Apenas exibe o comando enviado, sem resposta simulada
      this.terminalLines.push({
        timestamp,
        command: command.name,
        response: ''
      });
      // Auto-scroll to bottom
      this.$nextTick(() => {
        const terminal = this.$refs.terminal;
        terminal.scrollTop = terminal.scrollHeight;
      });
    },
    clearTerminal() {
      this.terminalLines = [];
    }
  }
}
</script>

<style scoped>
.commands {
  padding: 1rem;
}

.commands-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: calc(100vh - 150px);
  align-items: start;
}

.commands-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: stretch;
  justify-items: center;
}

.command-card {
  width: 100%;
  max-width: 340px;
  min-height: 320px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--sidebar-color);
  padding: 1.5rem;
  border-radius: 8px;
  position: relative;
}

.command-card.mod-only {
  border: 2px solid var(--primary-color);
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.permission-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.description {
  margin-bottom: 1rem;
  color: #ccc;
}

.usage {
  margin-bottom: 1rem;
  font-family: 'Fira Code', monospace;
}

.examples {
  margin-bottom: 1rem;
}

.examples ul {
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.examples li {
  font-family: 'Fira Code', monospace;
  color: #888;
  margin-bottom: 0.25rem;
}

.test-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.test-button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.test-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.test-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
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
  min-height: 200px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  overflow-y: auto;
  background: var(--sidebar-color);
  border-radius: 0 0 8px 8px;
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

.command {
  color: var(--primary-color);
}

.response {
  color: var(--secondary-color);
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
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
.search-bar input:focus {
  border-color: #f357a8;
  box-shadow: 0 0 0 2px #f357a880;
}

/* Inputs genéricos para a página */
input[type="text"],
input[type="password"],
input[type="email"],
input:not([type]),
select {
  background-color: #232428;
  border: 1.5px solid #33343a;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  padding: 0.75rem 1rem;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  margin-bottom: 0.5rem;
}
input:focus, select:focus {
  border-color: #7b2ff2;
  box-shadow: 0 0 0 2px #7b2ff280;
}

@media (max-width: 1100px) {
  .commands-container {
    grid-template-columns: 1fr;
    gap: 1rem;
    height: auto;
  }
  .test-terminal {
    margin-top: 1rem;
  }
}

@media (max-width: 600px) {
  .commands {
    padding: 0.5rem;
  }
  .commands-grid {
    gap: 0.5rem;
  }
  .command-card {
    min-height: 220px;
    max-width: 100%;
  }
}

.commands-inner {
  max-width: 1600px;
  margin: 0 auto;
}
</style> 