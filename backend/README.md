# DigiBot Backend

Backend para o DigiBot, um bot para Twitch com tema de Digimon.

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