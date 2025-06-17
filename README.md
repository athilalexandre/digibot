# Digibot - Seu Bot de Digimon para a Twitch

Bem-vindo ao Digibot! Este é um bot para a Twitch que permite aos espectadores do seu canal terem seus próprios Digimons, treiná-los, evoluí-los e interagir com um sistema de economia, progressão e batalhas.

## Funcionalidades

*   **Sistema de Tammers e Digimons:** Jogadores (`Tammers`) possuem Digimons que progridem.
*   **XP e Nível Global:** Sistema de experiência (XP) com níveis globais de 1 a 20. O estágio Mega é alcançável a partir do nível global 18.
*   **Evolução:** Digimons evoluem para diferentes estágios (Digitama, Baby I, Baby II, Rookie, Champion, Ultimate, Mega) com base no XP acumulado. A evolução de Digitama para Baby I resulta em um Digimon aleatório desse estágio.
*   **Atributos do Digimon:** Inclui HP, MP, e stats base (Força, Defesa, Velocidade, Sabedoria).
*   **Sistema de Treino:** Jogadores podem gastar `coins` para treinar e aumentar os stats de seus Digimons, com opção de multiplicadores.
*   **Sistema de Moedas (Coins):** Moeda interna do jogo para atividades como treino.
*   **Catálogo de Digimons:** Personalizável através do arquivo `src/data/digimon_catalog.json`.
*   **Comandos de Chat:** Diversos comandos para interação dos jogadores e gerenciamento dos moderadores.
*   **Spawner de Digimons Selvagens:** Digimons selvagens aparecem periodicamente no chat.
*   **Sistema de Batalha (Turnos):** Jogadores podem batalhar contra Digimons selvagens.
*   **API RESTful (`Express.js`):**
    *   Endpoint `GET /api/bot/status` para verificar o status da API.
    *   Endpoints `GET /api/tammers` e `GET /api/tammers/:twitchUserId` para listar e visualizar Tammers.
    *   Endpoints `GET /api/config` e `PUT /api/config` para gerenciar configurações do bot.
*   **Dashboard de Gerenciamento (`Vue.js`):**
    *(Nota: A configuração e execução do frontend Vue.js estão descritas abaixo, mas o foco principal das atualizações recentes foi no backend/bot.)*
    *   Página de Status da API.
    *   Página para listar todos os Tammers e seus detalhes.
    *   Página de Configurações para ajustar:
        *   Taxa de conversão de coins.
        *   Valor das coins em eventos.
        *   Multiplicador de XP para eventos.
        *   Mínimo de Tamers para Raid.
*   **Banco de Dados (`MongoDB` com `Mongoose`):**
    *   Schemas para `Tammer`, `DigimonData` (agora incluindo `attribute` e `evolvesFrom` como Mixed Type), e `BotConfig`.
        *   Valores possíveis para `attribute`: 'Fogo', 'Planta', 'Água', 'Elétrico', 'Vento', 'Terra', 'Luz', 'Escuridão', 'Neutro', ou `null`.

## Comandos In-Game (Chat da Twitch)

Aqui estão os comandos que podem ser usados no chat da Twitch:

### Comandos Gerais do Jogador

*   **`!entrar`**
    *   **Descrição:** Permite que um espectador entre no jogo e receba seu primeiro Digimon (um Digitama no nível 1, 0 XP). Se o espectador já estiver no jogo, ele será informado.
    *   **Quem pode usar:** Qualquer espectador.

*   **`!meudigimon`** ou **`!status`**
    *   **Descrição:** Exibe as informações atuais do Digimon do espectador, incluindo nome, estágio, nível global, XP, HP, MP, stats e saldo de moedas.
    *   **Quem pode usar:** Qualquer espectador que já tenha usado `!entrar`.

*   **`!treinar <tipo> [multiplicador]`**
    *   **Descrição:** Permite ao jogador gastar coins para treinar e melhorar um status específico do seu Digimon. Opcionalmente, pode-se especificar um multiplicador para treinar várias vezes de uma vez.
    *   **Custo Base:** `100 coins` por sessão de treino (o custo total é Custo Base * Multiplicador).
    *   **Tipos de Treino Disponíveis e Efeitos:**
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

*   **`!batalhar`**:
    *   **Descrição:** Inicia uma batalha contra o Digimon selvagem que apareceu recentemente no chat.
    *   **Requisitos:** Um Digimon selvagem deve estar anunciado; nenhuma outra batalha pode estar em andamento; seu Digimon não pode ser um Digitama e deve ter HP > 0.
    *   **Quem pode usar:** Qualquer espectador que já tenha usado `!entrar`.

*   **`!atacar`**:
    *   **Descrição:** Durante o seu turno em uma batalha, desfere um ataque básico contra o oponente. O dano considera os stats dos Digimons, bem como vantagens de Tipo (Vacina > Virus > Data > Vacina) e Atributo Elemental (Fogo > Planta > Água > Fogo, Elétrico > Vento > Terra > Elétrico, Luz <> Escuridão).
    *   **Requisitos:** Estar em uma batalha ativa e ser o seu turno.
    *   **Quem pode usar:** O jogador atualmente em batalha e em seu turno.

*   **`!fugir`** (Placeholder):
    *   **Descrição:** Tenta fugir da batalha atual. (Funcionalidade futura)
    *   **Quem pode usar:** O jogador atualmente em batalha.

### Comandos de Gerenciamento (Moderadores/Broadcaster)

*   **`!givecoins <username> <quantidade>`**
    *   **Descrição:** Dá uma quantidade especificada de moedas para o `<username>` alvo.
    *   **Exemplo:** `!givecoins espectadorLegal 100`

*   **`!removecoins <username> <quantidade>`**
    *   **Descrição:** Remove uma quantidade especificada de moedas do `<username>` alvo.
    *   **Exemplo:** `!removecoins espectadorRuim 50`

*   **`!setcoinvalue <valor>`**
    *   **Descrição:** Define o valor base das moedas para eventos futuros.
    *   **Exemplo:** `!setcoinvalue 50`

*   **`!testxp <quantidade>`**
    *   **Descrição:** Adiciona uma `<quantidade>` de XP ao Digimon do usuário que digitou o comando. Usado principalmente para testes de evolução e subida de nível.
    *   **Exemplo:** `!testxp 500`

*   **`!setdigimon <username> <nomeDoDigimon>`**
    *   **Descrição:** Altera o Digimon do `<username>` alvo para o `<nomeDoDigimon>` especificado. O Digimon do usuário será resetado para o nível e XP base do novo Digimon/estágio, conforme a `xpTable`.
    *   **Exemplo:** `!setdigimon espectadorLegal Agumon`

*   **`!resetdigibot`**
    *   **Descrição:** Realiza um reset completo do jogo. Todos os dados dos Tammers (jogadores) e configurações do bot são apagados, e o catálogo de Digimons é recarregado a partir do arquivo `src/data/digimon_catalog.json`. **Use com cuidado!**

## Estrutura do Projeto

```
.
├── frontend/         # Código do Dashboard Vue.js
│   ├── public/
│   ├── src/
│   └── package.json
├── src/              # Código do Backend Node.js
│   ├── api/          # Servidor Express e endpoints da API
│   ├── bot/          # Lógica do bot da Twitch (tmi.js), incluindo xpSystem.js, game_mechanics/, etc.
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
    ```bash
    cd frontend
    npm install
    cd ..
    ```

## Como Rodar o Projeto

Você precisará de terminais separados para rodar o backend (bot e API) e o frontend.

1.  **Para rodar o Bot da Twitch e a API RESTful simultaneamente (modo de desenvolvimento):**
    Na raiz do projeto:
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
    Em um **novo terminal**, navegue até a pasta `frontend`:
    ```bash
    cd frontend
    npm run serve
    ```
    Após iniciar, o dashboard estará acessível geralmente em `http://localhost:8080` (verifique o output do comando).

## Próximos Passos e TODOs (Sugestões)

*   Implementar verificação de "follower" para o comando `!entrar` usando a API da Twitch.
*   Expandir o catálogo `DigimonData` com mais Digimons, estágios e atributos.
*   Implementar a lógica de "chocar" o Digitama com escolha de nome (`!setname`).
*   Desenvolver as mecânicas de batalha, bosses, raids e treino.
*   Adicionar mais funcionalidades ao dashboard (ex: editar Tammers, visualizar logs do bot).
*   Melhorar o tratamento de erros e feedback para o usuário no chat.
*   Adicionar testes unitários e de integração.