# 🎮 Sistema Digimon Atualizado - Documentação Completa

## 📋 Resumo das Mudanças

O sistema foi completamente refatorado para implementar:
- ✅ Sistema de estágios balanceado (30 dias para Mega)
- ✅ Sistema de armas obrigatório para batalhas
- ✅ Pontos de Batalha (PB) com regeneração automática
- ✅ Loja aleatória com armas por raridade
- ✅ Sistema PvP completo
- ✅ Itens e boosters
- ✅ Configuração centralizada e ajustável

---

## 🧬 Sistema de Estágios e Progressão

### Estrutura de Estágios:
| Estágio   | Faixa XP           | XP por treino | Pontos de Batalha | Custo do treino |
|-----------|--------------------|---------------|-------------------|-----------------|
| Digitama  | 0–99               | —             | 0                 | —               |
| Baby      | 100–499            | 1~5 XP        | 6                 | Grátis          |
| Training  | 500–2.499          | 1–5%          | 5                 | 100 bits        |
| Rookie    | 2.500–14.999       | 1–5%          | 4                 | 250 bits        |
| Champion  | 15.000–74.999      | 1–5%          | 3                 | 500 bits        |
| Ultimate  | 75.000–299.999     | 1–5%          | 2                 | 1000 bits       |
| Mega      | 300.000–999.999    | 1–5%          | 1                 | 1500 bits       |

### Características:
- **XP por treino**: 1-5% do XP faltante para o próximo estágio
- **Cooldown**: 15 segundos entre treinos
- **Pontos de Batalha**: Regeneram totalmente a cada 1 hora
- **Evolução**: Automática ao atingir XP máximo do estágio

---

## ⚔️ Sistema de Batalha

### Comandos PvE:
- **`!batalha`** - Inicia batalha contra Digimon selvagem
  - Custo: 1000 bits
  - Requisitos: Arma equipada, PB > 0, HP > 0
  - Recompensa: 1-3% XP + 50-500 bits

### Comandos PvP:
- **`!batalha @usuário`** - Desafia outro jogador
  - Custo: 1000 bits para ambos
  - Requisitos: Ambos com arma, PB > 0, 1000+ bits
  - Vencedor: 3-5% XP + 10-250 bits do perdedor
  - Perdedor: 1-2% XP

- **`!aceitar @usuário`** - Aceita desafio PvP
  - Timeout: 10 segundos para aceitar

### Comandos de Batalha:
- **`!atacar`** - Executa ataque básico
- **`!fugir`** - Tenta fugir da batalha

---

## 🛍️ Sistema de Loja

### Eventos Aleatórios:
- **Frequência**: 1-3 vezes a cada 2 horas
- **Duração**: 20 segundos
- **Primeiro a digitar `!loja`** recebe acesso exclusivo

### Comandos da Loja:
- **`!loja`** - Tenta ser o primeiro a chegar
- **`!comprar <id_arma>`** - Compra arma da loja
- **`!comprar item <tipo>`** - Compra item
- **`!usar <tipo_item>`** - Usa item do inventário
- **`!inventario`** ou **`!inv`** - Mostra inventário

### Raridades de Armas:
| Raridade  | Chance | Preço Médio | Exemplo |
|-----------|--------|-------------|---------|
| Comum     | 60%    | 2000-4000   | Espada de Madeira |
| Incomum   | 25%    | 5000-8000   | Espada de Aço |
| Rara      | 10%    | 9000-12000  | Espada Flamejante |
| Lendária  | 5%     | 13000-20000 | Omega Blade |

---

## 🔫 Sistema de Armas

### Tipos de Armas:
- **Blunt** 🪓 - Machados e martelos
- **Slash** 🗡️ - Espadas e lâminas
- **Stab** 🗡️ - Adagas e rapieiras
- **Bash** 🛡️ - Escudos
- **Shot** 🏹 - Arcos e projéteis
- **Crush** 🔨 - Martelos pesados

### Características:
- **Dano e Defesa fixos** por arma
- **Obrigatório para batalhas**
- **Digimons sem arma** não podem lutar
- **Uma arma por vez** equipada

---

## 🧪 Sistema de Itens

### Itens Disponíveis:
- **Restaurador de Energia** (5000 bits)
  - Recupera todos os Pontos de Batalha
- **XP Booster (1h)** (10000 bits)
  - Multiplica XP de batalhas por 2x por 1 hora

---

## 🏋️ Sistema de Treino

### Comando:
- **`!treinar <tipo> [multiplicador]`**

### Tipos de Treino:
- **`for`** - Força (aumenta HP)
- **`def`** - Defesa (aumenta HP)
- **`vel`** - Velocidade (aumenta MP)
- **`sab`** - Sabedoria (aumenta MP)

### Multiplicadores:
- **1, 5, 10, 15** (padrão: 1)
- **Custo**: Custo base × multiplicador
- **Cooldown**: 15 segundos entre treinos

---

## 📊 Comandos de Status

### Comandos Básicos:
- **`!entrar`** - Registra no jogo
- **`!meudigimon`** ou **`!status`** - Mostra status completo
- **`!inventario`** ou **`!inv`** - Mostra inventário

### Informações Exibidas:
- Nome, estágio e nível do Digimon
- XP atual
- HP, MP e stats (força, defesa, velocidade, sabedoria)
- Bits e Pontos de Batalha
- Arma equipada (se houver)
- Itens no inventário
- Boosters ativos

---

## ⚙️ Comandos de Administrador

### Comandos de Moderador:
- **`!givebits <usuário> <quantidade>`** - Dá bits
- **`!removebits <usuário> <quantidade>`** - Remove bits
- **`!setbitvalue <valor>`** - Define valor da bit
- **`!testxp <quantidade>`** - Testa sistema de XP
- **`!setdigimon <usuário> <nome>`** - Altera Digimon
- **`!resetdigibot`** - Reset completo do sistema
- **`!statusloja`** - Status da loja (moderadores)

---

## 🔧 Configuração

### Arquivo: `src/config/gameConfig.js`
Todos os valores são ajustáveis:
- Custos de treino por estágio
- Cooldowns
- Percentuais de XP
- Custos de comandos
- Chances de raridade
- Frequência da loja
- Recompensas de bits e XP

---

## 🚀 Instalação e Atualização

### 1. Atualizar Base de Dados:
```bash
node src/scripts/updateDatabase.js
```

### 2. Iniciar o Bot:
```bash
# Backend
npm start

# Frontend (se necessário)
npm run serve
```

### 3. Verificar Funcionamento:
- Teste `!entrar` para criar novo jogador
- Teste `!loja` para verificar sistema de loja
- Teste `!treinar for` para verificar sistema de treino
- Teste `!batalha` para verificar sistema de batalha

---

## 🎯 Experiência do Jogador

### Progressão Típica:
- **Dia 1-7**: Baby → Training
- **Dia 8-21**: Training → Rookie → Champion
- **Dia 22-30**: Champion → Ultimate → Mega

### Estratégias:
- **Início**: Foque em conseguir arma na loja
- **Meio**: Balanceie treino e batalhas
- **Fim**: Use boosters para acelerar progresso

### Dicas:
- Sempre mantenha Pontos de Batalha
- Use Restauradores de Energia quando necessário
- Participe de eventos da loja para armas melhores
- Batalhas PvP dão mais XP mas são arriscadas

---

## 🐛 Solução de Problemas

### Problemas Comuns:
1. **"Você precisa equipar uma arma"**
   - Use `!loja` para conseguir arma
   - Use `!comprar <id_arma>` para comprar

2. **"Não tem Pontos de Batalha"**
   - Aguarde 1 hora para regeneração
   - Use Restaurador de Energia

3. **"Cooldown ativo"**
   - Aguarde 15 segundos entre treinos

4. **"Não tem bits suficientes"**
   - Participe de batalhas para ganhar bits
   - Use multiplicadores menores no treino

---

## 📈 Balanceamento

### Tempo para Mega:
- **Jogador ativo**: ~30 dias
- **Jogador casual**: ~45 dias
- **Jogador sortudo**: ~20 dias

### Economia:
- **Batalhas PvE**: 50-500 bits por vitória
- **Batalhas PvP**: 10-250 bits transferidos
- **Treinos**: 100-1500 bits por estágio
- **Itens**: 5000-10000 bits

### XP por Atividade:
- **Treino**: 1-5% do XP faltante
- **Batalha PvE**: 1-3% do XP faltante
- **Batalha PvP**: 1-5% do XP faltante (vencedor)
- **Booster ativo**: 2x multiplicador

---

## 🎉 Conclusão

O sistema está completamente balanceado e pronto para uso! Todos os valores podem ser ajustados no arquivo de configuração conforme necessário. O jogo oferece uma experiência progressiva e envolvente com múltiplas formas de progressão e interação entre jogadores. 