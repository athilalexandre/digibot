# Digibot - Seu Bot de Digimon para a Twitch

Bem-vindo ao Digibot! Este é um bot para a Twitch que permite aos espectadores do seu canal terem seus próprios Digimons, treiná-los, evoluí-los e interagir com um sistema de economia básico.

## Funcionalidades

*   Sistema de Tammers (jogadores) com Digimons.
*   Evolução de Digimons baseada em XP.
*   Níveis globais para Digimons (1-20).
*   Catálogo de Digimons personalizável via arquivo JSON.
*   Comandos de chat para interação.
*   API para gerenciamento e visualização de dados.
*   Sistema de moedas (coins).

## Comandos In-Game (Chat da Twitch)

Aqui estão os comandos que podem ser usados no chat da Twitch:

*   **`!entrar`**
    *   **Descrição:** Permite que um espectador entre no jogo e receba seu primeiro Digimon (um Digitama). Se o espectador já estiver no jogo, ele será informado.
    *   **Quem pode usar:** Qualquer espectador.

*   **`!meudigimon`** ou **`!status`**
    *   **Descrição:** Exibe as informações atuais do Digimon do espectador, incluindo nome, estágio, nível, XP, HP, stats e saldo de moedas.
    *   **Quem pode usar:** Qualquer espectador que já tenha usado `!entrar`.

*   **`!givecoins <username> <quantidade>`**
    *   **Descrição:** Dá uma quantidade especificada de moedas para o `<username>` alvo.
    *   **Quem pode usar:** Moderadores do canal e o Broadcaster.
    *   **Exemplo:** `!givecoins espectadorLegal 100`

*   **`!setcoinvalue <valor>`**
    *   **Descrição:** Define o valor base das moedas para eventos futuros (esta funcionalidade pode ser expandida).
    *   **Quem pode usar:** Moderadores do canal e o Broadcaster.
    *   **Exemplo:** `!setcoinvalue 50`

*   **`!testxp <quantidade>`**
    *   **Descrição:** Adiciona uma `<quantidade>` de XP ao Digimon do usuário que digitou o comando. Usado principalmente para testes de evolução.
    *   **Quem pode usar:** Moderadores do canal e o Broadcaster.
    *   **Exemplo:** `!testxp 500`

*   **`!setdigimon <username> <nomeDoDigimon>`**
    *   **Descrição:** Altera o Digimon do `<username>` alvo para o `<nomeDoDigimon>` especificado. O Digimon do usuário será resetado para o nível e XP base do novo Digimon/estágio.
    *   **Quem pode usar:** Moderadores do canal e o Broadcaster.
    *   **Exemplo:** `!setdigimon espectadorLegal Agumon`

*   **`!resetdigibot`**
    *   **Descrição:** Realiza um reset completo do jogo. Todos os dados dos Tammers (jogadores) e configurações do bot são apagados, e o catálogo de Digimons é recarregado a partir do arquivo `digimon_catalog.json`. **Use com cuidado!**
    *   **Quem pode usar:** Moderadores do canal e o Broadcaster.

## Guia de Instalação e Configuração

Siga os passos abaixo para configurar e rodar o Digibot localmente.

### Pré-requisitos

*   Node.js (versão LTS recomendada)
*   MongoDB
*   Um editor de código (ex: VS Code)
*   Git

### Passo 1: Criar uma Conta de Bot na Twitch

1.  Acesse Twitch.tv e crie uma nova conta que será usada exclusivamente pelo seu bot.
    *   **Dica:** Escolha um nome de usuário que identifique claramente que é um bot (ex: `NomeDoSeuCanalBot`).
2.  (Opcional, mas recomendado) Habilite a Autenticação de Dois Fatores (2FA) nesta conta para maior segurança.

### Passo 2: Gerar um Token OAuth para o Bot

Seu bot precisa de um token OAuth para se conectar ao chat da Twitch.

1.  Acesse um gerador de tokens confiável, como o TwitchTokenGenerator.com.
2.  Clique para gerar um "Custom Scope Token" ou similar.
3.  Selecione os seguintes escopos (permissões):
    *   `chat:read` (para ler mensagens do chat)
    *   `chat:edit` (para enviar mensagens no chat)
4.  Clique em "Generate Token!".
5.  Você será redirecionado para a Twitch. **Faça login com a conta do BOT criada no Passo 1.**
6.  Autorize a aplicação.
7.  Você será redirecionado de volta, e o **Access Token** (começando com `oauth:`) e o **Client ID** serão exibidos.
    *   **Guarde esses dois valores em um local seguro.** Você precisará deles para o arquivo de configuração.

### Passo 3: Instalar e Configurar o MongoDB

1.  **Baixe e Instale o MongoDB Community Server:**
    *   Acesse o site oficial do MongoDB.
    *   Baixe o instalador para o seu sistema operacional (Windows, macOS, Linux).
    *   Siga as instruções de instalação. Durante a instalação no Windows, você pode optar por instalar o MongoDB como um serviço, o que é recomendado para que ele inicie automaticamente com o sistema.
2.  **Verifique se o MongoDB está rodando:**
    *   **Windows:** Procure por "Serviços" no menu Iniciar, encontre "MongoDB Server" e verifique se o status é "Em Execução".
    *   **macOS/Linux:** Use comandos como `sudo systemctl status mongod` ou `brew services list` (se instalado via Homebrew).
3.  (Opcional) Instale o MongoDB Compass, uma GUI para gerenciar seus bancos de dados MongoDB.

### Passo 4: Clonar o Repositório e Instalar Dependências

1.  Abra seu terminal ou prompt de comando.
2.  Navegue até o diretório onde você deseja clonar o projeto.
3.  Clone o repositório:
    ```bash
    git clone https://github.com/athilalexandre/digibot.git
    ```
4.  Entre no diretório do projeto:
    ```bash
    cd digibot
    ```
5.  Instale as dependências do Node.js:
    ```bash
    npm install
    ```

### Passo 5: Configurar o Bot

1.  No diretório raiz do projeto (`digibot`), você encontrará um arquivo chamado `src/config.js`. Este arquivo contém as configurações essenciais.
2.  Edite o arquivo `src/config.js` com os seus dados:
    ```javascript
    // config.js
    module.exports = {
      // Nome de usuário da conta do BOT da Twitch (Passo 1)
      twitchUsername: 'nomedoseubot',
      // Token OAuth gerado para o BOT (Passo 2 - Access Token)
      twitchOAuth: 'oauth:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      // Canal da Twitch onde o bot vai operar (prefixado com #)
      twitchChannel: '#nomedoseucanalprincipal',
      // String de conexão do MongoDB (deve funcionar se o MongoDB estiver rodando localmente na porta padrão)
      mongodbUri: 'mongodb://localhost:27017/digibot',
      // Porta para a API (pode deixar 3000 ou alterar se necessário)
      apiPort: 3000,
      // Client ID obtido junto com o token OAuth (Passo 2)
      twitchClientId: 'seu_client_id_aqui',
      // Outras configurações globais que seu bot/api possam precisar
    };
    ```
    *   Substitua `nomedoseubot`, `oauth:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`, `#nomedoseucanalprincipal`, e `seu_client_id_aqui` pelos valores corretos.
    *   O `mongodbUri` padrão (`mongodb://localhost:27017/digibot`) deve funcionar se você instalou o MongoDB localmente com as configurações padrão. O banco de dados `digibot` será criado automaticamente na primeira conexão se não existir.

### Passo 6: Popular o Banco de Dados com o Catálogo de Digimons

O bot usa um catálogo de Digimons definido no arquivo `src/data/digimon_catalog.json`. Para carregar esses dados no MongoDB, execute o seguinte comando no terminal, na raiz do projeto:

```bash
npm run db:seed:digimon
```
Você deve ver mensagens no console indicando que a coleção `DigimonData` foi limpa e populada.

### Passo 7: Iniciar o Bot e a API

Para iniciar o bot da Twitch e a API simultaneamente, use o seguinte comando no terminal:

```bash
npm run dev:all
```
Você deverá ver mensagens no console indicando:
*   Conexão bem-sucedida ao MongoDB.
*   O bot conectado ao chat da Twitch.
*   A API rodando (ex: `API server running on http://localhost:3000`).

Seu Digibot agora está pronto! Você pode ir ao chat do seu canal na Twitch e testar os comandos.

## Estrutura do Projeto (Simplificada)

*   `src/`
    *   `api/`: Contém a lógica do servidor Express para a API.
    *   `bot/`: Contém a lógica principal do bot da Twitch (`bot.js`, `xpSystem.js`).
    *   `config/`: Arquivo de configuração (`config.js`).
    *   `data/`: Contém o catálogo de Digimons (`digimon_catalog.json`).
    *   `database/`: Contém a lógica de conexão com o MongoDB (`connection.js`) e o script de seeding (`seedDigimonData.js`).
    *   `models/`: Contém os schemas do Mongoose para as coleções do banco de dados (Tammer, DigimonData, BotConfig).
*   `package.json`: Define os scripts e dependências do projeto.
*   `README.md`: Este arquivo.

## Contribuindo

Sinta-se à vontade para abrir issues ou pull requests se tiver sugestões de melhoria ou encontrar bugs.

---

Divirta-se com seu Digibot!
```