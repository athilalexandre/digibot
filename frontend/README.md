# DigiBot Frontend

Interface web para o DigiBot, um bot para Twitch com tema de Digimon.

## Requisitos

- Node.js 14.x ou superior
- npm 6.x ou superior

## Instalação

1. Clone o repositório
2. Navegue até a pasta do frontend:
```bash
cd frontend
```

3. Instale as dependências:
```bash
npm install
```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run serve
```

O aplicativo estará disponível em `http://localhost:8080`.

## Build

Para criar uma versão de produção:

```bash
npm run build
```

Os arquivos compilados serão gerados na pasta `dist`.

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

--- 