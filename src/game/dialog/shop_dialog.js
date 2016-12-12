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
        if (this.npc.items.length > 0) {
            var effectsGenerated = [];
            for (var i in this.npc.items) {
                var item = ItemManager.getItemTemplateById(this.npc.items[i].itemId);
                for (var effect of item.possibleEffects) {
                   effectsGenerated.push(new Types.ObjectEffectDice(effect.effectId,effect.diceNum,effect.diceSide,10)); 
   
             }
        
                items.push(new Types.ObjectItemToSellInNpcShop(item._id, [], item.price, ""));
            }
        }
        this.character.client.send(new Messages.ExchangeStartOkNpcShopMessage(-this.npc._id, 0, items));
    }



    close() {
        if (this.character.client != null) {
            this.character.closeDialog(this);
            this.character.client.send(new Messages.LeaveDialogMessage(3));
        }
    }
}