# Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente necessárias para executar o DigiBot.

## Configurações do Servidor

- `PORT`: Porta em que o servidor irá rodar (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (development, production, test)

## Configurações do MongoDB

- `MONGODB_URI`: URI de conexão com o MongoDB (padrão: mongodb://localhost:27017/digibot)
- `MONGODB_PATH`: Caminho base do MongoDB (padrão: mongodb://localhost:27017)

## Configurações do JWT

- `JWT_SECRET`: Chave secreta para assinatura dos tokens JWT
- `JWT_EXPIRES_IN`: Tempo de expiração dos tokens (padrão: 7d)

## Configurações do Bot

- `BOT_USERNAME`: Nome de usuário do bot na Twitch
- `BOT_OAUTH_TOKEN`: Token OAuth do bot (formato: oauth:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
- `CHANNEL_NAME`: Nome do canal onde o bot irá operar

## Configurações do Twitch

- `TWITCH_CLIENT_ID`: ID do cliente da aplicação na Twitch
- `TWITCH_CLIENT_SECRET`: Chave secreta da aplicação na Twitch
- `TWITCH_REDIRECT_URI`: URI de redirecionamento para autenticação (padrão: http://localhost:3000/auth/twitch/callback)

## Configurações de Logs

- `LOG_LEVEL`: Nível de log (debug, info, warn, error)
- `LOG_DIR`: Diretório onde os logs serão salvos (padrão: logs)

## Configurações de Segurança

- `CORS_ORIGIN`: Origem permitida para CORS (padrão: *)
- `RATE_LIMIT_WINDOW`: Janela de tempo para limite de requisições em milissegundos (padrão: 900000 - 15 minutos)
- `RATE_LIMIT_MAX`: Número máximo de requisições por janela (padrão: 100)

## Configurações de Comandos

- `DEFAULT_COOLDOWN`: Tempo de espera padrão entre comandos em segundos (padrão: 5)
- `DEFAULT_COST`: Custo padrão dos comandos em pontos (padrão: 0)
- `COMMAND_PREFIX`: Prefixo usado para identificar comandos (padrão: !)

## Configurações de Pontos

- `POINTS_PER_MESSAGE`: Pontos ganhos por mensagem (padrão: 1)
- `POINTS_PER_MINUTE`: Pontos ganhos por minuto de visualização (padrão: 5)
- `POINTS_PER_SUB`: Pontos ganhos por inscrição (padrão: 100)
- `POINTS_PER_FOLLOW`: Pontos ganhos por follow (padrão: 50)
- `POINTS_PER_RAID`: Pontos ganhos por raid (padrão: 25)

## Como Configurar

1. Crie um arquivo `.env` na raiz do projeto
2. Copie as variáveis acima e defina seus valores
3. Para obter o token OAuth do bot:
   - Acesse https://twitchapps.com/tmi/
   - Faça login com a conta do bot
   - Copie o token gerado
4. Para obter as credenciais da aplicação Twitch:
   - Acesse https://dev.twitch.tv/console
   - Crie uma nova aplicação
   - Copie o Client ID e Client Secret

## Exemplo de Configuração

```env
# Configurações do servidor
PORT=3000
NODE_ENV=development

# Configurações do MongoDB
MONGODB_URI=mongodb://localhost:27017/digibot
MONGODB_PATH=mongodb://localhost:27017

# Configurações do JWT
JWT_SECRET=digibot-secret-key
JWT_EXPIRES_IN=7d

# Configurações do bot
BOT_USERNAME=digibot
BOT_OAUTH_TOKEN=oauth:your-oauth-token
CHANNEL_NAME=digimon

# Configurações do Twitch
TWITCH_CLIENT_ID=your-client-id
TWITCH_CLIENT_SECRET=your-client-secret
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback

# Configurações de logs
LOG_LEVEL=info
LOG_DIR=logs

# Configurações de segurança
CORS_ORIGIN=*
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Configurações de comandos
DEFAULT_COOLDOWN=5
DEFAULT_COST=0
COMMAND_PREFIX=!

# Configurações de pontos
POINTS_PER_MESSAGE=1
POINTS_PER_MINUTE=5
POINTS_PER_SUB=100
POINTS_PER_FOLLOW=50
POINTS_PER_RAID=25
``` 