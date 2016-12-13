import * as Messages from "../../io/dofus/messages"
import * as Types from "../../io/dofus/types"
import ItemManager from "../../game/item/item_manager"
import Basic from "../../utils/basic"

export default class ShopDialog {

    constructor(character, npc) {
        this.character = character;
        this.npc = npc;
    }

    open() {
        this.character.setDialog(this);
        var items = [];
        var action = this.npc.getAction(1);
        if (action != null) {
            this.money = action.itemId ? action.itemId : 0;
            if (this.npc.items.length > 0) {
                var effectsGenerated = [];
                for (var i in this.npc.items) {
                    var item = ItemManager.getItemTemplateById(this.npc.items[i].itemId);
                    for (var effect of item.possibleEffects) {
                        effectsGenerated.push(new Types.ObjectEffectDice(effect.effectId, effect.diceNum, effect.diceSide, Basic.getRandomInt(effect.diceNum, effect.diceSide)))
                    }
                    items.push(new Types.ObjectItemToSellInNpcShop(item._id, effectsGenerated, this.npc.items[i].price, ""));
                }
            }

            this.character.client.send(new Messages.ExchangeStartOkNpcShopMessage(-this.npc._id, this.money, items));

        } else {
            this.close();
        }
    }

    buyItem(packet) {
        if (packet.quantity <= 0) {
            this.character.client.send(new Messages.ExchangeErrorMessage(8));
        } else {
            var item = this.npc.getItem(packet.objectToBuyId);
            if (item != null) {
                var price = item.price * packet.quantity;
                if (this.canBuy(price)) {

                    var item = ItemManager.generateItemStack(parseInt(packet.objectToBuyId), packet.quantity);
                    this.character.replyLangsMessage(0, 21, [packet.quantity.toString(), packet.objectToBuyId.toString()]);
                    if (this.money == 0) {
                        this.character.subKamas(price, true);
                    } else {
                        this.character.itemBag.updateItemByTemplateIdAndQuantity(this.money, price);
                        this.character.replyLangsMessage(0, 22, [price.toString(), this.money.toString()]);

                    }
                    this.character.itemBag.add(item, true);
                    this.character.sendInventoryBag();
                    this.character.client.send(new Messages.ExchangeBuyOkMessage());

                } else {
                    this.character.client.send(new Messages.ExchangeErrorMessage(8));
                }

            } else {
                this.character.client.send(new Messages.ExchangeErrorMessage(8));

            }
        }
    }
    sellItem(packet) {
        if (packet.quantity <= 0) {
            this.character.client.send(new Messages.ExchangeErrorMessage(9));

        } else {

            var item = this.character.itemBag.getItemByID(packet.objectToSellId);
            if (item != null) {
                if (item.quantity < packet.quantity) {
                    this.character.client.send(new Messages.ExchangeErrorMessage(9));

                } else {
                    var price = Math.ceil(((ItemManager.getItemTemplateById(item.templateId).price * packet.quantity)/10));
                    this.character.itemBag.updateItemByUIDAndQuantity(item._id, packet.quantity);
                    this.character.addKamas(price.toString(), true);
                    this.character.replyLangsMessage(0, 22, [packet.quantity.toString(), item.templateId.toString()]);
                    this.character.sendInventoryBag();
                    this.character.client.send(new Messages.ExchangeSellOkMessage());

                }
            } else {

                this.character.client.send(new Messages.ExchangeErrorMessage(9));
            }

        }
    }
    canBuy(priceItem) {
        if (this.money > 0) {
            var item = this.character.itemBag.getItemByUID(this.money);
            if (item != null && item.quantity >= priceItem) {
                return true;
            }
        } else {
            if (this.character.itemBag.money >= priceItem) {
                return true;
            }
        }
        return false;
    }

    close() {
        if (this.character.client != null) {
            this.character.closeDialog(this);
            this.character.client.send(new Messages.LeaveDialogMessage(3));
        }
    }
}