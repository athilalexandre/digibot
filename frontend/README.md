# 🤖 DigiBot - Bot da Twitch para Digimon

<div align="center">
    
  [![Twitch](https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://twitch.tv/0baratta)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
</div>

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (versão 7.0 ou superior)
- [Git](https://git-scm.com/) (opcional, para clonar o repositório)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/digibot.git
cd digibot
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o MongoDB:
   - Instale o MongoDB Community Server no caminho padrão: `C:\Program Files\MongoDB\Server\7.0\`
   - Crie o diretório de dados: `C:\data\db`
   - Se você instalou o MongoDB em outro local, o bot irá solicitar o caminho na primeira execução

4. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis necessárias:
     ```
     TWITCH_USERNAME=seu_bot
     TWITCH_OAUTH=oauth:seu_token
     TWITCH_CHANNEL=seu_canal
     ```

## 🎮 Como Executar

### Iniciando o MongoDB

O bot pode iniciar o MongoDB automaticamente. Você tem duas opções:

1. Iniciar tudo de uma vez:
```bash
npm run setup
```

2. Iniciar separadamente:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run serve:auto
```

- O comando `npm run serve:auto` tentará rodar o frontend na porta 8080, mas se estiver ocupada, usará 8081, 8082, etc., automaticamente e abrirá o navegador na porta correta.

Acesse o painel no endereço informado no terminal (ex: http://localhost:8080 ou http://localhost:8081).

### Comandos Disponíveis

| Comando         | Descrição                              | Permissão  |
|-----------------|----------------------------------------|------------|
| `!entrar`       | Inicia sua jornada no DigiBot          | Todos      |
| `!meudigimon`   | Mostra status do seu Digimon           | Todos      |
| `!treinar`      | Treina seu Digimon                     | Todos      |
| `!batalhar`     | Inicia uma batalha                     | Todos      |
| `!givecoins`    | Dá coins para um jogador               | Moderador  |
| `!removecoins`  | Remove coins de um jogador             | Moderador  |
| `!setcoinvalue` | Define valor das coins                 | Moderador  |

## 🔧 Configuração do MongoDB

O bot procura o MongoDB no caminho padrão: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`

Se você instalou em outro local:
1. Na primeira execução, o bot solicitará o caminho correto
2. O caminho será salvo em `config/mongodb-config.json`
3. Você pode editar este arquivo manualmente se necessário

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

## 📱 Responsividade

A interface do DigiBot é totalmente responsiva, adaptando-se a diferentes tamanhos de tela (desktop, tablet e mobile) para garantir uma ótima experiência em qualquer dispositivo.

## 🤖 Inteligência Artificial

O DigiBot utiliza tecnologias de Inteligência Artificial para enriquecer a experiência dos usuários e moderadores. Entre as principais aplicações de IA estão:

- **Processamento de comandos inteligentes**
- **Respostas automáticas contextuais**
- **Análise de mensagens do chat**
- **Sugestão de comandos e automações**

### Tecnologias de IA utilizadas
- **OpenAI GPT** (para geração de respostas e análise de contexto)
- **APIs de Machine Learning** (para automação e sugestões)
- **Integração com serviços de IA customizados**

> O uso de IA permite que o DigiBot evolua constantemente, tornando-se mais útil, interativo e eficiente para a comunidade!

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, por favor abra uma [issue](https://github.com/seu-usuario/digibot/issues).

---

<div align="center">
  <p>Feito com ❤️ por <a href="https://github.com/athilalexandre" target="_blank">Athila Alexandre</a></p>
  <p>⭐️ Deixe uma estrela se gostou do projeto!</p>
</div>

## Estrutura do Projeto

```
frontend/
├── public/              # Arquivos públicos
├── src/                 # Código fonte
│   ├── assets/         # Recursos estáticos
│   ├── components/     # Componentes Vue
│   ├── layouts/        # Layouts da aplicação
│   ├── router/         # Configuração de rotas
│   ├── store/          # Estado global (Vuex)
│   ├── views/          # Páginas/views
│   ├── App.vue         # Componente raiz
│   └── main.js         # Ponto de entrada
├── .gitignore          # Arquivos ignorados pelo git
├── babel.config.js     # Configuração do Babel
├── package.json        # Dependências e scripts
└── vue.config.js       # Configuração do Vue CLI
```

## Funcionalidades

- Dashboard com status do bot e MongoDB
- Chat integrado com Twitch
- Lista de comandos disponíveis
- Configurações do bot
- Terminal para execução de comandos
- Interface responsiva

## Tecnologias Utilizadas

- Vue.js 2.x
- Vue Router
- Vuex
- Axios
- SASS
- Font Awesome 

--- 