# 🎮 DigiBot - Bot para Twitch com Jogo de Digimon

Este é um bot para Twitch que implementa um jogo de RPG estilo Digimon, onde os espectadores podem treinar, batalhar e evoluir seus próprios Digimons diretamente no chat.

## 🚀 Como Começar

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/digibot.git
    ```
2.  **Instale as dependências:**
    ```bash
    # Para o bot principal e backend
    cd digibot/
    npm install

    # Para o frontend (se for usar)
    cd frontend/
    npm install
    ```
3.  **Configure o bot:**
    - Renomeie `.env.example` para `.env` e preencha com suas credenciais da Twitch e do MongoDB.
4.  **Inicie o MongoDB:**
    - Certifique-se de que seu servidor MongoDB está rodando.
5.  **Atualize a base de dados (primeira vez):**
    ```bash
    node src/scripts/updateDatabase.js
    ```
6.  **Inicie o bot:**
    ```bash
    npm start
    ```

---

## Comandos Disponíveis

Aqui está a lista de comandos que os espectadores podem usar no chat da Twitch.

### Comandos para Todos

| Comando | Descrição | Exemplo |
| --- | --- | --- |
| `!entrar` | Entra no jogo e recebe seu primeiro Digitama. | `!entrar` |
| `!ficha` | Mostra seu status, do seu Digimon, seus bits e itens. | `!ficha` |
| `!treinar` | Usa Pontos de Batalha (PB) para ganhar XP. | `!treinar` |
| `!batalha` | Usa Pontos de Batalha (PB) para lutar com um Digimon selvagem por mais XP e chance de bits. Requer uma arma equipada. | `!batalha` |
| `!batalha @usuario` | Desafia outro jogador para um PvP. O vencedor ganha XP do perdedor. | `!batalha @outroplayer` |
| `!loja` | Verifica se a loja misteriosa está disponível no chat. | `!loja` |
| `!comprar <item>` | Compra um item da loja, se ela estiver aberta. | `!comprar EspadaCurta` |
| `!equipar <item>` | Equipa uma arma do seu inventário. | `!equipar Adaga` |
| `!inventario` | Mostra os itens que você possui. | `!inventario` |
| `!top5` | Exibe o ranking dos 5 jogadores com mais XP. | `!top5` |

### Comandos de Moderador/Admin

| Comando | Descrição | Exemplo |
| --- | --- | --- |
| `!givebits <user> <amount>` | Dá uma quantidade de bits a um usuário. | `!givebits user1 1000` |
| `!removebits <user> <amount>` | Remove uma quantidade de bits de um usuário. | `!removebits user1 500` |
| `!givexp <user> <amount>` | Dá uma quantidade de XP a um usuário. | `!givexp user1 2500` |
| `!removexp <user> <amount>` | Remove uma quantidade de XP de um usuário. | `!removexp user1 1000` |
| `!reloadconfig` | Recarrega as configurações do `gameConfig.js` sem precisar reiniciar o bot. | `!reloadconfig` |
| `!forceshop` | Força a aparição da loja no chat. | `!forceshop` |

---

## ⚙️ Funcionalidades Principais

-   **Sistema de Progressão:** Evolua seu Digimon por 7 estágios, de Digitama a Mega.
-   **Economia Baseada em Bits:** Ganhe bits em batalhas para gastar em treinos, armas e itens.
-   **Sistema de Armas:** Equipe armas para lutar. Sem arma, sem batalha!
-   **Pontos de Batalha (PB):** Um recurso que se regenera com o tempo, necessário para treinar e lutar.
-   **Loja de Eventos Aleatórios:** Uma loja aparece no chat em intervalos aleatórios, oferecendo armas raras por tempo limitado.
-   **Batalhas PvP:** Desafie outros jogadores e aposte seus bits.
-   **Itens e Boosters:** Compre itens como "Restaurador de Energia" e "XP Booster" para acelerar seu progresso.
-   **Configuração Centralizada:** Todas as regras do jogo (custos, recompensas, chances) são facilmente ajustáveis no arquivo `src/config/gameConfig.js`.

---

## 📜 Documentação Completa

Para uma visão detalhada sobre o balanceamento, taxas de XP, e a lógica completa do jogo, consulte o arquivo [**SISTEMA_ATUALIZADO.md**](SISTEMA_ATUALIZADO.md).
