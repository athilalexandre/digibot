const Tammer = require('../../../../backend/models/tammer');
const { 
  processShopCommand, 
  processWeaponPurchase, 
  processItemPurchase, 
  useItem,
  getShopStatus,
  purchaseItem
} = require('./shop_system.js');
const gameConfig = require('../../../config/gameConfig');
const weapons = require('../../../data/weapons_catalog.json');

async function processShopCommands(target, context, msg, client) {
  const message = msg.trim().toLowerCase();
  const commandParts = message.split(' ');
  const command = commandParts[0];
  const args = commandParts.slice(1);

  const twitchUserId = context['user-id'];
  const username = context.username;

  // Comando !loja
  if (command === '!loja') {
    const result = processShopCommand(username, twitchUserId);
    
    if (result.success) {
      client.say(target, result.message);
      
      // Envia DM com as armas disponíveis
      const weaponsList = result.weapons.map(w => 
        `${w.nome} ${w.emoji} (${w.raridade}) - ${w.price} bits`
      ).join('\n');
      
      const dmMessage = `🏪 LOJA ABERTA! 🏪\n\nArmas disponíveis:\n${weaponsList}\n\nUse !comprar <id_da_arma> para comprar!`;
      
      // Envia mensagem no chat principal também
      client.say(target, `${username}, verifique sua DM para ver as armas disponíveis!`);
      
      // Nota: Para enviar DM, seria necessário implementar funcionalidade específica da Twitch
      // Por enquanto, mostra no chat principal
      client.say(target, `📬 ${username}: ${dmMessage}`);
    } else {
      client.say(target, result.message);
    }
    return true;
  }

  // Comando !comprar
  if (command === '!comprar') {
    if (args.length < 1) {
      client.say(target, `${username}, uso: !comprar <id_da_arma> ou !comprar item <tipo>`);
      return true;
    }

    try {
      const tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        client.say(target, `${username}, você precisa entrar no jogo primeiro com !entrar.`);
        return true;
      }

      // Verifica se é compra de item
      if (args[0] === 'item' && args[1]) {
        const itemId = args[1];
        const result = await processItemPurchase(tammer, itemId);
        
        if (result.success) {
          await tammer.save();
          client.say(target, result.message);
          
          // Mensagem especial para armas lendárias
          if (result.item && result.item.raridade === 'lendaria') {
            client.say(target, `💫 ${username} conseguiu um item lendário: ${result.item.name}!`);
          }
        } else {
          client.say(target, result.message);
        }
        return true;
      }

      // Compra de arma
      const weaponId = args[0];
      const result = await processWeaponPurchase(tammer, weaponId);
      
      if (result.success) {
        await tammer.save();
        client.say(target, result.message);
        
        // Mensagem especial para armas lendárias
        if (result.weapon && result.weapon.raridade === 'lendaria') {
          client.say(target, `💫 ${username} conseguiu uma arma lendária: ${result.weapon.nome}!`);
        }
      } else {
        client.say(target, result.message);
      }
    } catch (error) {
      console.error(`Erro no comando !comprar para ${username}:`, error);
      client.say(target, `${username}, ocorreu um erro ao processar sua compra.`);
    }
    return true;
  }

  // Comando !usar
  if (command === '!usar') {
    if (args.length < 1) {
      client.say(target, `${username}, uso: !usar <tipo_do_item>`);
      return true;
    }

    try {
      const tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        client.say(target, `${username}, você precisa entrar no jogo primeiro com !entrar.`);
        return true;
      }

      const itemId = args[0];
      const result = await useItem(tammer, itemId);
      
      if (result.success) {
        await tammer.save();
        client.say(target, result.message);
      } else {
        client.say(target, result.message);
      }
    } catch (error) {
      console.error(`Erro no comando !usar para ${username}:`, error);
      client.say(target, `${username}, ocorreu um erro ao usar o item.`);
    }
    return true;
  }

  // Comando !inventario
  if (command === '!inventario' || command === '!inv') {
    try {
      const tammer = await Tammer.findOne({ twitchUserId });
      if (!tammer) {
        client.say(target, `${username}, você precisa entrar no jogo primeiro com !entrar.`);
        return true;
      }

      const inventoryItems = [];
      for (const [itemId, quantity] of Object.entries(tammer.inventory)) {
        if (quantity > 0) {
          const itemName = itemId === 'restaurador_energia' ? 'Restaurador de Energia' : 
                          itemId === 'xp_booster' ? 'XP Booster (1h)' : itemId;
          inventoryItems.push(`${itemName}: ${quantity}`);
        }
      }

      const equippedWeapon = tammer.equippedWeapon && tammer.equippedWeapon.id ? 
        `${tammer.equippedWeapon.nome} ${tammer.equippedWeapon.emoji} (${tammer.equippedWeapon.raridade})` : 
        'Nenhuma';

      let message = `${username}, seu inventário: Arma equipada: ${equippedWeapon}`;
      
      if (inventoryItems.length > 0) {
        message += ` | Itens: ${inventoryItems.join(', ')}`;
      } else {
        message += ` | Itens: Nenhum`;
      }

      // Mostra boosters ativos
      if (tammer.hasXpBooster()) {
        const timeLeft = Math.ceil((tammer.activeBoosts.xpBooster.expiresAt.getTime() - Date.now()) / 60000);
        message += ` | XP Booster ativo: ${timeLeft}min restantes`;
      }

      client.say(target, message);
    } catch (error) {
      console.error(`Erro no comando !inventario para ${username}:`, error);
      client.say(target, `${username}, ocorreu um erro ao verificar seu inventário.`);
    }
    return true;
  }

  // Comando !statusloja (para moderadores)
  if (command === '!statusloja') {
    const isModOrBroadcaster = context.mod || username.toLowerCase() === 'athil'; // Ajuste conforme necessário
    
    if (isModOrBroadcaster) {
      const status = getShopStatus();
      if (status.isActive) {
        const timeRemaining = Math.ceil(status.timeRemaining / 1000);
        const weaponsList = status.availableWeapons.map(w => 
          `${w.nome} (${w.raridade}) - ${w.price} bits`
        ).join(', ');
        
        client.say(target, `🏪 Loja ativa! Tempo restante: ${timeRemaining}s | Vencedor: ${status.winner || 'Nenhum'} | Armas: ${weaponsList}`);
      } else {
        client.say(target, `🏪 Loja inativa no momento.`);
      }
    }
    return true;
  }

  return false; // Não é um comando de loja
}

module.exports = {
  processShopCommands
}; 