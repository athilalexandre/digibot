# 🤖 DigiBot - Bot da Twitch para Digimon

<div align="center">
    
  [![Twitch](https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://twitch.tv/0baratta)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
  [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
</div>

## 🎯 Sobre o Projeto

O DigiBot é um bot interativo para Twitch com tema de Digimon, desenvolvido com inteligência artificial. O projeto inclui um bot para Twitch, uma API REST completa, e um dashboard web moderno para gerenciamento.

### 🤖 Desenvolvimento com Inteligência Artificial

Este projeto foi desenvolvido em colaboração com inteligência artificial, utilizando ferramentas avançadas de programação assistida por IA. A IA contribuiu significativamente para:

- **Arquitetura do Sistema**: Design da estrutura modular e escalável
- **Desenvolvimento Frontend**: Criação do dashboard Vue.js com interface moderna
- **Backend API**: Implementação de endpoints RESTful e autenticação
- **Lógica de Jogo**: Sistema de batalhas, treinamento e evolução de Digimon
- **Correção de Dados**: Scripts automatizados para correção de estágios de Digimon
- **Interface do Usuário**: Design responsivo e experiência do usuário otimizada

A IA foi fundamental para acelerar o desenvolvimento, garantir boas práticas de código e criar uma experiência de usuário intuitiva e envolvente.

## 🚀 Funcionalidades

### Bot da Twitch
- **Sistema de Jogadores**: Registro e gerenciamento de Tammers
- **Digimon**: Sistema completo de evolução e estágios
- **Batalhas**: Sistema de batalhas PvP e contra NPCs
- **Treinamento**: Sistema de XP e evolução
- **Boss Events**: Eventos especiais com bosses únicos
- **Raids**: Sistema cooperativo de raids
- **Quests**: Missões e objetivos para jogadores
- **Sistema de Coins**: Economia virtual do jogo

### Dashboard Web
- **Interface Moderna**: Dashboard responsivo com Vue.js
- **Autenticação**: Sistema de login seguro
- **Gerenciamento de Comandos**: Visualização e cópia de comandos
- **Configurações**: Painel de configuração do bot
- **Estatísticas**: Monitoramento em tempo real
- **Design Digimon**: Interface temática com fontes e cores do universo Digimon

### API REST
- **Autenticação JWT**: Sistema seguro de autenticação
- **CRUD Completo**: Operações para usuários, comandos e configurações
- **Middleware de Segurança**: Rate limiting, CORS, Helmet
- **Logging**: Sistema de logs com Winston
- **Testes**: Suíte de testes com Jest

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (versão 7.0 ou superior)
- [Git](https://git-scm.com/) (opcional, para clonar o repositório)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/athilalexandre/digibot.git
cd digibot
```

2. Instale as dependências do projeto principal:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd backend
npm install
cd ..
```

4. Instale as dependências do frontend:
```bash
cd frontend
npm install
cd ..
```

5. Configure o MongoDB:
   - Instale o MongoDB Community Server no caminho padrão: `C:\Program Files\MongoDB\Server\7.0\`
   - Crie o diretório de dados: `C:\data\db`
   - Se você instalou o MongoDB em outro local, o bot irá solicitar o caminho na primeira execução

6. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env` (se existir)
   - Preencha as variáveis necessárias:
     ```
     TWITCH_USERNAME=seu_bot
     TWITCH_OAUTH=oauth:seu_token
     TWITCH_CHANNEL=seu_canal
     MONGODB_URI=mongodb://localhost:27017/digibot
     JWT_SECRET=sua_chave_secreta_jwt
     ```

## 🎮 Como Executar

### Desenvolvimento (Recomendado)

Para desenvolvimento com hot-reload:

```bash
# Inicia MongoDB, Backend e Frontend simultaneamente
npm run dev

# Ou inicie separadamente:
npm run dev:backend    # Backend com nodemon
npm run serve:auto     # Frontend com auto-open
```

### Produção

```bash
# Inicia tudo de uma vez
npm run start:all

# Ou inicie separadamente:
npm run start:mongodb  # MongoDB
npm start             # Bot da Twitch
npm run start:api     # API REST
```

### Frontend

```bash
cd frontend
npm run serve         # Desenvolvimento
npm run build         # Build para produção
```

### Backend

```bash
cd backend
npm start             # Produção
npm run dev           # Desenvolvimento
npm test              # Executar testes
```

## 🎮 Comandos do Bot

### Comandos de Jogador
| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `!entrar` | Inicia sua jornada no DigiBot | Todos |
| `!meudigimon` | Mostra status do seu Digimon | Todos |
| `!treinar` | Treina seu Digimon | Todos |
| `!batalhar` | Inicia uma batalha | Todos |
| `!boss` | Participa de eventos de boss | Todos |
| `!raid` | Participa de raids cooperativas | Todos |
| `!quest` | Visualiza e completa quests | Todos |

### Comandos de Moderador
| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `!givecoins` | Dá coins para um jogador | Moderador |
| `!removecoins` | Remove coins de um jogador | Moderador |
| `!setcoinvalue` | Define valor das coins | Moderador |
| `!corrigirEstagios` | Corrige estágios de Digimon | Moderador |

## 🔧 Configuração do MongoDB

O bot procura o MongoDB no caminho padrão: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`

Se você instalou em outro local:
1. Na primeira execução, o bot solicitará o caminho correto
2. O caminho será salvo em `config/mongodb-config.json`
3. Você pode editar este arquivo manualmente se necessário

## 🛠️ Estrutura do Projeto

```
digibot/
├── backend/                 # API REST
│   ├── controllers/         # Controladores da API
│   ├── middleware/          # Middlewares (auth, etc.)
│   ├── models/              # Modelos do MongoDB
│   ├── routes/              # Rotas da API
│   ├── services/            # Lógica de negócio
│   └── utils/               # Utilitários
├── frontend/                # Dashboard Vue.js
│   ├── src/
│   │   ├── components/      # Componentes Vue
│   │   ├── views/           # Páginas
│   │   ├── services/        # Serviços de API
│   │   └── store/           # Vuex store
├── src/
│   ├── bot/                 # Bot da Twitch
│   │   ├── game_mechanics/  # Mecânicas do jogo
│   │   └── xpSystem.js      # Sistema de XP
│   ├── data/                # Dados dos Digimon
│   └── database/            # Configuração do banco
└── config/                  # Configurações
```

## 🎨 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **TMI.js** - Cliente Twitch
- **Winston** - Logging
- **Jest** - Testes

### Frontend
- **Vue.js 2** - Framework JavaScript
- **Vue Router** - Roteamento
- **Vuex** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Sass** - Pré-processador CSS
- **FontAwesome** - Ícones

### DevOps
- **Concurrently** - Execução paralela
- **Nodemon** - Hot-reload
- **ESLint** - Linting

## 🔧 Scripts Úteis

```bash
# Setup inicial
npm run setup

# Seed de dados
npm run db:seed:digimon
cd backend && npm run seed:admin

# Testes
cd backend && npm test

# Build frontend
cd frontend && npm run build
```

## ⚠️ Solução de Problemas

### MongoDB não está rodando
```
❌ MongoDB não está rodando!
Por favor, inicie o MongoDB antes de executar o bot.
Você pode iniciar o MongoDB usando o comando: npm run start:mongodb
```

### MongoDB não encontrado
```
⚠️ MongoDB não encontrado no caminho padrão.
Por favor, instale o MongoDB em: C:\Program Files\MongoDB\Server\7.0\
Ou forneça o caminho completo para o executável mongod.exe:
```

### Problemas de CORS
Se encontrar problemas de CORS no frontend, verifique se o backend está rodando na porta correta e se as configurações de CORS estão adequadas.

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, por favor abra uma [issue](https://github.com/athilalexandre/digibot/issues).

---

<div align="center">
  <p>Feito com ❤️ e 🤖 IA por Athil Alexandre</p>
  <p>⭐️ Deixe uma estrela se gostou do projeto!</p>
</div>
