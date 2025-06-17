# Digibot - Bot de Minigame Digimon para Twitch

Este projeto é um bot para a Twitch que implementa um minigame de Digimon, permitindo que os espectadores interajam, colecionem Digimons, ganhem XP, coins e participem de atividades. Ele também inclui um dashboard de gerenciamento para o streamer.

## Funcionalidades Implementadas (Fase Inicial)

*   **Bot da Twitch (`tmi.js`):**
    *   Conexão com o chat da Twitch.
    *   Comando `!entrar` para novos jogadores receberem um Digitama.
    *   Sistema de Coins:
        *   Comando `!givecoins <username> <amount>` (moderadores).
        *   Comando `!setcoinvalue <value>` (moderadores) para ajustar valor em eventos.
    *   Sistema de XP e Evolução:
        *   Tabela de XP para progressão de níveis e estágios (Digitama, Baby I, Baby II, Rookie).
        *   Função `addXp` e `checkLevelUp` para gerenciar progressão.
        *   Comando `!testxp <amount>` (moderadores) para testar o ganho de XP.
        *   Evolução de Digitama para um estágio Baby I com nome personalizável (futuramente `!setname`).

    *   **Comandos de Interação do Jogador:**
        *   **`!entrar`**: Permite que um novo jogador entre no jogo. O jogador começa com um Digitama.
        *   **`!treinar <tipo>`**:
            *   **Descrição:** Permite ao jogador gastar coins para treinar e melhorar um status específico do seu Digimon. Opcionalmente, pode-se especificar um multiplicador para treinar várias vezes de uma vez.
            *   **Custo Base:** `100 coins` por sessão de treino (o custo total é Custo Base * Multiplicador).
            *   Tipos de Treino Disponíveis e Efeitos:
                *   `!treinar for`: Aumenta a **Força** do Digimon em +1 * (multiplicador) e o **HP** em +1 * (multiplicador).
                *   `!treinar def`: Aumenta a **Defesa** do Digimon em +1 * (multiplicador) e o **HP** em +1 * (multiplicador).
                *   `!treinar vel`: Aumenta a **Velocidade** do Digimon em +1 * (multiplicador) e o **MP** em +1 * (multiplicador).
                *   `!treinar sab`: Aumenta a **Sabedoria** do Digimon em +1 * (multiplicador) e o **MP** em +1 * (multiplicador).
    *   **Multiplicadores Válidos:** 1, 5, 10, 15. Se nenhum multiplicador for especificado ou for inválido, o multiplicador padrão é 1.
    *   **Quem pode usar:** Qualquer espectador que já tenha usado `!entrar` e possua coins suficientes para o custo total.
    *   **Exemplos:**
        *   `!treinar vel` (equivale a `!treinar vel 1`)
        *   `!treinar for 5`
        *   `!treinar def 10`

*   **Comandos de Gerenciamento (Moderadores/Broadcaster):**
    *   `!givecoins <username> <quantidade>`
    *   `!removecoins <username> <quantidade>` (Novo)
    *   `!setcoinvalue <valor>`
    *   `!testxp <quantidade>`
    *   `!setdigimon <username> <nomeDoDigimon>`
    *   `!resetdigibot`

*   **Comandos Gerais do Jogador:**
    *   `!meudigimon` ou `!status`

*   **API RESTful (`Express.js`):**
    *   Endpoint `GET /api/bot/status` para verificar o status da API.
    *   Endpoints `GET /api/tammers` e `GET /api/tammers/:twitchUserId` para listar e visualizar Tammers.
    *   Endpoints `GET /api/config` e `PUT /api/config` para gerenciar configurações do bot.
*   **Dashboard de Gerenciamento (`Vue.js`):**
    *   Página de Status da API.
    *   Página para listar todos os Tammers e seus detalhes.
    *   Página de Configurações para ajustar:
        *   Taxa de conversão de coins.
        *   Valor das coins em eventos.
        *   Multiplicador de XP para eventos.
        *   Mínimo de Tamers para Raid.
*   **Banco de Dados (`MongoDB` com `Mongoose`):**
    *   Schemas para `Tammer`, `DigimonData`, e `BotConfig`.

## Estrutura do Projeto

```
.
├── frontend/         # Código do Dashboard Vue.js
│   ├── public/
│   ├── src/
│   └── package.json
├── src/              # Código do Backend Node.js
│   ├── api/          # Servidor Express e endpoints da API
│   ├── bot/          # Lógica do bot da Twitch (tmi.js)
│   ├── config/       # Carregamento de variáveis de ambiente
│   ├── database/     # Conexão com MongoDB
│   └── models/       # Schemas Mongoose
├── .env.example      # Arquivo de exemplo para variáveis de ambiente
├── package.json
└── README.md
```

## Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão LTS recomendada, ex: 18.x ou superior)
*   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community) (uma instância rodando localmente ou acessível remotamente)

## Configuração do Ambiente

1.  Clone o repositório (se ainda não o fez).
2.  Na raiz do projeto, copie o arquivo `.env.example` para um novo arquivo chamado `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Edite o arquivo `.env` com suas configurações:

    *   `MONGODB_URI`: A URI de conexão do seu MongoDB.
        *   Exemplo local: `mongodb://localhost:27017/digibot`
    *   `TWITCH_CHANNEL`: O nome do canal da Twitch onde o bot vai operar (sem o `#`).
        *   Exemplo: `nomedoseustreamer`
    *   `TWITCH_USERNAME`: O nome de usuário da conta Twitch que o bot usará para se conectar.
        *   Exemplo: `meu_digibot`
    *   `TWITCH_OAUTH_TOKEN`: O token OAuth para a conta do bot.
        *   **Importante:** Inclua o prefixo `oauth:`. Exemplo: `oauth:abcdef1234567890`
        *   Você pode gerar um em [https://twitchtokengenerator.com/](https://twitchtokengenerator.com/) (selecione "Bot Chat Token").
    *   `API_PORT`: A porta em que a API RESTful irá rodar.
        *   Padrão: `3000`

## Instalação de Dependências

1.  **Backend (raiz do projeto):**
    ```bash
    npm install
    ```
2.  **Frontend (pasta `frontend`):**
    *(Se você estiver usando o dashboard Vue.js)*
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Como Rodar o Projeto

Você precisará de terminais separados para rodar o backend (bot e API) e o frontend.

1.  **Para rodar o Bot da Twitch e a API RESTful simultaneamente (modo de desenvolvimento):**
    No terminal, na raiz do projeto:
    ```bash
    npm run dev:all
    ```
    Isso iniciará o bot da Twitch e o servidor da API. Você verá logs de ambos no terminal.

2.  **Para rodar apenas o Bot da Twitch (modo de desenvolvimento):**
    Na raiz do projeto:
    ```bash
    npm run dev
    ```
3.  **Para rodar apenas a API RESTful (modo de desenvolvimento):**
    Na raiz do projeto:
    ```bash
    npm run dev:api
    ```
4.  **Para rodar o Dashboard de Gerenciamento (Frontend Vue.js):**
    *(Se você estiver usando o dashboard Vue.js)*
    Em um **novo terminal**, navegue até a pasta `frontend`:
    ```bash
    cd frontend
    npm run serve
    ```
    Após iniciar, o dashboard estará acessível geralmente em `http://localhost:8080` (verifique o output do comando).

Seu Digibot agora está pronto! Você pode ir ao chat do seu canal na Twitch e testar os comandos.

## Próximos Passos e TODOs (Sugestões)

*   Implementar verificação de "follower" para o comando `!entrar` usando a API da Twitch.
*   Expandir o catálogo `DigimonData` com mais Digimons, estágios e atributos.
*   Desenvolver as mecânicas de batalha, bosses, raids e treino.
*   Adicionar mais funcionalidades ao dashboard (ex: editar Tammers, visualizar logs do bot).
*   Melhorar o tratamento de erros e feedback para o usuário no chat.
*   Adicionar testes unitários e de integração.