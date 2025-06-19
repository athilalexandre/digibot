# DigiBot - Bot de Digimon para Twitch

## Visão Geral
DigiBot é um bot de chat para Twitch com temática Digimon, focado em progressão, batalhas, economia, ranks e interação entre viewers. Ele utiliza Node.js, Express e MongoDB no backend.

---

## Funcionalidades Principais

- **Sistema de Digitama:**
  - Usuário entra como Digitama (!entrar).
  - Só pode chocar após 1 hora (!chocar).
  - Não pode batalhar/treinar enquanto for Digitama.

- **Evolução de Digimon:**
  - Após chocar, evolui para Baby I e pode progredir de estágio conforme XP.
  - Estágios: Digitama, Baby I, Baby II, Rookie, Champion, Ultimate, Mega.

- **Sistema de XP e Estágios:**
  - XP ganho em batalhas, raids, bosses, treinos.
  - Cada estágio tem 5 níveis, com requisitos de XP para evoluir.

- **Sistema de Rank de Tammer:**
  - Ranks: Normal, Bronze, Silver, Gold, Platinum, Elite, Legendary.
  - Subida de rank depende de XP, coins e tempo de conta (!rankup).
  - Veja seu rank com !rank.

- **Sistema de Coins:**
  - Coins são comprados via !comprarcoins <quantidade> (simulação).
  - Coins são usados para treinos, eventos e podem ser dados/removidos por mods (!givecoins, !removecoins).
  - Valor base das coins pode ser alterado (!setcoinvalue).

- **Sistema de Treino:**
  - !treinar <for|def|vel|sab> [multiplicador]
  - Aumenta status do Digimon e consome coins.

- **Sistema de Batalha:**
  - !batalhar: enfrenta Digimon selvagem quando disponível.
  - !atacar, !fugir: comandos de batalha.

- **Sistema de Boss:**
  - !summonboss (mod/admin): invoca boss aleatório.
  - !boss: enfrenta o boss ativo. Recompensa XP e coins.

- **Sistema de Raid:**
  - !raid: entra na fila da raid. Quando 3 ou mais participam, inicia a raid coletiva.
  - Recompensa XP e coins para todos se vencerem.

- **Sistema de Duelo:**
  - !duelo <nick>: desafia outro usuário.
  - !aceitar: aceita o duelo. Lógica baseada em status.
  - Vencedor ganha coins, perdedor perde coins e pode regredir para Digitama.

- **Ficha Tammer:**
  - !ficha: mostra Digimon, Rank, XP, Coins, Estágio, Status.

- **Admin/Mod:**
  - !resetgame: reseta todos os jogadores (apenas mod/admin).
  - !summonboss: invoca boss (apenas mod/admin).
  - !givecoins, !removecoins, !setcoinvalue: apenas mod/admin.

---

## Comandos Disponíveis

- `!entrar` — Inicia sua jornada (requer follow do canal).
- `!chocar` — Choca o Digitama após 1h.
- `!digimon` — Mostra status do seu Digimon.
- `!ficha` — Mostra ficha completa do Tammer.
- `!treinar <for|def|vel|sab> [multiplicador]` — Treina status do Digimon.
- `!comprarcoins <quantidade>` — Compra coins (simulação).
- `!givecoins <username> <quantidade>` — Dá coins para outro jogador (mod).
- `!removecoins <username> <quantidade>` — Remove coins de um jogador (mod).
- `!setcoinvalue <valor>` — Define valor base das coins (mod).
- `!rank` — Mostra seu rank.
- `!rankup` — Tenta subir de rank.
- `!batalhar` — Inicia batalha contra Digimon selvagem.
- `!atacar` — Ataca em batalha.
- `!fugir` — Foge da batalha.
- `!summonboss` — Invoca boss (mod).
- `!boss` — Enfrenta o boss ativo.
- `!raid` — Entra na raid coletiva.
- `!duelo <nick>` — Desafia outro usuário para duelo.
- `!aceitar` — Aceita duelo.
- `!resetgame` — Reseta todos os jogadores (mod).

---

## Permissões
- Comandos de economia, reset, boss e coinvalue são restritos a moderadores/admins.
- Demais comandos são abertos a todos os viewers.

---

## Observações
- O bot utiliza MongoDB para persistência de dados.
- Todos os comandos respondem no chat da Twitch.
- O sistema de evolução, batalhas, raids e bosses é totalmente dinâmico e pode ser expandido.

---

## Exemplo de Fluxo de Jogo
1. Viewer usa `!entrar` e recebe um Digitama.
2. Após 1h, usa `!chocar` para evoluir para Baby I.
3. Treina, batalha, participa de raids, bosses e duelos para ganhar XP e coins.
4. Sobe de rank com `!rankup` conforme evolui.
5. Usa `!ficha` para acompanhar seu progresso.

---

## Dúvidas ou sugestões?
Abra uma issue ou entre em contato com o desenvolvedor!

## Requisitos

- Node.js 14.x ou superior
- npm 6.x ou superior
- MongoDB 6.0 ou superior

## Instalação

1. Clone o repositório
2. Navegue até a pasta do backend:
```bash
cd backend
```

3. Instale as dependências:
```bash
npm install
```

4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/digibot
MONGO_PATH=C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe
TWITCH_CLIENT_ID=seu_client_id_aqui
TWITCH_CLIENT_SECRET=seu_client_secret_aqui
TWITCH_REDIRECT_URI=http://localhost:8080/auth/callback
JWT_SECRET=sua_chave_secreta_aqui
CORS_ORIGIN=http://localhost:8080
BOT_USERNAME=seu_bot_username
BOT_OAUTH_TOKEN=seu_oauth_token
CHANNEL_NAME=seu_canal
```

## Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## Produção

Para iniciar o servidor em modo de produção:

```bash
npm start
```

## Testes

Para executar os testes:

```bash
npm test
```

## Estrutura do Projeto

```
backend/
├── config/             # Configurações
├── controllers/        # Controladores
├── middleware/         # Middlewares
├── models/            # Modelos do MongoDB
├── routes/            # Rotas da API
├── services/          # Serviços
├── utils/             # Utilitários
├── .env               # Variáveis de ambiente
├── .gitignore         # Arquivos ignorados pelo git
├── package.json       # Dependências e scripts
└── server.js          # Ponto de entrada
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout

### Bot
- `GET /api/bot/status` - Status do bot
- `POST /api/bot/start` - Iniciar bot
- `POST /api/bot/stop` - Parar bot
- `GET /api/bot/config` - Configurações do bot
- `PUT /api/bot/config` - Atualizar configurações

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Comandos
- `GET /api/commands` - Listar comandos
- `POST /api/commands` - Criar comando
- `PUT /api/commands/:id` - Atualizar comando
- `DELETE /api/commands/:id` - Deletar comando

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- TMI.js
- Winston
- Jest 