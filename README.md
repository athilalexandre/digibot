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
npm run start:all
```

2. Iniciar separadamente:
```bash
# Terminal 1 - MongoDB
npm run start:mongodb

# Terminal 2 - Bot
npm run start
```

### Comandos Disponíveis

| Comando | Descrição | Permissão |
|---------|-----------|-----------|
| `!entrar` | Inicia sua jornada no DigiBot | Todos |
| `!meudigimon` | Mostra status do seu Digimon | Todos |
| `!treinar` | Treina seu Digimon | Todos |
| `!batalhar` | Inicia uma batalha | Todos |
| `!givecoins` | Dá coins para um jogador | Moderador |
| `!removecoins` | Remove coins de um jogador | Moderador |
| `!setcoinvalue` | Define valor das coins | Moderador |

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
  <p>Feito com ❤️ por [Seu Nome]</p>
  <p>⭐️ Deixe uma estrela se gostou do projeto!</p>
</div>
